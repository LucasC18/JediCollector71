import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

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
        {/* Back Button con animación */}
        <div className="mb-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="gap-2 transition-all hover:gap-3 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver al catálogo
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Cargando producto...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="py-32 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
              <PackageX className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error al cargar</h3>
            <p className="text-muted-foreground mb-6">No pudimos cargar este producto</p>
            <Button onClick={handleBack} variant="outline">
              Volver al catálogo
            </Button>
          </div>
        )}

        {/* Not Found State */}
        {!isLoading && !error && !product && (
          <div className="py-32 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <PackageX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Producto no encontrado</h3>
            <p className="text-muted-foreground mb-6">Este producto no existe o fue eliminado</p>
            <Button onClick={handleBack} variant="outline">
              Volver al catálogo
            </Button>
          </div>
        )}

        {/* Product Content */}
        {!isLoading && product && (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
            {/* IMAGE SECTION */}
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl overflow-hidden shadow-lg border border-border/50 group">
                <div className="aspect-square flex items-center justify-center p-8">
                  {product.image ? (
                    <>
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-all duration-500 ${
                          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <ImageOff className="w-16 h-16" />
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Zoom Button */}
                {product.image && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* INFO SECTION */}
            <div className="flex flex-col space-y-6 lg:py-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                    {product.category}
                  </Badge>
                )}
                {product.inStock ? (
                  <Badge className="px-3 py-1 text-xs font-medium bg-emerald-500 hover:bg-emerald-600">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                    En stock
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1 text-xs font-medium">
                    <PackageX className="w-3 h-3 mr-1.5" />
                    Sin stock
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Description */}
              <div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-4" />

              {/* Action Button */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  disabled={!product.inStock || inCart}
                  onClick={() => addToCart(product)}
                  className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                >
                  {!product.inStock ? (
                    <>
                      <PackageX className="w-5 h-5 mr-2" />
                      No disponible
                    </>
                  ) : inCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Agregado a consulta
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Agregar a consulta
                    </>
                  )}
                </Button>
                
                {inCart && (
                  <p className="text-sm text-center text-muted-foreground opacity-0 animate-[fadeIn_0.3s_ease-out_0.1s_forwards]">
                    Este producto ya está en tu consulta
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Modal */}
      {isImageModalOpen && product && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 cursor-zoom-out p-4 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl w-full scale-95 opacity-0 animate-[zoomIn_0.3s_ease-out_forwards]">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-auto max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-4 right-4 shadow-xl backdrop-blur-sm bg-background/80 hover:bg-background"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default ProductDetail