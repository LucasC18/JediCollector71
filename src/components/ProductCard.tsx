import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Plus, Check, Package, PackageX, CheckCircle2, ImageOff, Sparkles, Eye, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Product } from "@/types/product"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  index: number
}

const ProductCard = React.forwardRef<HTMLElement, ProductCardProps>(
  ({ product, index }, ref) => {
    const navigate = useNavigate()
    const { addToCart, isInCart } = useCart()
    const { toast } = useToast()

    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)
    const [isHovered, setIsHovered] = React.useState(false)

    const inCart = isInCart(product.id)

    // Mouse parallax effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
      stiffness: 100,
      damping: 30,
    })
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
      stiffness: 100,
      damping: 30,
    })

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const x = (e.clientX - rect.left) / width - 0.5
      const y = (e.clientY - rect.top) / height - 0.5
      mouseX.set(x)
      mouseY.set(y)
    }

    const handleMouseLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
      setIsHovered(false)
    }

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
            <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400" />
            <div>
              <p className="text-sm sm:text-base font-semibold text-emerald-300">
                Agregado a la consulta
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {product.name}
              </p>
            </div>
          </div>
        ),
      })
    }

    const handleViewDetails = (e: React.MouseEvent) => {
      e.stopPropagation()
      navigate(`/producto/${product.id}`)
    }

    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/producto/${product.id}`)}
        className="group relative glass-card rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 pointer-events-none z-10"
          initial={{ x: "-100%", y: "-100%" }}
          animate={isHovered ? { x: "100%", y: "100%" } : { x: "-100%", y: "-100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Premium Badge for featured products */}
        {product.inStock && index < 3 && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
            className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-lg"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            DESTACADO
          </motion.div>
        )}

        {/* IMAGE SECTION */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && product.image && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
          )}

          {/* Image */}
          {product.image && !imageError ? (
            <motion.img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              <ImageOff className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick action buttons - appear on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 flex flex-col gap-2 z-20"
          >
            <Button
              size="icon"
              variant="secondary"
              onClick={handleViewDetails}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background border border-border/50"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </motion.div>

          {/* Stock badge - always visible */}
          <div className="absolute bottom-3 left-3 z-20">
            <Badge
              variant="outline"
              className={`text-[10px] sm:text-xs px-2 py-1 font-semibold backdrop-blur-md shadow-lg ${
                product.inStock
                  ? "bg-emerald-500/90 text-white border-emerald-400/50"
                  : "bg-red-500/90 text-white border-red-400/50"
              }`}
            >
              {product.inStock ? (
                <>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white mr-1.5 animate-pulse" />
                  <span className="hidden sm:inline">Disponible</span>
                  <span className="sm:hidden">Stock</span>
                </>
              ) : (
                <>
                  <PackageX className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden sm:inline">Sin stock</span>
                  <span className="sm:hidden">Agotado</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-2 sm:gap-3 flex-1 relative z-10">
          {/* Category Badge */}
          {product.category && (
            <Badge
              variant="secondary"
              className="w-fit text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 font-medium"
            >
              {product.category}
            </Badge>
          )}

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base md:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
              {product.description}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {inCart ? (
              <Button
                onClick={handleAdd}
                disabled
                variant="outline"
                size="sm"
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm bg-primary/20 text-primary border-primary/50 cursor-default"
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">En consulta</span>
                <span className="xs:hidden">Agregado</span>
              </Button>
            ) : (
              <Button
                onClick={handleAdd}
                disabled={!product.inStock}
                size="sm"
                className={`flex-1 h-9 sm:h-10 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  product.inStock
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Agregar a consulta</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Card border glow on hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none" />
      </motion.article>
    )
  }
)

ProductCard.displayName = "ProductCard"
export default ProductCard