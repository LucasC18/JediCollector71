import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, Loader2, Package, X, Sparkles, CheckCircle2 } from "lucide-react";
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
const CartHeader = ({ itemCount, reduceMotion }: { itemCount: number; reduceMotion: boolean }) => (
  <SheetHeader className="pb-6 border-b border-white/10">
    <SheetTitle className="flex items-center justify-between gap-3 text-white">
      <div className="flex items-center gap-3">
        <motion.div
          className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg"
          animate={reduceMotion ? undefined : {
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 30px rgba(168, 85, 247, 0.4)",
              "0 0 20px rgba(59, 130, 246, 0.3)",
            ],
          }}
          transition={reduceMotion ? undefined : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ShoppingBag className="w-6 h-6 text-blue-400" />
        </motion.div>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Mi Consulta
        </span>
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Badge className="text-base px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500/50 font-bold shadow-lg">
          {itemCount}
        </Badge>
      </motion.div>
    </SheetTitle>
  </SheetHeader>
);

const EmptyCart = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center gap-6 py-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="p-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl"
      animate={reduceMotion ? undefined : {
        scale: [1, 1.05, 1],
      }}
      transition={reduceMotion ? undefined : {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <ShoppingBag className="w-20 h-20 text-slate-500" />
    </motion.div>
    <div className="text-center space-y-2">
      <p className="text-xl font-bold text-white">
        Tu consulta está vacía
      </p>
      <p className="text-sm text-slate-400">Agregá productos para consultar 🧱</p>
    </div>
  </motion.div>
);

const CartItemImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 flex-shrink-0 border border-white/10">
        <Package className="w-10 h-10 text-slate-600" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
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
      initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
      animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: 20, scale: 0.9 }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: ANIMATION_DURATION,
              delay: index * ITEM_ANIMATION_DELAY,
            }
      }
      whileHover={reduceMotion ? undefined : { scale: 1.02, x: 5 }}
      className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none" />

      <CartItemImage src={item.image} alt={item.name} />

      <div className="relative flex-1 min-w-0">
        <p className="font-bold text-base text-white line-clamp-2 leading-snug mb-2">
          {item.name}
        </p>
        {item.category && (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30"
          >
            {item.category}
          </Badge>
        )}
      </div>

      <motion.div
        whileHover={reduceMotion ? undefined : { scale: 1.1, rotate: 5 }}
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={handleRemove}
          className="relative min-w-[44px] min-h-[44px] rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all flex-shrink-0 touch-manipulation shadow-lg"
          aria-label={`Eliminar ${item.name}`}
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

const CartActions = ({
  onWhatsAppClick,
  onClearClick,
  isLoading,
  reduceMotion,
}: {
  onWhatsAppClick: () => void;
  onClearClick: () => void;
  isLoading: boolean;
  reduceMotion: boolean;
}) => (
  <div className="pt-6 border-t border-white/10 space-y-3">
    <motion.div
      whileHover={reduceMotion || isLoading ? undefined : { scale: 1.02, y: -2 }}
      whileTap={reduceMotion || isLoading ? undefined : { scale: 0.98 }}
    >
      <Button
        onClick={onWhatsAppClick}
        disabled={isLoading}
        size="lg"
        className="group relative w-full min-h-[60px] text-base font-bold overflow-hidden shadow-2xl touch-manipulation disabled:opacity-50"
      >
        {/* Animated gradient background */}
        {!isLoading && !reduceMotion ? (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600" />
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

        <span className="relative z-10 flex items-center justify-center text-white">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <MessageCircle className="w-5 h-5 mr-2" />
              💬 Consultar por WhatsApp
            </>
          )}
        </span>
      </Button>
    </motion.div>

    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      <Button
        variant="outline"
        onClick={onClearClick}
        size="lg"
        className="w-full min-h-[52px] text-base font-bold bg-white/5 backdrop-blur-sm hover:bg-red-500/10 text-slate-300 hover:text-red-400 border-white/10 hover:border-red-500/50 transition-all duration-300 touch-manipulation shadow-lg"
        aria-label="Vaciar consulta"
      >
        <Trash2 className="w-5 h-5 mr-2" />
        Vaciar consulta
      </Button>
    </motion.div>
  </div>
);

const ClearConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  reduceMotion,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reduceMotion: boolean;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-slate-950/98 backdrop-blur-xl border-white/10 max-w-md shadow-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-2xl font-black text-white flex items-center gap-3">
          <motion.div
            className="p-2 rounded-full bg-red-500/20 border border-red-500/30"
            animate={reduceMotion ? undefined : {
              scale: [1, 1.1, 1],
            }}
            transition={reduceMotion ? undefined : {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Trash2 className="w-6 h-6 text-red-400" />
          </motion.div>
          ¿Vaciar consulta?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-base text-slate-400 leading-relaxed pt-2">
          Se eliminarán todos los productos de tu consulta. Esta acción no se
          puede deshacer. ⚠️
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-3 sm:gap-3">
        <motion.div
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          className="flex-1"
        >
          <AlertDialogCancel className="w-full min-h-[52px] text-base font-bold bg-white/5 backdrop-blur-sm hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20 touch-manipulation">
            Cancelar
          </AlertDialogCancel>
        </motion.div>
        <motion.div
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          className="flex-1"
        >
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full min-h-[52px] text-base font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white touch-manipulation shadow-lg hover:shadow-red-500/50"
          >
            Vaciar
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
            <div className="bg-emerald-500/20 p-2 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">
                ✅ Consulta enviada exitosamente
              </p>
              <p className="text-xs text-slate-400">Abriendo WhatsApp...</p>
            </div>
          </div>
        ),
        duration: TOAST_DURATION,
        className: "bg-slate-950/95 backdrop-blur-xl border border-emerald-500/50 shadow-2xl shadow-emerald-500/20",
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
            <Trash2 className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-bold text-white">Producto eliminado</p>
              <p className="text-xs text-slate-400">{name}</p>
            </div>
          </div>
        ),
        duration: TOAST_DURATION,
        className: "bg-slate-950/95 backdrop-blur-md border border-white/10",
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
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          <p className="text-sm font-bold text-white">✅ Consulta vaciada</p>
        </div>
      ),
      duration: TOAST_DURATION,
      className: "bg-slate-950/95 backdrop-blur-md border border-white/10",
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
          className="w-full sm:max-w-lg flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 backdrop-blur-xl border-white/10 shadow-2xl"
          style={getSafeAreaStyle()}
        >
          <CartHeader itemCount={itemCount} reduceMotion={prefersReducedMotion} />

          {isEmpty ? (
            <EmptyCart reduceMotion={prefersReducedMotion} />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                reduceMotion={prefersReducedMotion}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      <ClearConfirmDialog
        isOpen={showClearDialog}
        onOpenChange={handleDialogChange}
        onConfirm={handleClear}
        reduceMotion={prefersReducedMotion}
      />
    </>
  );
};

export default CartDrawer;