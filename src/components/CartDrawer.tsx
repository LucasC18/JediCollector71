import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, Loader2, Package, Sparkles, X } from "lucide-react";
import { useState } from "react";
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

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleWhatsAppClick = async () => {
    if (items.length === 0) return;

    if (!WHATSAPP_NUMBER) {
      toast({
        title: "Configuración faltante",
        description: "No está configurado el número de WhatsApp",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createConsultation(
        items.map((item) => ({
          productId: item.id,
          qty: item.quantity ?? 1,
        }))
      );

      if (!response.whatsappMessage) {
        throw new Error("No se pudo generar el mensaje de WhatsApp");
      }

      const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        response.whatsappMessage
      )}`;

      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS || isSafari) {
        window.location.href = whatsappUrl;
      } else {
        const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        if (!newWindow) window.location.href = whatsappUrl;
      }

      setTimeout(() => {
        clearCart();
        onClose();
      }, 500);

      toast({
        description: "Consulta enviada exitosamente",
        duration: 2000,
        className:
          "bg-emerald-500/90 backdrop-blur-xl border border-emerald-400/50 text-white shadow-xl",
      });
    } catch (err: unknown) {
      toast({
        title: "Error al enviar",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo enviar la consulta. Intentá nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      description: `Producto eliminado: ${name}`,
      duration: 2000,
      className: "bg-slate-900/95 backdrop-blur-md border border-slate-700",
    });
  };

  const handleClear = () => {
    clearCart();
    setShowClearDialog(false);
    toast({
      description: "Consulta vaciada",
      duration: 2000,
      className: "bg-slate-900/95 backdrop-blur-md border border-slate-700",
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col bg-slate-900/95 backdrop-blur-xl border-slate-700">
          <SheetHeader className="pb-6 border-b border-slate-700/50">
            <SheetTitle className="flex items-center justify-between gap-3 text-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-bold">Mi Consulta</span>
              </div>
              <Badge className="text-base px-3 py-1.5 bg-primary/20 text-primary border-primary/30">
                {items.length}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
              <div className="p-8 rounded-full bg-slate-800/50 border border-slate-700">
                <ShoppingBag className="w-20 h-20 text-slate-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-slate-300">
                  Tu consulta está vacía
                </p>
                <p className="text-sm text-slate-500">
                  Agregá productos para consultar
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-slate-700/50">
                          <Package className="w-10 h-10 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-slate-100 line-clamp-2 leading-snug mb-2">
                          {item.name}
                        </p>
                        {item.category && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-slate-700/50 text-slate-300 border-slate-600"
                          >
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(item.id, item.name)}
                        className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-6 border-t border-slate-700/50 space-y-3">
                <Button
                  onClick={handleWhatsAppClick}
                  disabled={isLoading}
                  size="lg"
                  className="w-full min-h-[56px] text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Consultar por WhatsApp
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(true)}
                  size="lg"
                  className="w-full min-h-[52px] text-base font-semibold bg-slate-800/50 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Vaciar consulta
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-slate-900/95 backdrop-blur-xl border-slate-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-400" />
              ¿Vaciar consulta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-400 leading-relaxed pt-2">
              Se eliminarán todos los productos de tu consulta. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3">
            <AlertDialogCancel className="min-h-[52px] text-base bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClear}
              className="min-h-[52px] text-base bg-red-600 hover:bg-red-500 text-white"
            >
              Vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartDrawer;