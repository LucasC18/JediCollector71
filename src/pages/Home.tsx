import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { Sparkles, ChevronDown, ArrowRight, Star, Loader2, Zap, Package } from "lucide-react";
import heroImage from "@/assets/hero-starwars.jpg";
import { apiFetch } from "@/config/api";
import { Product } from "@/types/product";
import ProductGrid from "@/components/ProductGrid";

/* ================================
   TYPES & INTERFACES
================================= */
interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface FeaturedApiResponse {
  items: Product[];
  total?: number;
  page?: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

/* ================================
   CONSTANTS
================================= */
const FEATURED_PRODUCTS_LIMIT = 4;
const MAX_VISIBLE_COLLECTIONS = 2;
const SCROLL_BEHAVIOR: ScrollBehavior = "smooth";

/* ================================
   DEVICE DETECTION (Performance)
================================= */
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Detectar dispositivos de bajo rendimiento con tipos seguros
      const nav = navigator as NavigatorWithMemory;
      const cores = navigator.hardwareConcurrency || 4;
      const memory = nav.deviceMemory || 4;
      setIsLowEnd(cores <= 2 || memory <= 2);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isLowEnd };
};

/* ================================
   HELPERS & UTILITIES
================================= */
const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error;
};

const extractErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message || "Error al cargar datos";
  }
  if (typeof error === "string") {
    return error;
  }
  return "Error desconocido";
};

const getSafeAreaStyle = (): React.CSSProperties => {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

const getViewportHeight = (): string => {
  return "calc(100dvh - 64px)";
};

const smoothScrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const navbarHeight = 64;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - navbarHeight;

  window.scrollTo({
    top: offsetPosition,
    behavior: SCROLL_BEHAVIOR,
  });
};

const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
};

const debounce = <T extends (...args: never[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/* ================================
   CUSTOM HOOKS
================================= */
const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCollections = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<Collection[]>("/v1/collections", {
        signal: abortControllerRef.current.signal,
      });

      setCollections(response || []);
    } catch (err: unknown) {
      if (isApiError(err) && err.name === "AbortError") {
        return;
      }
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCollections]);

  return { collections, isLoading, error, refetch: fetchCollections };
};

const useFeaturedProducts = (limit: number = FEATURED_PRODUCTS_LIMIT) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<FeaturedApiResponse>(
        `/v1/products?featured=true&limit=${limit}`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      setProducts(response.items || []);
    } catch (err: unknown) {
      if (isApiError(err) && err.name === "AbortError") {
        return;
      }
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
};

const useViewportHeight = () => {
  const [vh, setVh] = useState<number>(window.innerHeight);

  useEffect(() => {
    const updateVh = () => {
      const newVh = window.innerHeight;
      setVh(newVh);
      document.documentElement.style.setProperty("--vh", `${newVh * 0.01}px`);
    };

    updateVh();

    const debouncedUpdate = debounce(updateVh, 150);

    window.addEventListener("resize", debouncedUpdate);
    window.addEventListener("orientationchange", updateVh);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("orientationchange", updateVh);
    };
  }, []);

  return vh;
};

const useImagePreload = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    preloadImage(src)
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(false));
  }, [src]);

  return isLoaded;
};

/* ================================
   OPTIMIZED BACKGROUND (GPU Accelerated)
================================= */
const OptimizedBackground = ({ isMobile, isLowEnd, prefersReducedMotion }: { 
  isMobile: boolean; 
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
}) => {
  // No animaciones si el usuario lo prefiere o es low-end
  if (prefersReducedMotion || isLowEnd) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-2xl" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Burbuja principal - siempre visible */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full ${isMobile ? 'blur-xl' : 'blur-3xl'}`}
        style={{ willChange: "transform" }}
        animate={{ 
          scale: [1, 1.15, 1],
          x: [0, isMobile ? 20 : 50, 0],
          y: [0, isMobile ? 15 : 30, 0]
        }}
        transition={{ 
          duration: isMobile ? 10 : 8,
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Burbujas adicionales - solo desktop */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform" }}
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
              y: [0, -25, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform" }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
};

/* ================================
   SUB-COMPONENTS
================================= */
const HeroBackground = ({ imageSrc, isMobile, prefersReducedMotion }: { 
  imageSrc: string;
  isMobile: boolean;
  prefersReducedMotion: boolean;
}) => {
  const isImageLoaded = useImagePreload(imageSrc);

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { scale: 1.1 }}
      animate={prefersReducedMotion ? undefined : { scale: 1 }}
      transition={prefersReducedMotion ? undefined : { duration: 1.5, ease: "easeOut" }}
      className="absolute inset-0"
    >
      {!isImageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-pulse" />
      )}

      <img
        src={imageSrc}
        alt="Hero background"
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="eager"
        decoding="async"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
      
      {/* Overlay sutil - solo desktop */}
      {!isMobile && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};

const HeroBadge = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => (
  <motion.div 
    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/40 rounded-full mb-8 shadow-2xl shadow-amber-500/20"
    animate={prefersReducedMotion ? undefined : {
      boxShadow: [
        "0 0 20px rgba(251, 191, 36, 0.2)",
        "0 0 30px rgba(251, 191, 36, 0.4)",
        "0 0 20px rgba(251, 191, 36, 0.2)",
      ],
    }}
    transition={prefersReducedMotion ? undefined : {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <Sparkles className="w-5 h-5 text-amber-400" />
    <span className="text-base font-bold text-amber-200">
      🎯 Colecciones Exclusivas
    </span>
  </motion.div>
);

const HeroTitle = () => (
  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
    <span className="text-white drop-shadow-2xl">Jedi</span>
    <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
      {" "}Collector71
    </span>
  </h1>
);

const HeroDescription = () => (
  <p className="text-slate-200 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed px-4 drop-shadow-lg">
    Explorá nuestros personajes organizados por colección. Elegí una y
    encontrá tu próximo favorito. 🧱✨
  </p>
);

const CollectionButtons = ({
  collections,
  isLoading,
  prefersReducedMotion,
}: {
  collections: Collection[];
  isLoading: boolean;
  prefersReducedMotion: boolean;
}) => {
  const visibleCollections = useMemo(
    () => collections.slice(0, MAX_VISIBLE_COLLECTIONS),
    [collections]
  );

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-4 mb-12 w-full max-w-2xl">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="px-12 py-5 min-h-[64px] min-w-[200px] rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 mb-12 w-full max-w-2xl"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.5, ease: "easeOut" }}
    >
      {visibleCollections.map((collection, index) => (
        <motion.div
          key={collection.id}
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 0.4,
                  delay: 0.6 + index * 0.1,
                  ease: "easeOut",
                }
          }
        >
          <Link
            to={`/catalogo?collection=${collection.slug}`}
            className="group relative inline-block"
            aria-label={`Ver colección ${collection.name}`}
          >
            {/* Glow effect - solo hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            
            <div className="relative px-12 py-5 min-h-[64px] min-w-[200px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 font-bold text-lg text-white transition-all duration-300 hover:bg-white/20 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95">
              <Package className="w-5 h-5 mr-2" />
              {collection.name}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

const FeaturedButton = ({ onClick, prefersReducedMotion }: { 
  onClick: () => void;
  prefersReducedMotion: boolean;
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      className="group relative px-12 py-5 min-h-[64px] min-w-[220px] font-bold text-xl rounded-2xl overflow-hidden shadow-2xl"
      aria-label="Ver productos destacados"
    >
      {/* Animated gradient - solo si no prefiere movimiento reducido */}
      {!prefersReducedMotion ? (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      )}
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
      
      <span className="relative z-10 flex items-center justify-center gap-2 text-white">
        <Zap className="w-5 h-5" />
        Ver Destacados
      </span>
    </motion.button>
  );
};

const ScrollIndicator = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => (
  <motion.div
    className="absolute bottom-8"
    animate={
      prefersReducedMotion
        ? undefined
        : { y: [0, 12, 0] }
    }
    transition={
      prefersReducedMotion
        ? undefined
        : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }
    }
  >
    <div className="flex flex-col items-center gap-2">
      <ChevronDown className="w-8 h-8 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
      <span className="text-sm text-slate-300 font-medium">Scrolleá para ver más</span>
    </div>
  </motion.div>
);

const LoadingSpinner = ({ message }: { message?: string }) => (
  <div className="text-center py-32">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="inline-block mb-6"
    >
      <Loader2 className="w-16 h-16 text-purple-400" />
    </motion.div>
    <p className="text-slate-300 text-xl font-medium">{message || "Cargando..."}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <motion.div 
    className="text-center py-32"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
      <Package className="w-20 h-20 text-slate-500 mx-auto mb-4" />
      <p className="text-slate-400 text-xl font-medium">{message}</p>
    </div>
  </motion.div>
);

const SectionTitle = ({ title, prefersReducedMotion }: { 
  title: string;
  prefersReducedMotion: boolean;
}) => (
  <motion.div 
    className="flex items-center justify-center gap-4 mb-16"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <motion.div
      animate={prefersReducedMotion ? undefined : { rotate: [0, 360] }}
      transition={prefersReducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: "linear" }}
    >
      <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
    </motion.div>
    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
      {title}
    </h2>
    <motion.div
      animate={prefersReducedMotion ? undefined : { rotate: [360, 0] }}
      transition={prefersReducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: "linear" }}
    >
      <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
    </motion.div>
  </motion.div>
);

const CatalogButton = () => (
  <motion.div 
    className="text-center mt-20"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <Link
      to="/catalogo"
      className="group relative inline-block"
      aria-label="Ver catálogo completo de productos"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
      
      <div className="relative inline-flex items-center gap-3 px-12 py-5 min-h-[64px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-lg text-white hover:bg-white/20 transition-all duration-300 shadow-2xl">
        Ver Catálogo Completo
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  </motion.div>
);

const FeaturedSection = ({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Cargando productos destacados..." />;
  }

  if (products.length === 0) {
    return <EmptyState message="No hay productos destacados todavía 🔍" />;
  }

  return (
    <motion.div 
      className="flex justify-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-6xl">
        <ProductGrid products={products} />
      </div>
    </motion.div>
  );
};

/* ================================
   MAIN COMPONENT
================================= */
const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion() || false;
  const { isMobile, isLowEnd } = useDeviceDetection();

  const { collections, isLoading: isLoadingCollections } = useCollections();
  const { products: featuredProducts, isLoading: isLoadingFeatured } = useFeaturedProducts();

  useViewportHeight();

  const handleScrollToFeatured = useCallback(() => {
    smoothScrollToElement("featured");
  }, []);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  useEffect(() => {
    preloadImage(heroImage).catch(() => {
      // Silencioso
    });
  }, []);

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden"
      style={getSafeAreaStyle()}
    >
      {/* Optimized Background - Adaptativo según dispositivo */}
      <OptimizedBackground 
        isMobile={isMobile} 
        isLowEnd={isLowEnd}
        prefersReducedMotion={prefersReducedMotion}
      />

      <Navbar onCartClick={handleCartOpen} />

      {/* ================= HERO SECTION ================= */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: getViewportHeight() }}
      >
        <HeroBackground 
          imageSrc={heroImage}
          isMobile={isMobile}
          prefersReducedMotion={prefersReducedMotion}
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 50 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 0.8, delay: 0.3, ease: "easeOut" }
            }
            className="w-full flex flex-col items-center"
          >
            <HeroBadge prefersReducedMotion={prefersReducedMotion} />
            <HeroTitle />
            <HeroDescription />

            <CollectionButtons
              collections={collections}
              isLoading={isLoadingCollections}
              prefersReducedMotion={prefersReducedMotion}
            />

            <FeaturedButton 
              onClick={handleScrollToFeatured}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>

          <ScrollIndicator prefersReducedMotion={prefersReducedMotion} />
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS SECTION ================= */}
      <main id="featured" className="relative w-full px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            title="Productos Destacados"
            prefersReducedMotion={prefersReducedMotion}
          />

          <FeaturedSection
            products={featuredProducts}
            isLoading={isLoadingFeatured}
          />

          <CatalogButton />
        </div>
      </main>

      {/* ================= CART DRAWER ================= */}
      <CartDrawer isOpen={isCartOpen} onClose={handleCartClose} />
    </div>
  );
};

export default Home;