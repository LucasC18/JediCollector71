import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MessageCircle, ShoppingBag, Loader2, X, Package, Sparkles } from "lucide-react";
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

  /* ================================
     📲 Enviar consulta (Safari-compatible)
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

      const phone = WHATSAPP_NUMBER.replace(/\D/g, "");

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        response.whatsappMessage
      )}`;

      // Método compatible con Safari iOS y todos los navegadores
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS || isSafari) {
        window.location.href = whatsappUrl;
      } else {
        const newWindow = window.open(
          whatsappUrl,
          "_blank",
          "noopener,noreferrer"
        );
        if (!newWindow) {
          window.location.href = whatsappUrl;
        }
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
      console.error("Error al enviar consulta:", err);
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

  /* ================================
     🗑️ Acciones de carrito
  ================================ */
  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      description: `Producto eliminado: ${name}`,
      duration: 2000,
    });
  };

  const handleClear = () => {
    clearCart();
    setShowClearDialog(false);
    toast({
      description: "Consulta vaciada",
      duration: 2000,
    });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col bg-background border-l-2">
          {/* HEADER */}
          <SheetHeader className="pb-6 border-b-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Mi Consulta</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {items.length} {items.length === 1 ? "producto" : "productos"}
                  </p>
                </div>
              </SheetTitle>
              
              {items.length > 0 && (
                <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                  {items.length}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* EMPTY STATE */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-dashed border-muted-foreground/20"
              >
                <ShoppingBag className="w-20 h-20 text-muted-foreground/40" />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Tu consulta está vacía</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Agregá productos desde el catálogo para comenzar tu consulta
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* LISTADO */}
              <div className="flex-1 overflow-y-auto py-6 space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative flex items-center gap-4 p-4 rounded-2xl
                                 bg-gradient-to-br from-card to-card/50
                                 border-2 border-border
                                 hover:border-primary/50
                                 hover:shadow-xl hover:shadow-primary/10
                                 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted/30 border-2 border-border">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate mb-1">
                          {item.name}
                        </h4>
                        {item.category && (
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>

                      {/* Remove Button */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.id, item.name)}
                          aria-label={`Eliminar ${item.name} de la consulta`}
                          className="h-10 w-10 rounded-full
                                     text-muted-foreground
                                     hover:text-destructive
                                     hover:bg-destructive/10
                                     hover:border-destructive/20
                                     border-2 border-transparent
                                     transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ACCIONES */}
              <div className="pt-6 space-y-3 border-t-2">
                {/* WhatsApp Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleWhatsAppClick}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl
                               bg-[#25D366] text-white
                               hover:bg-[#1ebe5d]
                               hover:shadow-2xl hover:shadow-[#25D366]/50
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando consulta...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Consultar por WhatsApp
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Clear Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(true)}
                  disabled={isLoading}
                  size="lg"
                  className="w-full h-12 rounded-xl
                             border-2
                             hover:border-destructive
                             hover:text-destructive
                             hover:bg-destructive/5
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all"
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
        <AlertDialogContent className="rounded-2xl border-2">
          <AlertDialogHeader className="space-y-4">
            <div className="mx-auto p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/20 w-fit">
              <Trash2 className="w-10 h-10 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl text-center">
              ¿Vaciar consulta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Se eliminarán todos los productos de tu consulta.
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartDrawer;