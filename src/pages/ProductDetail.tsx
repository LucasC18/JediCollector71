import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Navbar from "@/components/Navbar"
import CartDrawer from "@/components/CartDrawer"

import { useProducts } from "@/context/ProductContext"
import { useCart } from "@/context/CartContext"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Plus, Check, PackageX } from "lucide-react"

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [isCartOpen, setIsCartOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top bar - Más visible */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
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
            Ocurrió un error cargando el producto.
          </div>
        )}

        {/* Not found */}
        {!isLoading && !error && !product && (
          <div className="py-20 text-center text-muted-foreground">
            Producto no encontrado.
          </div>
        )}

        {/* Product */}
        {!isLoading && !error && product && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:gap-10 xl:gap-12">
            {/* Imagen - Más grande */}
            <section className="space-y-4">
              <div className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-square bg-gradient-to-br from-muted/20 to-muted/60 p-4 sm:p-6 md:p-10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    loading="lazy"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                      <Badge variant="destructive" className="text-base px-4 py-2">
                        <PackageX className="w-4 h-4 mr-2" />
                        Sin stock
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Info */}
            <section className="space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                  {product.inStock && (
                    <Badge className="text-xs bg-green-500 hover:bg-green-600">
                      ✓ Disponible
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Description */}
              <div className="glass-card rounded-xl p-5 sm:p-6 space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Descripción
                </h2>
                <p className="text-base leading-relaxed text-foreground/90">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full gap-2 text-base h-12 sm:h-14 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!product.inStock || inCart}
                  onClick={() => addToCart(product)}
                >
                  {!product.inStock ? (
                    <>
                      <PackageX className="w-5 h-5" />
                      Producto no disponible
                    </>
                  ) : inCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      ✓ Agregado al carrito
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Agregar a consulta
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsCartOpen(true)}
                  >
                    Ver carrito
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </Button>
                </div>
              </div>

              {/* Info adicional */}
              <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                  Consulta sin compromiso
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                  Asesoramiento personalizado
                </p>
              </div>
            </section>
          </div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default ProductDetail