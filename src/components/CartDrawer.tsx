import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trash2, MessageCircle, Loader2, Package } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

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
   TYPES
================================ */
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

interface ConsultationResponseRoot {
  whatsappMessage?: string;
  message?: string;
  data?: {
    whatsappMessage?: string;
  };
}

/* ================================
   HELPERS
================================ */
const normalizePhone = (phone: string): string =>
  phone.replace(/\D/g, "");

const extractWhatsappMessage = (
  response: ConsultationResponseRoot
): string | null => {
  if (response.whatsappMessage) return response.whatsappMessage;
  if (response.data?.whatsappMessage) return response.data.whatsappMessage;
  if (response.message) return response.message;
  return null;
};

/* ================================
   COMPONENT
================================ */
const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion() ?? false;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false);

  const itemCount = useMemo<number>(() => items.length, [items.length]);
  const isEmpty = itemCount === 0;

  /* ================================
     WHATSAPP HANDLER (ANTI BLOQUEO)
  ================================ */
  const handleWhatsAppClick = useCallback(async (): Promise<void> => {
    if (isEmpty || !WHATSAPP_NUMBER) return;

    const phone = normalizePhone(WHATSAPP_NUMBER);

    // ⚠️ abrir ventana SIN await
    const whatsappWindow: Window | null = window.open(
      "",
      "_blank",
      "noopener,noreferrer"
    );

    setIsLoading(true);

    try {
      const payload: ConsultationItem[] = items.map((item: CartItem) => ({
        productId: item.id,
        qty: item.quantity ?? 1,
      }));

      const response: ConsultationResponseRoot =
        await createConsultation(payload);

      const message = extractWhatsappMessage(response);

      if (!message) {
        throw new Error("No se pudo generar el mensaje de WhatsApp");
      }

      whatsappWindow?.location.replace(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      );

      clearCart();
      onClose();

      toast({
        description: "Consulta enviada. Abriendo WhatsApp…",
        duration: 2000,
      });
    } catch (error: unknown) {
      whatsappWindow?.close();

      const description =
        error instanceof Error
          ? error.message
          : "No se pudo enviar la consulta";

      toast({
        title: "❌ Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [items, isEmpty, clearCart, onClose, toast]);

  /* ================================
     CLEAR
  ================================ */
  const handleClear = useCallback((): void => {
    clearCart();
    setShowClearDialog(false);
  }, [clearCart]);

  /* ================================
     RENDER
  ================================ */
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col bg-slate-950">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span className="text-xl font-bold">Mi Consulta</span>
              <Badge>{itemCount}</Badge>
            </SheetTitle>
          </SheetHeader>

          {isEmpty ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              No hay productos en la consulta
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <AnimatePresence>
                  {items.map((item: CartItem, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={!reduceMotion ? { opacity: 0, y: 10 } : undefined}
                      animate={!reduceMotion ? { opacity: 1, y: 0 } : undefined}
                      exit={!reduceMotion ? { opacity: 0 } : undefined}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40"
                    >
                      <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        {item.category && (
                          <Badge variant="secondary">{item.category}</Badge>
                        )}
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleWhatsAppClick}
                  disabled={isLoading}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2" />
                      Consultar por WhatsApp
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowClearDialog(true)}
                >
                  Vaciar consulta
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Vaciar consulta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear}>
              Vaciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CartDrawer;
