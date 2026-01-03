import { Product } from "@/types/product"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, PackageX, Plus, Check, X } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { memo, useCallback } from "react"

interface Props {
  product: Product | null
  open: boolean
  onClose: () => void
}

const ProductDetailModal = memo(({ product, open, onClose }: Props) => {
  const { addToCart, isInCart } = useCart()

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) onClose()
  }, [onClose])

  const handleAddToCart = useCallback(() => {
    if (product) addToCart(product)
  }, [product, addToCart])

  if (!product) return null

  const inCart = isInCart(product.id)
  const canAddToCart = product.inStock && !inCart

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          w-[96vw] sm:w-[92vw] md:w-[90vw] lg:w-[85vw] xl:w-full
          max-w-6xl
          h-[92vh]
          p-0
          bg-neutral-950
          border border-white/10
          flex flex-col
          overflow-hidden
        "
        aria-describedby="product-description"
      >
        {/* Accesibilidad: Título oculto visualmente */}
        <DialogTitle className="sr-only">
          {product.name}
        </DialogTitle>

        {/* Botón de cierre mejorado */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="
            absolute top-3 right-3 z-50 
            bg-black/60 backdrop-blur-sm rounded-full p-2 
            text-white/80 hover:text-white hover:bg-black/80 
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-neutral-950
          "
        >
          <X className="w-5 h-5" />
        </button>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-0">

          {/* Imagen con animación optimizada */}
          <div className="relative w-full h-[220px] sm:h-[300px] lg:h-full overflow-hidden bg-neutral-900">
            <motion.img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Panel de información */}
          <div className="flex flex-col h-full min-h-0">

            {/* Contenido scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 space-y-5">

              {/* Título */}
              <h2 
                className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight pr-10 lg:pr-0 text-white"
                aria-live="polite"
              >
                {product.name}
              </h2>

              {/* Badges mejorados */}
              <div className="flex flex-wrap gap-2" role="status" aria-live="polite">
                <Badge
                  className={`
                    px-2.5 py-1 text-xs sm:text-sm font-semibold 
                    flex items-center gap-1.5 transition-colors
                    ${product.inStock
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }
                  `}
                >
                  {product.inStock ? (
                    <>
                      <Package className="w-4 h-4" aria-hidden="true" />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <PackageX className="w-4 h-4" aria-hidden="true" />
                      <span>No disponible</span>
                    </>
                  )}
                </Badge>

                <Badge
                  variant="outline"
                  className="px-2.5 py-1 text-xs sm:text-sm bg-purple-500/20 text-purple-400 border-purple-500/40 font-semibold"
                >
                  {product.category}
                </Badge>
              </div>

              {/* Descripción */}
              <div id="product-description">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* CTA sticky con animación */}
            <div
              className="
                sticky bottom-0 z-40
                border-t border-white/10
                p-4 sm:p-5
                bg-neutral-950/95 backdrop-blur-sm
              "
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={inCart ? 'in-cart' : 'add-to-cart'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    disabled={!canAddToCart}
                    onClick={handleAddToCart}
                    size="lg"
                    variant={inCart ? "outline" : "default"}
                    className={`
                      w-full font-semibold transition-all
                      focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950
                      ${inCart
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30 focus:ring-cyan-500"
                        : product.inStock
                        ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 focus:ring-cyan-500"
                        : "bg-neutral-800/50 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                      }
                    `}
                    aria-label={
                      inCart 
                        ? "Producto ya agregado a consulta" 
                        : product.inStock 
                        ? `Agregar ${product.name} a consulta`
                        : "Producto no disponible"
                    }
                  >
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                        Ya en consulta
                      </>
                    ) : product.inStock ? (
                      <>
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Agregar a consulta
                      </>
                    ) : (
                      <>
                        <PackageX className="w-4 h-4 mr-2" aria-hidden="true" />
                        No disponible
                      </>
                    )}
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

ProductDetailModal.displayName = "ProductDetailModal"

export default ProductDetailModal