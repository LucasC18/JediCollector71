import { Product } from "@/types/product"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, PackageX, Plus, Check } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { motion } from "framer-motion"

interface Props {
  product: Product | null
  open: boolean
  onClose: () => void
}

const ProductDetailModal = ({ product, open, onClose }: Props) => {
  const { addToCart, isInCart } = useCart()
  if (!product) return null

  const inCart = isInCart(product.id)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          max-w-6xl
          p-0
          overflow-hidden
          bg-neutral-950
          border border-white/10
        "
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="relative">
            <motion.img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-950 to-transparent" />

            {/* keep height */}
            <div className="aspect-[4/5]" />
          </div>

          {/* INFO */}
          <div className="relative flex flex-col justify-between px-10 py-12">

            {/* TOP */}
            <div className="space-y-6">

              {/* TITLE */}
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {product.name}
              </h2>

              {/* BADGES */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`px-4 py-1.5 text-sm font-semibold ${
                    product.inStock
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {product.inStock ? (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Disponible
                    </>
                  ) : (
                    <>
                      <PackageX className="w-4 h-4 mr-2" />
                      No disponible
                    </>
                  )}
                </Badge>

                <Badge
                  variant="outline"
                  className="px-4 py-1.5 text-sm bg-secondary/20 text-secondary border-secondary/50"
                >
                  {product.category}
                </Badge>
              </div>

              {/* DESCRIPTION */}
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            {/* CTA */}
            <div className="pt-10">
              <Button
                disabled={!product.inStock || inCart}
                onClick={() => addToCart(product)}
                size="lg"
                variant={inCart ? "outline" : "default"}
                className={`w-full h-14 text-base ${
                  inCart
                    ? "bg-primary/20 text-primary border-primary/50"
                    : product.inStock
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Ya en consulta
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar a consulta
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailModal
