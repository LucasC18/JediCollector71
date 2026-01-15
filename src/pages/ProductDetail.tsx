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
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* BACK */}
        <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        {/* LOADING */}
        {isLoading && (
          <div className="flex justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        )}

        {/* ERROR */}
        {!isLoading && error && (
          <div className="text-center py-32">
            <PackageX className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p>Error al cargar producto</p>
          </div>
        )}

        {/* NOT FOUND */}
        {!isLoading && !error && !product && (
          <div className="text-center py-32">
            <PackageX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p>Producto no encontrado</p>
          </div>
        )}

        {/* PRODUCT */}
        {!isLoading && product && (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* IMAGE */}
            <div className="relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-h-[500px] object-contain cursor-zoom-in"
                  onClick={() => setIsImageModalOpen(true)}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <ImageOff />
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold">{product.name}</h1>

              {product.description && <p>{product.description}</p>}

              {product.inStock ? (
                <Badge className="bg-emerald-500">En stock</Badge>
              ) : (
                <Badge variant="destructive">Sin stock</Badge>
              )}

              <Button
                size="lg"
                disabled={!product.inStock || inCart}
                onClick={() => addToCart(product)}
              >
                {inCart ? "Agregado" : "Agregar a consulta"}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* IMAGE MODAL */}
      <AnimatePresence>
        {isImageModalOpen && product && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setIsImageModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={product.image}
              alt={product.name}
              className="max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              className="absolute top-4 right-4"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
