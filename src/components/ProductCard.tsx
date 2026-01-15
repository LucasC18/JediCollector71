import * as React from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Check,
  PackageX,
  CheckCircle2,
  ImageOff,
  Sparkles,
  Eye,
  ShoppingCart,
} from "lucide-react"

import { Product } from "@/types/product"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  index: number
  onNavigate?: (productId: string) => void
}

const ProductCard = React.forwardRef<HTMLElement, ProductCardProps>(
  ({ product, index, onNavigate }, ref) => {
    const { addToCart, isInCart } = useCart()
    const { toast } = useToast()

    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const inCart = isInCart(product.id)

    const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation()

      if (inCart || !product.inStock) return

      addToCart(product)

      toast({
        duration: 2000,
        className:
          "toast-neon border border-emerald-500/40 bg-black/85 backdrop-blur-md",
        description: (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Agregado a la consulta
              </p>
              <p className="text-xs text-muted-foreground">
                {product.name}
              </p>
            </div>
          </div>
        ),
      })
    }

    const handleViewDetails = (e: React.MouseEvent) => {
      e.stopPropagation()
      onNavigate?.(product.id)
    }

    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className="group relative glass-card-neon card-neon-border rounded-xl overflow-hidden flex flex-col h-full"
      >
        {/* DESTACADO */}
        {product.inStock && index < 4 && (
          <div
            className="absolute top-3 left-3 z-20 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
              color: "white",
            }}
          >
            <Sparkles className="w-3 h-3" />
            DESTACADO
          </div>
        )}

        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
          {!imageLoaded && !imageError && product.image && (
            <div className="absolute inset-0 bg-purple-100 animate-pulse" />
          )}

          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-purple-300">
              <ImageOff className="w-10 h-10" />
            </div>
          )}

          {/* VIEW BUTTON (siempre visible en móvil) */}
          {onNavigate && (
            <div className="absolute top-3 right-3 z-20">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleViewDetails}
                className="h-10 w-10 rounded-full"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STOCK */}
          <div className="absolute bottom-3 left-3 z-20">
            <Badge
              className={`px-2.5 py-1.5 text-xs font-bold ${
                product.inStock ? "bg-emerald-500" : "bg-red-500"
              } text-white`}
            >
              {product.inStock ? "Disponible" : "Agotado"}
            </Badge>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-sm line-clamp-2">{product.name}</h3>

          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="mt-auto">
            {inCart ? (
              <Button
                disabled
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Check className="w-4 h-4 mr-1" />
                En consulta
              </Button>
            ) : (
              <Button
                onClick={handleAdd}
                disabled={!product.inStock}
                size="sm"
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            )}
          </div>
        </div>
      </motion.article>
    )
  }
)

ProductCard.displayName = "ProductCard"
export default ProductCard
