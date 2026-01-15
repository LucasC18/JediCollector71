import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { apiFetch } from "@/config/api";
import { Product } from "@/types/product";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, PackageX, X, ImageOff } from "lucide-react";

interface ProductDetailProps {
  id?: string;
  onNavigateBack?: () => void;
  onNavigateCatalog?: () => void;
}

const ProductDetail = ({
  id,
  onNavigateBack,
  onNavigateCatalog,
}: ProductDetailProps) => {
  const { id: paramId } = useParams<{ id: string }>();
  const productId = useMemo(() => id || paramId, [id, paramId]);

  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  /* ================================
     LOAD PRODUCT
  ================================= */
  type ProductApiResponse =
    | { item: Product }
    | { data: Product }
    | { product: Product }
    | Product;

  useEffect(() => {
    if (!productId) return;

    setIsLoading(true);
    setError(false);

    apiFetch<ProductApiResponse>(`/v1/products/${productId}`)
      .then((res) => {
        // backend-proof extractor
        const data =
          "item" in res
            ? res.item
            : "data" in res
            ? res.data
            : "product" in res
            ? res.product
            : res;

        setProduct(data ?? null);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const inCart = product ? isInCart(product.id) : false;

  const handleBack = () => {
    if (onNavigateBack) onNavigateBack();
    else if (onNavigateCatalog) onNavigateCatalog();
    else window.history.back();
  };

  useEffect(() => {
    document.body.style.overflow = isImageModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isImageModalOpen]);

  /* ================================
     UI
  ================================= */

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* BACK BUTTON - Touch Friendly */}
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-6 sm:mb-8 gap-2 min-h-[48px] px-4 text-base sm:text-lg font-medium hover:bg-slate-200 active:bg-slate-300 transition-colors rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          Volver
        </Button>

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center items-center py-32 sm:py-40">
            <div className="text-center">
              <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Cargando producto...</p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!isLoading && error && (
          <div className="text-center py-32 sm:py-40">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <PackageX className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-red-500 mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Error al cargar</h2>
              <p className="text-slate-600 text-lg">No pudimos cargar este producto. Intenta nuevamente.</p>
            </div>
          </div>
        )}

        {/* NOT FOUND */}
        {!isLoading && !error && !product && (
          <div className="text-center py-32 sm:py-40">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
              <PackageX className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-slate-400 mb-6" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Producto no encontrado</h2>
              <p className="text-slate-600 text-lg">Este producto no existe o fue eliminado.</p>
            </div>
          </div>
        )}

        {/* PRODUCT */}
        {!isLoading && product && (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* IMAGE - Clickeable para abrir modal */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              {product.image ? (
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="w-full cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400 active:scale-[0.98] transition-transform"
                  aria-label="Ver imagen ampliada"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-contain p-6 sm:p-8"
                  />
                  {/* Overlay sutil en hover/touch */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/5 active:bg-black/10 transition-colors pointer-events-none" />
                </button>
              ) : (
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] flex flex-col items-center justify-center text-slate-400">
                  <ImageOff className="w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <p className="text-lg">Sin imagen</p>
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                
                {/* Stock Badge - Más visible */}
                {product.inStock ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-base sm:text-lg font-semibold rounded-lg">
                    ✓ Disponible en stock
                  </Badge>
                ) : (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-base sm:text-lg font-semibold rounded-lg">
                    ✕ Sin stock
                  </Badge>
                )}
              </div>

              {product.description && (
                <div className="bg-slate-50 rounded-xl p-5 sm:p-6 border border-slate-200">
                  <p className="text-slate-700 text-lg sm:text-xl leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* CTA Button - Grande y touch-friendly */}
              <Button
                size="lg"
                disabled={!product.inStock || inCart}
                onClick={() => addToCart(product)}
                className="w-full min-h-[56px] sm:min-h-[64px] text-lg sm:text-xl font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inCart ? "✓ Agregado a consulta" : "Agregar a consulta"}
              </Button>

              {/* Hint text */}
              {product.image && (
                <p className="text-slate-500 text-center text-sm sm:text-base">
                  Toca la imagen para verla en tamaño completo
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* IMAGE MODAL - Optimizado para mobile */}
      <AnimatePresence>
        {isImageModalOpen && product && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setIsImageModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src={product.image}
              alt={product.name}
              className="max-h-[85vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Close button - Grande y fácil de tocar */}
            <Button
              className="absolute top-4 right-4 min-h-[48px] min-w-[48px] rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white shadow-xl"
              onClick={() => setIsImageModalOpen(false)}
              aria-label="Cerrar imagen"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Hint para cerrar */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white/80 text-sm sm:text-base">
                Toca fuera de la imagen para cerrar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;