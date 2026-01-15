import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { useCart } from "@/context/CartContext"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  Check,
  PackageX,
  Maximize2,
  X,
  ImageOff,
  ShoppingCart,
  Sparkles,
  Tag,
  Info,
} from "lucide-react"

interface ProductDetailProps {
  id?: string
  onNavigateBack?: () => void
  onNavigateCatalog?: () => void
  onCartClick?: () => void
}

const ProductDetail = ({ id, onNavigateBack, onNavigateCatalog }: ProductDetailProps) => {
  const { addToCart, isInCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  /* ================================
     LOAD PRODUCT
  ================================= */
  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(false)
    setImageLoaded(false)

    apiFetch<{ item: Product }>(`/v1/products/${id}`)
      .then((res) => {
        setProduct(res.item ?? null)
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const inCart = product ? isInCart(product.id) : false

  const handleBack = () => {
    if (onNavigateBack) onNavigateBack()
    else if (onNavigateCatalog) onNavigateCatalog()
  }

  useEffect(() => {
    document.body.style.overflow = isImageModalOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isImageModalOpen])

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Back */}
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
                  onLoad={() => setImageLoaded(true)}
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
  )
}

export default ProductDetail
