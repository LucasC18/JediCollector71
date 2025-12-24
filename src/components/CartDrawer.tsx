import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
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

  /* ================================
     📲 Enviar consulta
  ================================ */
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

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          response.whatsappMessage
        )}`,
        "_blank"
      );

      clearCart();
      onClose();

      toast({
        description: "Consulta enviada exitosamente",
        duration: 2000,
        className: "bg-black/95 backdrop-blur-xl border border-emerald-400/50 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]",
      });
    } catch (err: unknown) {
      console.error("Error al enviar consulta:", err);
      toast({
        title: "Error al enviar",
        description:
          err instanceof Error
            ? err.message
            : "No se pudo enviar la consulta. Intentá nuevamente.",
        variant: "destructive",
        className: "bg-black/95 backdrop-blur-xl border border-red-500/50 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)]",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     🗑️ Acciones de carrito
  ================================ */
  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      description: `Producto eliminado: ${name}`,
      duration: 2000,
      className: "bg-black/95 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_25px_rgba(255,255,255,0.2)]",
    });
  };

  const handleClear = () => {
    clearCart();
    setShowClearDialog(false);
    toast({
      description: "Consulta vaciada",
      duration: 2000,
      className: "bg-black/95 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_25px_rgba(255,255,255,0.2)]",
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col bg-black/95 backdrop-blur-xl border-l border-white/10">
          {/* HEADER */}
          <SheetHeader className="pb-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white">
              <ShoppingBag className="w-5 h-5" />
              Mi Consulta ({items.length})
            </SheetTitle>
          </SheetHeader>

          {/* EMPTY STATE */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ShoppingBag className="w-16 h-16 text-white/20" />
              </motion.div>
              <p className="text-sm text-muted-foreground text-center">
                No hay productos en la consulta
              </p>
            </div>
          ) : (
            <>
              {/* LISTADO */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-center gap-3 p-3 rounded-xl
                                 bg-white/5 border border-white/10
                                 hover:bg-white/10 hover:border-emerald-400/40
                                 hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]
                                 transition-all duration-300"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg
                                   border border-white/10
                                   group-hover:shadow-[0_0_12px_rgba(255,255,255,0.25)]
                                   transition"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.category ?? "Sin categoría"}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id, item.name)}
                        aria-label={`Eliminar ${item.name} de la consulta`}
                        className="text-muted-foreground
                                   hover:text-red-500
                                   hover:bg-red-500/10
                                   hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]
                                   transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ACCIONES */}
              <div className="pt-4 space-y-3 border-t border-white/10">
                <Button
                  onClick={handleWhatsAppClick}
                  disabled={isLoading}
                  className="w-full bg-[#25D366] text-black font-semibold
                             hover:bg-[#1ebe5d]
                             hover:shadow-[0_0_22px_rgba(37,211,102,0.9)]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
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
                  disabled={isLoading}
                  className="w-full border-white/20 text-white
                             hover:border-red-500
                             hover:text-red-500
                             hover:bg-red-500/10
                             hover:shadow-[0_0_18px_rgba(239,68,68,0.7)]
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vaciar consulta
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* DIALOGO DE CONFIRMACIÓN */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-black/95 backdrop-blur-xl border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Vaciar consulta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Se eliminarán todos los productos de tu consulta. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white"
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