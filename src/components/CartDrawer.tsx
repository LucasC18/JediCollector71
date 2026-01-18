import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, Loader2, Package, CheckCircle2, Sparkles } from "lucide-react";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createConsultation } from "@/services/consultations.service";
import { WHATSAPP_NUMBER } from "@/config/api";

/* ================================
   TYPES & INTERFACES
================================= */
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  id: string;
  name: string;
  image?: string;
  category?: string;
  quantity?: number;
}

interface ConsultationItem {
  productId: string;
  qty: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

/* ================================
   CONSTANTS
================================= */
const TOAST_DURATION = 2000;
const CLEAR_CART_DELAY = 500;
const ANIMATION_DURATION = 0.2;
const ITEM_ANIMATION_DELAY = 0.05;

/* ================================
   HELPERS & UTILITIES
================================= */
const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error;
};

const extractErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message || "No se pudo enviar la consulta";
  }
  if (typeof error === "string") {
    return error;
  }
  return "Error desconocido";
};

const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isSafariBrowser = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const openWhatsApp = (url: string): void => {
  const needsDirectNavigation = isIOSDevice() || isSafariBrowser();

  if (needsDirectNavigation) {
    window.location.href = url;
  } else {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      window.location.href = url;
    }
  }
};

const getSafeAreaStyle = (): React.CSSProperties => {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

/* ================================
   CUSTOM HOOKS
================================= */
const useScrollLock = (isLocked: boolean) => {
  const scrollPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isLocked) return;

    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isLocked]);
};

/* ================================
   SUB-COMPONENTS
================================= */
const CartHeader = ({ itemCount }: { itemCount: number }) => (
  <SheetHeader className="pb-6 border-b border-slate-200/10 relative">
    {/* Subtle glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-violet-500/5 blur-2xl" />
    
    <SheetTitle className="flex items-center justify-between gap-3 relative z-10">
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 border border-violet-400/20 shadow-lg shadow-violet-500/10">
          <ShoppingBag className="w-5 h-5 text-violet-300" />
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Mi Consulta
        </span>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 25,
          delay: 0.2 
        }}
      >
        <Badge className="relative px-3.5 py-1.5 bg-gradient-to-r from-violet-500/90 to-fuchsia-500/90 text-white border-0 font-semibold shadow-lg shadow-violet-500/25 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2
            }}
          />
          <span className="relative z-10">{itemCount}</span>
        </Badge>
      </motion.div>
    </SheetTitle>
  </SheetHeader>
);

const EmptyCart = () => (
  <motion.div 
    className="flex-1 flex flex-col items-center justify-center gap-6 py-12"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <motion.div 
      className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-700/20 border border-slate-600/30 shadow-2xl"
      animate={{ 
        y: [0, -8, 0],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <ShoppingBag className="w-16 h-16 text-slate-500" />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
    
    <div className="text-center space-y-2">
      <p className="text-lg font-semibold bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
        Tu consulta está vacía
      </p>
      <p className="text-sm text-slate-500">Agregá productos para consultar</p>
    </div>
  </motion.div>
);

const CartItemImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex-shrink-0 border border-slate-600/40 relative overflow-hidden">
        <Package className="w-8 h-8 text-slate-500 relative z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-600/40 shadow-lg group-hover:border-violet-500/30 transition-colors duration-300">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

const CartItemCard = ({
  item,
  index,
  onRemove,
  reduceMotion,
}: {
  item: CartItem;
  index: number;
  onRemove: (id: string, name: string) => void;
  reduceMotion: boolean;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(item.id, item.name);
  }, [item.id, item.name, onRemove]);

  return (
    <motion.div
      key={item.id}
      layout
      initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { 
        opacity: 0, 
        x: 20,
        transition: { duration: 0.2 }
      }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 0.3,
              delay: index * 0.04,
              ease: "easeOut"
            }
      }
      className="group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/40 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
      whileHover={reduceMotion ? undefined : { 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
    >
      {/* Subtle hover glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <CartItemImage src={item.image} alt={item.name} />

      <div className="flex-1 min-w-0 relative z-10">
        <p className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-white transition-colors duration-200">
          {item.name}
        </p>
        {item.category && (
          <Badge
            variant="secondary"
            className="text-xs bg-violet-500/15 text-violet-300 border-violet-500/25 hover:bg-violet-500/20 transition-colors duration-200"
          >
            {item.category}
          </Badge>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={handleRemove}
          className="min-w-[44px] min-h-[44px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 hover:border-rose-500/40 transition-all duration-200 flex-shrink-0 touch-manipulation relative z-10 hover:shadow-lg hover:shadow-rose-500/20"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

const CartActions = ({
  onWhatsAppClick,
  onClearClick,
  isLoading,
}: {
  onWhatsAppClick: () => void;
  onClearClick: () => void;
  isLoading: boolean;
}) => (
  <div className="pt-6 border-t border-slate-200/10 space-y-3 relative">
    {/* Subtle top glow */}
    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
    
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Button
        onClick={onWhatsAppClick}
        disabled={isLoading}
        size="lg"
        className="relative w-full h-14 text-base font-semibold overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-0 shadow-xl shadow-emerald-900/30 touch-manipulation disabled:opacity-50 transition-all duration-300 group"
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1
          }}
        />
        
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin relative z-10" />
            <span className="relative z-10">Enviando…</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
            <span className="relative z-10">Consultar por WhatsApp</span>
            <motion.div
              className="absolute right-4"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-white/60" />
            </motion.div>
          </>
        )}
      </Button>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Button
        variant="outline"
        onClick={onClearClick}
        size="lg"
        className="w-full h-12 text-base font-semibold bg-slate-800/40 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border-slate-700/40 hover:border-rose-500/30 transition-all duration-300 touch-manipulation hover:shadow-lg hover:shadow-rose-500/10 group"
        aria-label="Vaciar consulta"
      >
        <Trash2 className="w-4.5 h-4.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
        Vaciar consulta
      </Button>
    </motion.div>
  </div>
);

const ClearConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-xl border-slate-600/40 max-w-md shadow-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
          <motion.div 
            className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/25 relative overflow-hidden"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Trash2 className="w-5 h-5 text-rose-400 relative z-10" />
            <motion.div
              className="absolute inset-0 bg-rose-500/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          ¿Vaciar consulta?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-slate-400 leading-relaxed pt-3">
          Se eliminarán todos los productos de tu consulta. Esta acción no se puede deshacer.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-3 sm:gap-3 pt-2">
        <motion.div 
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertDialogCancel className="w-full h-11 text-sm font-semibold bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border-slate-600/40 hover:border-slate-500/40 touch-manipulation transition-all duration-200">
            Cancelar
          </AlertDialogCancel>
        </motion.div>
        <motion.div 
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white touch-manipulation shadow-lg shadow-rose-900/30 transition-all duration-200 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10">Vaciar</span>
          </AlertDialogAction>
        </motion.div>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/* ================================
   MAIN COMPONENT
================================= */
const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion() || false;

  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useScrollLock(isOpen);

  const itemCount = useMemo(() => items.length, [items.length]);
  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  const handleWhatsAppClick = useCallback(async () => {
    if (isEmpty) return;

    if (!WHATSAPP_NUMBER) {
      toast({
        title: "❌ Configuración faltante",
        description: "No está configurado el número de WhatsApp",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const consultationItems: ConsultationItem[] = items.map((item) => ({
        productId: item.id,
        qty: item.quantity ?? 1,
      }));

      const response = await createConsultation(consultationItems);

      if (!response.whatsappMessage) {
        throw new Error("No se pudo generar el mensaje de WhatsApp");
      }

      const phone = formatPhoneNumber(WHATSAPP_NUMBER);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        response.whatsappMessage
      )}`;

      openWhatsApp(whatsappUrl);

      setTimeout(() => {
        clearCart();
        onClose();
      }, CLEAR_CART_DELAY);

      toast({
        description: (
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Consulta enviada
              </p>
              <p className="text-xs text-slate-400">Abriendo WhatsApp...</p>
            </div>
          </div>
        ),
        duration: TOAST_DURATION,
        className: "bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40",
      });
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      toast({
        title: "❌ Error al enviar",
        description: errorMessage || "No se pudo enviar la consulta. Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isEmpty, items, clearCart, onClose, toast]);

  const handleRemove = useCallback(
    (id: string, name: string) => {
      removeFromCart(id);
      toast({
        description: (
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-white">Producto eliminado</p>
              <p className="text-xs text-slate-400">{name}</p>
            </div>
          </div>
        ),
        duration: TOAST_DURATION,
        className: "bg-slate-900/95 backdrop-blur-md border border-slate-700/50",
      });
    },
    [removeFromCart, toast]
  );

  const handleClear = useCallback(() => {
    clearCart();
    setShowClearDialog(false);
    toast({
      description: (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-violet-400" />
          <p className="text-sm font-semibold text-white">Consulta vaciada</p>
        </div>
      ),
      duration: TOAST_DURATION,
      className: "bg-slate-900/95 backdrop-blur-md border border-slate-700/50",
    });
  }, [clearCart, toast]);

  const handleClearClick = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const handleDialogChange = useCallback((open: boolean) => {
    setShowClearDialog(open);
  }, []);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          className="w-full sm:max-w-lg flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 backdrop-blur-xl border-slate-600/30 relative overflow-hidden"
          style={getSafeAreaStyle()}
        >
          {/* Ambient background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <CartHeader itemCount={itemCount} />

            {isEmpty ? (
              <EmptyCart />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-5 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600/50 transition-colors">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={handleRemove}
                        reduceMotion={prefersReducedMotion}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <CartActions
                  onWhatsAppClick={handleWhatsAppClick}
                  onClearClick={handleClearClick}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ClearConfirmDialog
        isOpen={showClearDialog}
        onOpenChange={handleDialogChange}
        onConfirm={handleClear}
      />
    </>
  );
};

export default CartDrawer;