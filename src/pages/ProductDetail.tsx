import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { apiFetch } from "@/config/api";
import { Product } from "@/types/product";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, PackageX, X, ImageOff, ZoomIn, Sparkles, ShoppingBag, CheckCircle2 } from "lucide-react";

interface ProductDetailProps {
  id?: string;
  onNavigateBack?: () => void;
  onNavigateCatalog?: () => void;
}

/* ================================
   TYPES & INTERFACES
================================= */
type ProductApiResponse =
  | { item: Product }
  | { data: Product }
  | { product: Product }
  | Product;

interface ImageLoadState {
  isLoaded: boolean;
  hasError: boolean;
  isLoading: boolean;
}

interface ScrollPosition {
  x: number;
  y: number;
}

interface ApiError extends Error {
  name: string;
  message: string;
  code?: string;
  status?: number;
}

/* ================================
   HELPERS & UTILITIES
================================= */
const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error;
};

const extractErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message || "Error al cargar el producto";
  }
  if (typeof error === "string") {
    return error;
  }
  return "Error desconocido al cargar el producto";
};

const isAbortError = (error: unknown): boolean => {
  return isApiError(error) && error.name === "AbortError";
};

const extractProductFromResponse = (res: ProductApiResponse): Product | null => {
  if (!res) return null;
  
  const data =
    "item" in res
      ? res.item
      : "data" in res
      ? res.data
      : "product" in res
      ? res.product
      : res;

  return data ?? null;
};

const getSafeAreaStyle = (): React.CSSProperties => {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

const getScrollbarWidth = (): number => {
  return window.innerWidth - document.documentElement.clientWidth;
};

const isTouchDevice = (): boolean => {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is legacy
    navigator.msMaxTouchPoints > 0
  );
};

/* ================================
   CUSTOM HOOKS
================================= */
const useScrollLock = () => {
  const scrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });
  const isLockedRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (isLockedRef.current) return;

    scrollPositionRef.current = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
    };

    const scrollbarWidth = getScrollbarWidth();
    
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current.y}px`;
    document.body.style.left = `-${scrollPositionRef.current.x}px`;
    document.body.style.right = "0";
    document.body.style.width = "100%";
    
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const html = document.documentElement;
    html.style.overflow = "hidden";
    html.style.position = "fixed";
    html.style.width = "100%";
    html.style.height = "100%";

    isLockedRef.current = true;
  }, []);

  const unlockScroll = useCallback(() => {
    if (!isLockedRef.current) return;

    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";

    const html = document.documentElement;
    html.style.overflow = "";
    html.style.position = "";
    html.style.width = "";
    html.style.height = "";

    window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);

    isLockedRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
      }
    };
  }, [unlockScroll]);

  return { lockScroll, unlockScroll };
};

const useFocusTrap = (isActive: boolean, containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    container.addEventListener("keydown", handleTabKey);
    container.addEventListener("keydown", handleEscape);
    
    setTimeout(() => {
      firstElement?.focus();
    }, 100);

    return () => {
      container.removeEventListener("keydown", handleTabKey);
      container.removeEventListener("keydown", handleEscape);
    };
  }, [isActive, containerRef]);
};

const useImageLoader = (src: string | undefined) => {
  const [state, setState] = useState<ImageLoadState>({
    isLoaded: false,
    hasError: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!src) {
      setState({ isLoaded: false, hasError: true, isLoading: false });
      return;
    }

    setState({ isLoaded: false, hasError: false, isLoading: true });

    const img = new Image();
    
    img.onload = () => {
      setState({ isLoaded: true, hasError: false, isLoading: false });
    };

    img.onerror = () => {
      setState({ isLoaded: false, hasError: true, isLoading: false });
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return state;
};

const useKeyboardShortcuts = (callbacks: {
  onEscape?: () => void;
  onBack?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && callbacks.onEscape) {
        e.preventDefault();
        callbacks.onEscape();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft" && callbacks.onBack) {
        e.preventDefault();
        callbacks.onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callbacks]);
};

const useProductFetch = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("ID de producto no válido");
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<ProductApiResponse>(
        `/v1/products/${productId}`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      const productData = extractProductFromResponse(response);
      
      if (!productData) {
        throw new Error("Producto no encontrado");
      }

      setProduct(productData);
      setError(null);
    } catch (err: unknown) {
      if (isAbortError(err)) {
        return;
      }
      
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
};

const useViewportHeight = () => {
  const [vh, setVh] = useState<number>(window.innerHeight);

  useEffect(() => {
    const updateVh = () => {
      setVh(window.innerHeight);
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    updateVh();
    window.addEventListener("resize", updateVh);
    window.addEventListener("orientationchange", updateVh);

    return () => {
      window.removeEventListener("resize", updateVh);
      window.removeEventListener("orientationchange", updateVh);
    };
  }, []);

  return vh;
};

/* ================================
   SUB-COMPONENTS
================================= */
const ProductSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
    <motion.div 
      className="relative bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 rounded-3xl h-[350px] sm:h-[450px] lg:h-[550px] overflow-hidden"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: "200% 200%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </motion.div>
    <div className="space-y-6">
      {[12, 8, 32, 16].map((h, i) => (
        <motion.div
          key={i}
          className="bg-slate-200 rounded-2xl"
          style={{ height: `${h * 4}px` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  </div>
);

const ErrorState = ({ 
  title, 
  message, 
  onRetry 
}: { 
  title: string; 
  message: string; 
  onRetry?: () => void;
}) => (
  <div className="text-center py-20 sm:py-32">
    <motion.div 
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <PackageX className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-red-400 mb-6" />
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
        {title}
      </h2>
      <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="lg"
          className="min-h-[52px] px-8 text-lg font-semibold rounded-xl"
        >
          Reintentar
        </Button>
      )}
    </motion.div>
  </div>
);

const StockBadge = ({ inStock }: { inStock: boolean }) => {
  if (inStock) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 text-base sm:text-lg font-bold rounded-full shadow-lg shadow-emerald-500/30"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle2 className="w-5 h-5" />
        </motion.div>
        Disponible en Stock
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 text-base sm:text-lg font-bold rounded-full shadow-lg shadow-red-500/30"
    >
      <X className="w-5 h-5" />
      Sin Stock
    </motion.div>
  );
};

const ProductImage = ({
  src,
  alt,
  onClick,
}: {
  src: string;
  alt: string;
  onClick: () => void;
}) => {
  const imageState = useImageLoader(src);
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (imageState.isLoading && !imageError) {
    return (
      <div className="w-full h-[350px] sm:h-[450px] lg:h-[550px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
        <Loader2 className="w-16 h-16 animate-spin text-blue-500 relative z-10" />
      </div>
    );
  }

  if (imageState.hasError || imageError) {
    return (
      <div className="w-full h-[350px] sm:h-[450px] lg:h-[550px] flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
        <ImageOff className="w-20 h-20 mb-4" />
        <p className="text-xl font-semibold">Sin imagen disponible</p>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      className="relative w-full group cursor-pointer focus:outline-none rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-200/50"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      aria-label="Ver imagen en tamaño completo"
      type="button"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      <div className="relative">
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          className="w-full h-[350px] sm:h-[450px] lg:h-[550px] object-contain p-8"
          loading="lazy"
          decoding="async"
        />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-8"
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-2 shadow-xl">
            <ZoomIn className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-700">Ver en grande</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
};

const ImageModal = ({
  isOpen,
  imageSrc,
  imageAlt,
  onClose,
}: {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { lockScroll, unlockScroll } = useScrollLock();
  
  useFocusTrap(isOpen, modalRef);
  useViewportHeight();

  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isOpen, lockScroll, unlockScroll]);

  useKeyboardShortcuts({
    onEscape: onClose,
  });

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const preventTouchMove = (e: TouchEvent) => {
      if (e.target === modalRef.current) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4 sm:p-6 backdrop-blur-sm"
        style={{
          ...getSafeAreaStyle(),
          height: "100dvh",
        }}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        role="dialog"
        aria-modal="true"
        aria-label="Vista ampliada de imagen"
      >
        <motion.div
          className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </motion.div>

        <motion.button
          className="fixed top-4 right-4 sm:top-6 sm:right-6 min-h-[52px] min-w-[52px] sm:min-h-[56px] sm:min-w-[56px] rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white shadow-2xl border-2 border-white/30 flex items-center justify-center"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Cerrar vista ampliada"
          type="button"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
        </motion.button>

        <div className="fixed bottom-6 left-0 right-0 text-center px-4 sm:bottom-8 pointer-events-none">
          <motion.p
            className="text-white/90 text-sm sm:text-base font-medium bg-black/40 backdrop-blur-sm rounded-full px-6 py-3 inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {isTouchDevice()
              ? "Toca fuera de la imagen para cerrar"
              : "Presiona ESC o haz clic fuera para cerrar"}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const AddToCartButton = ({
  product,
  inCart,
  onAdd,
}: {
  product: Product;
  inCart: boolean;
  onAdd: (product: Product) => void;
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = useCallback(() => {
    if (isAdding || inCart || !product.inStock) return;

    setIsAdding(true);
    onAdd(product);

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  }, [isAdding, inCart, product, onAdd]);

  const isDisabled = !product.inStock || inCart || isAdding;

  return (
    <motion.button
      disabled={isDisabled}
      onClick={handleClick}
      className={`
        relative w-full min-h-[64px] sm:min-h-[72px] text-xl font-bold rounded-2xl shadow-2xl
        overflow-hidden group
        ${isDisabled 
          ? 'bg-slate-300 cursor-not-allowed' 
          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-purple-500/50'
        }
        disabled:opacity-60 transition-all duration-300
      `}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      aria-label={inCart ? "Producto agregado" : "Agregar producto a consulta"}
    >
      {!isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      )}

      {!isDisabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
      )}

      <span className="relative z-10 flex items-center justify-center gap-3 text-white">
        {isAdding && <Loader2 className="w-6 h-6 animate-spin" />}
        {inCart ? (
          <>
            <CheckCircle2 className="w-6 h-6" />
            Agregado a Consulta
          </>
        ) : (
          <>
            <ShoppingBag className="w-6 h-6" />
            Agregar a Consulta
          </>
        )}
      </span>

      {!isDisabled && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </motion.div>
      )}
    </motion.button>
  );
};

/* ================================
   MAIN COMPONENT
================================= */
const ProductDetail = ({
  id,
  onNavigateBack,
  onNavigateCatalog,
}: ProductDetailProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const productId = useMemo(() => id || paramId, [id, paramId]);

  const { addToCart, isInCart } = useCart();
  const { product, isLoading, error, refetch } = useProductFetch(productId);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useViewportHeight();

  const inCart = useMemo(() => {
    return product ? isInCart(product.id) : false;
  }, [product, isInCart]);

  const handleBack = useCallback(() => {
    if (onNavigateBack) {
      onNavigateBack();
    } else if (onNavigateCatalog) {
      onNavigateCatalog();
    } else {
      window.history.back();
    }
  }, [onNavigateBack, onNavigateCatalog]);

  const handleOpenModal = useCallback(() => {
    if (!product?.image) return;
    setIsImageModalOpen(true);
  }, [product]);

  const handleCloseModal = useCallback(() => {
    setIsImageModalOpen(false);
  }, []);

  const handleAddToCart = useCallback(
    (prod: Product) => {
      addToCart(prod);
    },
    [addToCart]
  );

  useKeyboardShortcuts({
    onEscape: isImageModalOpen ? handleCloseModal : undefined,
    onBack: handleBack,
  });

  useEffect(() => {
    if (product?.image) {
      const img = new Image();
      img.src = product.image;
    }
  }, [product]);

  return (
    <div 
      className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden"
      style={{
        ...getSafeAreaStyle(),
        minHeight: "100dvh",
      }}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.button
          onClick={handleBack}
          className="mb-6 sm:mb-8 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Volver atrás"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          Volver
        </motion.button>

        {isLoading && <ProductSkeleton />}

        {!isLoading && error && (
          <ErrorState
            title="Error al cargar"
            message={error}
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && !product && (
          <ErrorState
            title="Producto no encontrado"
            message="Este producto no existe o fue eliminado del catálogo."
          />
        )}

        {!isLoading && !error && product && (
          <motion.div
            className="grid lg:grid-cols-2 gap-8 lg:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              {product.image ? (
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  onClick={handleOpenModal}
                />
              ) : (
                <div className="w-full h-[350px] sm:h-[450px] lg:h-[550px] flex flex-col items-center justify-center text-slate-400 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-600">
                  <ImageOff className="w-20 h-20 mb-4" />
                  <p className="text-xl font-semibold">Sin imagen disponible</p>
                </div>
              )}
            </div>

            <div className="space-y-6 sm:space-y-8">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight tracking-tight">
                  {product.name}
                </h1>

                <StockBadge inStock={product.inStock} />
              </motion.div>

              {product.description && (
                <motion.div
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Descripción
                  </h2>
                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AddToCartButton
                  product={product}
                  inCart={inCart}
                  onAdd={handleAddToCart}
                />
              </motion.div>

              {product.image && (
                <motion.p
                  className="text-slate-400 text-center text-sm sm:text-base bg-white/5 backdrop-blur-sm rounded-full py-3 px-4 border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  💡 Toca la imagen para verla en tamaño completo
                </motion.p>
              )}

              {!product.inStock && (
                <motion.div 
                  className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm p-4 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-amber-200 text-sm sm:text-base font-medium">
                    ⚠️ Este producto no está disponible actualmente. Puedes agregarlo
                    a tu consulta para recibir notificaciones cuando vuelva a estar
                    en stock.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {product && (
        <ImageModal
          isOpen={isImageModalOpen}
          imageSrc={product.image || ""}
          imageAlt={product.name}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductDetail;