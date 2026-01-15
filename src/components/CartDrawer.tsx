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
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                        0 0 40px rgba(168, 85, 247, 0.2),
                        inset 0 0 20px rgba(168, 85, 247, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6),
                        0 0 60px rgba(168, 85, 247, 0.3),
                        inset 0 0 30px rgba(168, 85, 247, 0.15);
          }
        }

        @keyframes neon-glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6)); }
          50% { filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.8)); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .neon-border {
          position: relative;
          background: linear-gradient(145deg, rgba(17, 17, 17, 0.95), rgba(30, 30, 30, 0.95));
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .neon-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7);
          background-size: 300% 300%;
          border-radius: inherit;
          z-index: -1;
          animation: gradient-shift 4s ease infinite;
          opacity: 0.6;
        }

        .whatsapp-glow {
          box-shadow: 0 0 20px rgba(37, 211, 102, 0.4),
                      0 0 40px rgba(37, 211, 102, 0.2),
                      0 4px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .whatsapp-glow:hover {
          box-shadow: 0 0 30px rgba(37, 211, 102, 0.6),
                      0 0 60px rgba(37, 211, 102, 0.3),
                      0 8px 30px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        .card-glow {
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15),
                      0 0 40px rgba(168, 85, 247, 0.1);
          transition: all 0.3s ease;
        }

        .card-glow:hover {
          box-shadow: 0 8px 30px rgba(168, 85, 247, 0.25),
                      0 0 60px rgba(168, 85, 247, 0.15);
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        }

        .badge-neon {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                      0 0 40px rgba(236, 72, 153, 0.2);
          animation: neon-pulse 3s ease-in-out infinite;
        }

        .floating-sparkle {
          animation: float 3s ease-in-out infinite;
        }

        /* Safari-specific fixes */
        @supports (-webkit-touch-callout: none) {
          .neon-border::before {
            will-change: background-position;
          }
          .glassmorphism {
            -webkit-backdrop-filter: blur(20px);
          }
        }
      `}</style>

      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col neon-border">
          {/* HEADER */}
          <SheetHeader className="pb-6 border-b-2 border-purple-500/20">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3 text-2xl">
                <motion.div 
                  className="p-2.5 rounded-xl glassmorphism relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  style={{ animation: 'neon-glow 2s ease-in-out infinite' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"></div>
                  <ShoppingBag className="w-6 h-6 text-purple-400 relative z-10" />
                </motion.div>
                <div>
                  <p className="font-bold text-glow">Mi Consulta</p>
                  <p className="text-sm font-normal text-purple-300/70">
                    {items.length} {items.length === 1 ? "producto" : "productos"}
                  </p>
                </div>
              </SheetTitle>
              
              {items.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <Badge className="badge-neon text-white border-0 px-4 py-1.5 font-bold text-base">
                    {items.length}
                  </Badge>
                </motion.div>
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
                className="p-8 rounded-2xl glassmorphism border-2 border-dashed border-purple-500/30 relative overflow-hidden floating-sparkle"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <ShoppingBag className="w-20 h-20 text-purple-400/60 relative z-10" />
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-purple-400/40" />
                </motion.div>
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-purple-100">Tu consulta está vacía</p>
                <p className="text-sm text-purple-300/60 max-w-xs">
                  Agregá productos desde el catálogo para comenzar tu consulta
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* LISTADO */}
              <div className="flex-1 overflow-y-auto py-6 space-y-3 pr-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative card-glow"
                      style={{
                        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.8))',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '2px solid rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Image */}
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden glassmorphism border-2 border-purple-500/30 relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                <Package className="w-8 h-8 text-purple-400/60" />
                              </div>
                            )}
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base truncate mb-1.5 text-purple-50">
                            {item.name}
                          </h4>
                          {item.category && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs glassmorphism border-purple-500/30 text-purple-300"
                            >
                              {item.category}
                            </Badge>
                          )}
                        </div>

                        {/* Remove Button */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id, item.name)}
                            aria-label={`Eliminar ${item.name} de la consulta`}
                            className="h-10 w-10 rounded-full
                                       text-purple-300
                                       hover:text-red-400
                                       glassmorphism
                                       hover:bg-red-500/20
                                       border-2 border-purple-500/20
                                       hover:border-red-500/40
                                       transition-all"
                            style={{
                              boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)'
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ACCIONES */}
              <div className="pt-6 space-y-3 border-t-2 border-purple-500/20">
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
                               bg-gradient-to-r from-[#25D366] to-[#1ebe5d]
                               text-white border-0
                               whatsapp-glow
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-300
                               relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin relative z-10" />
                        <span className="relative z-10">Enviando consulta...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">Consultar por WhatsApp</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Clear Button */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearDialog(true)}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-12 rounded-xl
                               glassmorphism
                               border-2 border-purple-500/30
                               text-purple-300
                               hover:border-red-500/50
                               hover:text-red-400
                               hover:bg-red-500/10
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vaciar consulta
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* DIALOGO DE CONFIRMACIÓN */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-2xl border-2 border-purple-500/30 neon-border">
          <AlertDialogHeader className="space-y-4">
            <motion.div 
              className="mx-auto p-4 rounded-2xl glassmorphism border-2 border-red-500/30 w-fit relative overflow-hidden"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                  '0 0 40px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10"></div>
              <Trash2 className="w-10 h-10 text-red-400 relative z-10" />
            </motion.div>
            <AlertDialogTitle className="text-2xl text-center text-glow">
              ¿Vaciar consulta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-purple-300/70">
              Se eliminarán todos los productos de tu consulta.
              <br />
              <span className="text-red-400/80">Esta acción no se puede deshacer.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel className="rounded-xl glassmorphism border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
              style={{
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
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