import { useMemo, useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Navbar from "@/components/Navbar"
import CartDrawer from "@/components/CartDrawer"

import { useProducts } from "@/context/ProductContext"
import { useCart } from "@/context/CartContext"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  Plus,
  Check,
  PackageX,
  Maximize2,
  X,
  ImageOff,
} from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const { products, isLoading, error } = useProducts()
  const { addToCart, isInCart } = useCart()

  const product = useMemo(() => {
    if (!id) return null
    return products.find((p) => p.id === id) ?? null
  }, [products, id])

  const inCart = product ? isInCart(product.id) : false

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/catalogo")
    }
  }

  /* 🔥 Evitar scroll roto cuando se abre imagen */
  useEffect(() => {
    if (isImageModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isImageModalOpen])

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Back */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="gap-2 border-2 border-primary/50 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando producto...
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="py-20 text-center text-muted-foreground">
            Error cargando producto
          </div>
        )}

        {/* Not found */}
        {!isLoading && !error && !product && (
          <div className="py-20 text-center text-muted-foreground">
            Producto no encontrado
          </div>
        )}

        {/* Product */}
        {!isLoading && !error && product && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:gap-10">
            {/* IMAGE */}
            <section className="space-y-4">
              <div className="glass-card rounded-2xl overflow-hidden border border-primary/20">
                <div className="relative aspect-square bg-black/20 p-4 sm:p-8">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = ""
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageOff className="w-14 h-14" />
                    </div>
                  )}

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="destructive" className="text-base px-4 py-2">
                        <PackageX className="w-4 h-4 mr-2" />
                        Sin stock
                      </Badge>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* INFO */}
            <section className="space-y-6">
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {product.category && (
                    <Badge variant="outline">{product.category}</Badge>
                  )}
                  {product.inStock && (
                    <Badge className="bg-emerald-500">Disponible</Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold">{product.name}</h1>
              </div>

              {product.description && (
                <div className="glass-card rounded-xl p-5">
                  <p className="text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!product.inStock || inCart}
                  onClick={() => addToCart(product)}
                >
                  {!product.inStock ? (
                    <>
                      <PackageX className="w-5 h-5 mr-2" />
                      No disponible
                    </>
                  ) : inCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      En consulta
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Agregar a consulta
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setIsCartOpen(true)}>
                    Ver carrito
                  </Button>
                  <Button variant="outline" onClick={handleBack}>
                    Volver
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* FULL IMAGE */}
      {isImageModalOpen && product && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <div className="text-white flex items-center gap-2">
                <ImageOff /> Sin imagen
              </div>
            )}
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductDetail
