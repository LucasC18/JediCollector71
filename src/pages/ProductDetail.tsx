import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import Navbar from "@/components/Navbar"
import CartDrawer from "@/components/CartDrawer"

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
  Package,
  Info,
} from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { addToCart, isInCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  /* ================================
     LOAD PRODUCT FROM API
  ================================= */
  useEffect(() => {
    if (!id) return

    setIsLoading(true)
    setError(false)
    setImageLoaded(false)

    apiFetch<Product>(`/v1/products/${id}`)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const inCart = product ? isInCart(product.id) : false

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate("/catalogo")
  }

  /* 🔥 Evitar scroll roto cuando se abre imagen */
  useEffect(() => {
    document.body.style.overflow = isImageModalOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isImageModalOpen])

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="gap-2 hover:gap-3 transition-all group hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Volver al catálogo</span>
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-6"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <div className="absolute inset-0 w-16 h-16 animate-ping opacity-20">
                <Loader2 className="w-16 h-16 text-primary" />
              </div>
            </div>
            <p className="text-base text-muted-foreground animate-pulse font-medium">
              Cargando producto...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-32 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 border-2 border-destructive/20 mb-6"
            >
              <PackageX className="w-12 h-12 text-destructive" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3">Error al cargar</h3>
            <p className="text-muted-foreground mb-8 text-lg">No pudimos cargar este producto</p>
            <Button onClick={handleBack} size="lg" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Button>
          </motion.div>
        )}

        {/* Not Found State */}
        {!isLoading && !error && !product && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-32 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border-2 border-muted mb-6"
            >
              <PackageX className="w-12 h-12 text-muted-foreground" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3">Producto no encontrado</h3>
            <p className="text-muted-foreground mb-8 text-lg">Este producto no existe o fue eliminado</p>
            <Button onClick={handleBack} size="lg" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Button>
          </motion.div>
        )}

        {/* Product Content */}
        {!isLoading && product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-10 lg:grid-cols-[1.2fr,1fr] lg:gap-16"
          >
            {/* IMAGE SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/10 group">
                {/* Decorative corner accent */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full" />
                
                <div className="aspect-square flex items-center justify-center p-8 relative z-10">
                  {product.image ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                      )}
                      <motion.img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-all duration-700 ${
                          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <ImageOff className="w-20 h-20" />
                      <span className="text-base font-medium">Sin imagen disponible</span>
                    </div>
                  )}
                </div>

                {/* Zoom Button */}
                {product.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-6 right-6 z-20"
                  >
                    <Button
                      size="icon"
                      onClick={() => setIsImageModalOpen(true)}
                      className="h-12 w-12 rounded-full shadow-xl bg-primary/90 backdrop-blur-md hover:bg-primary border-2 border-primary-foreground/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* INFO SECTION */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col space-y-8 lg:py-4"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                {product.category && (
                  <Badge className="px-4 py-2 text-sm font-semibold bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 gap-2">
                    <Tag className="w-4 h-4" />
                    {product.category}
                  </Badge>
                )}
                {product.inStock ? (
                  <Badge className="px-4 py-2 text-sm font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30 gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Disponible en stock
                  </Badge>
                ) : (
                  <Badge className="px-4 py-2 text-sm font-semibold bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 gap-2">
                    <PackageX className="w-4 h-4" />
                    Sin stock
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text"
                >
                  {product.name}
                </motion.h1>
              </div>

              {/* Description */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">
                        Descripción
                      </h3>
                      <p className="text-base leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <Button
                  size="lg"
                  disabled={!product.inStock || inCart}
                  onClick={() => addToCart(product)}
                  className={`
                    w-full h-16 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300
                    ${!product.inStock || inCart
                      ? 'bg-muted hover:bg-muted'
                      : 'bg-gradient-to-r from-primary via-primary to-primary/80 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                >
                  {!product.inStock ? (
                    <>
                      <PackageX className="w-6 h-6 mr-3" />
                      No disponible
                    </>
                  ) : inCart ? (
                    <>
                      <Check className="w-6 h-6 mr-3" />
                      Agregado a consulta
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Agregar a consulta
                    </>
                  )}
                </Button>
                
                <AnimatePresence>
                  {inCart && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Este producto ya está en tu consulta</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 cursor-zoom-out p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-7xl w-full"
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-auto max-h-[90vh] object-contain mx-auto rounded-2xl shadow-2xl" 
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Close Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-4 -right-4"
              >
                <Button
                  size="icon"
                  onClick={() => setIsImageModalOpen(false)}
                  className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 border-4 border-background"
                >
                  <X className="w-6 h-6" />
                </Button>
              </motion.div>

              {/* Product name overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-background/90 backdrop-blur-md border border-border/50"
              >
                <p className="text-lg font-semibold">{product.name}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductDetail