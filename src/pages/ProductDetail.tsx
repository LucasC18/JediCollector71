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
  Package,
  Info,
} from "lucide-react"

interface ProductDetailProps {
  id?: string
  onNavigateBack?: () => void
  onNavigateCatalog?: () => void
  onCartClick?: () => void
}

const ProductDetail = ({ id, onNavigateBack, onNavigateCatalog, onCartClick }: ProductDetailProps) => {
  const { addToCart, isInCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

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
    if (onNavigateBack) {
      onNavigateBack()
    } else if (onNavigateCatalog) {
      onNavigateCatalog()
    }
  }

  /* 🔥 Evitar scroll roto cuando se abre imagen */
  useEffect(() => {
    document.body.style.overflow = isImageModalOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isImageModalOpen])

  return (
    <>
      <style>{`
        @keyframes spin-glow {
          0% { 
            transform: rotate(0deg);
            filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
          }
          100% { 
            transform: rotate(360deg);
            filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
          }
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }

        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer-wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .loader-glow {
          animation: spin-glow 1s linear infinite;
        }

        .pulse-ring-animation {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .gradient-flow-bg {
          background-size: 200% 200%;
          animation: gradient-flow 3s ease infinite;
        }

        .float-animation {
          animation: float-up 3s ease-in-out infinite;
        }

        .image-container-neon {
          position: relative;
          background: linear-gradient(145deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05));
          border: 3px solid transparent;
          background-clip: padding-box;
        }

        .image-container-neon::before {
          content: '';
          position: absolute;
          inset: -3px;
          background: linear-gradient(45deg, #a855f7, #ec4899, #06b6d4, #10b981, #a855f7);
          background-size: 300% 300%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0.3;
          animation: gradient-flow 4s ease infinite;
        }

        .button-neon-glow {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4),
                      0 0 60px rgba(236, 72, 153, 0.3),
                      0 8px 25px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .button-neon-glow:hover {
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.6),
                      0 0 80px rgba(236, 72, 153, 0.5),
                      0 12px 35px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px) scale(1.02);
        }

        @supports (-webkit-touch-callout: none) {
          .image-container-neon {
            -webkit-backdrop-filter: blur(10px);
          }
        }
      `}</style>

      <div className="bg-background flex flex-col min-h-screen">
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
              className="gap-2 hover:gap-3 transition-all group rounded-xl border-2 border-transparent hover:border-purple-200"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))'
              }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-purple-600" />
              <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Volver al catálogo
              </span>
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
                <Loader2 className="w-16 h-16 text-purple-600 loader-glow" />
                <div className="absolute inset-0 w-16 h-16 pulse-ring-animation">
                  <div 
                    className="w-full h-full rounded-full"
                    style={{
                      border: '3px solid rgba(168, 85, 247, 0.3)'
                    }}
                  />
                </div>
              </div>
              <p className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
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
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 float-animation"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '3px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
                }}
              >
                <PackageX className="w-12 h-12 text-red-500" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Error al cargar
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">No pudimos cargar este producto</p>
              <Button 
                onClick={handleBack} 
                size="lg" 
                className="gap-2 border-2 border-purple-300 font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))'
                }}
              >
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
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 float-animation"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
                  border: '3px solid rgba(168, 85, 247, 0.2)',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)'
                }}
              >
                <PackageX className="w-12 h-12 text-purple-500" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Producto no encontrado
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">Este producto no existe o fue eliminado</p>
              <Button 
                onClick={handleBack} 
                size="lg" 
                className="gap-2 border-2 border-purple-300 font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))'
                }}
              >
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
                <div className="relative image-container-neon rounded-3xl overflow-hidden group">
                  {/* Decorative corner accents with glow */}
                  <div 
                    className="absolute top-0 left-0 w-32 h-32 rounded-br-full z-10"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), transparent)',
                      boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
                    }}
                  />
                  <div 
                    className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full z-10"
                    style={{
                      background: 'linear-gradient(to top left, rgba(236, 72, 153, 0.2), transparent)',
                      boxShadow: '0 0 40px rgba(236, 72, 153, 0.3)'
                    }}
                  />
                  
                  <div className="aspect-square flex items-center justify-center p-8 relative z-10">
                    {product.image ? (
                      <>
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-purple-600 loader-glow" />
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
                          style={{
                            filter: 'drop-shadow(0 10px 30px rgba(168, 85, 247, 0.2))'
                          }}
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-purple-300">
                        <ImageOff className="w-20 h-20" />
                        <span className="text-base font-medium">Sin imagen disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Zoom Button */}
                  {product.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="absolute top-6 right-6 z-20"
                    >
                      <Button
                        size="icon"
                        onClick={() => setIsImageModalOpen(true)}
                        className="h-12 w-12 rounded-full border-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                          boxShadow: '0 0 25px rgba(168, 85, 247, 0.6), 0 0 50px rgba(236, 72, 153, 0.4)'
                        }}
                      >
                        <Maximize2 className="w-5 h-5 text-white" />
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
                    <Badge 
                      className="px-4 py-2 text-sm font-bold border-2 gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                        borderColor: 'rgba(168, 85, 247, 0.4)',
                        color: '#9333ea',
                        boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      <Tag className="w-4 h-4" />
                      {product.category}
                    </Badge>
                  )}
                  {product.inStock ? (
                    <Badge 
                      className="px-4 py-2 text-sm font-bold border-2 gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        color: '#059669',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
                      />
                      Disponible en stock
                    </Badge>
                  ) : (
                    <Badge 
                      className="px-4 py-2 text-sm font-bold border-2 gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#dc2626',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                      }}
                    >
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
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 0 40px rgba(168, 85, 247, 0.2)'
                    }}
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
                    className="p-6 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.05))',
                      border: '2px solid rgba(168, 85, 247, 0.2)',
                      boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)'
                    }}
                  >
                    <div className="flex items-start gap-3 relative z-10">
                      <div 
                        className="p-2 rounded-lg shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                          boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                        }}
                      >
                        <Info className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-purple-600">
                          Descripción
                        </h3>
                        <p className="text-base leading-relaxed text-gray-700">
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      disabled={!product.inStock || inCart}
                      onClick={() => addToCart(product)}
                      className={`w-full h-16 text-lg font-bold rounded-2xl transition-all duration-300 border-0 ${
                        !product.inStock || inCart ? '' : 'button-neon-glow'
                      }`}
                      style={
                        !product.inStock || inCart
                          ? {
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
                              color: '#9ca3af'
                            }
                          : {
                              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                              color: 'white'
                            }
                      }
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
                  </motion.div>
                  
                  <AnimatePresence>
                    {inCart && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div 
                          className="flex items-center justify-center gap-2 text-sm font-semibold p-3 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
                            border: '2px solid rgba(168, 85, 247, 0.2)',
                            color: '#9333ea'
                          }}
                        >
                          <Sparkles className="w-4 h-4" />
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
                  style={{
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.5), 0 0 120px rgba(236, 72, 153, 0.3)'
                  }}
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
                    className="h-14 w-14 rounded-full border-4 border-white"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.4)'
                    }}
                  >
                    <X className="w-6 h-6 text-white" />
                  </Button>
                </motion.div>

                {/* Product name overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl backdrop-blur-md"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 4px 30px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {product.name}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default ProductDetail