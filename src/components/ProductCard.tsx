import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Plus, Check, Package, PackageX, CheckCircle2, ImageOff, Sparkles, Eye, ShoppingCart } from "lucide-react"

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
      if (onNavigate) {
        onNavigate(product.id)
      }
    }

    const handleCardClick = () => {
      if (onNavigate) {
        onNavigate(product.id)
      }
    }

    return (
      <>
        <style>{`
          @keyframes neon-pulse-card {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
                          0 0 40px rgba(168, 85, 247, 0.15),
                          0 8px 32px rgba(0, 0, 0, 0.1);
            }
            50% { 
              box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
                          0 0 60px rgba(168, 85, 247, 0.25),
                          0 8px 32px rgba(0, 0, 0, 0.1);
            }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(30deg); }
          }

          @keyframes float-badge {
            0%, 100% { transform: translateY(0px) rotate(-12deg); }
            50% { transform: translateY(-5px) rotate(-12deg); }
          }

          @keyframes glow-pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          @keyframes sparkle-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .card-neon-border {
            position: relative;
            border: 2px solid rgba(168, 85, 247, 0.2);
          }

          .card-neon-border::before {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #a855f7, #ec4899, #06b6d4, #10b981, #a855f7);
            background-size: 300% 300%;
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
            animation: gradient-shift 4s linear infinite;
          }

          .card-neon-border:hover::before {
            opacity: 0.4;
          }

          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .floating-badge {
            animation: float-badge 3s ease-in-out infinite;
          }

          .sparkle-spin {
            animation: sparkle-rotate 4s linear infinite;
          }

          .glass-card-neon {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 250, 0.85));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          @supports (-webkit-touch-callout: none) {
            .glass-card-neon {
              -webkit-backdrop-filter: blur(10px);
            }
          }
        `}</style>

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
          onClick={handleCardClick}
          className="group relative glass-card-neon card-neon-border rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300"
          whileHover={{ y: -8 }}
        >
          {/* Animated shimmer effect */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
            style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent"
              style={{
                animation: isHovered ? 'shimmer 1.5s ease-in-out' : 'none',
                width: '200%',
                height: '200%',
              }}
            />
          </div>

          {/* Premium Badge for featured products */}
          {product.inStock && index < 4 && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
              className="absolute top-3 left-3 z-20 flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full shadow-xl floating-badge"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(249, 115, 22, 0.4)',
                color: 'white',
              }}
            >
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 sparkle-spin" />
              DESTACADO
            </motion.div>
          )}

          {/* IMAGE SECTION */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Loading skeleton */}
            {!imageLoaded && !imageError && product.image && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 animate-pulse" />
            )}

            {/* Image */}
            {product.image && !imageError ? (
              <motion.img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-purple-300">
                <ImageOff className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            )}

            {/* Gradient overlay with neon effect */}
            <div 
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(to top, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.2), transparent)',
                opacity: isHovered ? 1 : 0.7
              }}
            />

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
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-xl backdrop-blur-md bg-white/90 hover:bg-white border-2 border-purple-200 hover:border-purple-400 transition-all"
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
                }}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
              </Button>
            </motion.div>

            {/* Stock badge - always visible with glow */}
            <div className="absolute bottom-3 left-3 z-20">
              <Badge
                variant="outline"
                className={`text-[10px] sm:text-xs px-2.5 py-1.5 font-bold backdrop-blur-md border-2 ${
                  product.inStock
                    ? "bg-emerald-500 text-white border-emerald-300"
                    : "bg-red-500 text-white border-red-300"
                }`}
                style={{
                  boxShadow: product.inStock 
                    ? '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)'
                    : '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                }}
              >
                {product.inStock ? (
                  <>
                    <div 
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white mr-1.5"
                      style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
                    />
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
            {/* Category Badge with gradient */}
            {product.category && (
              <Badge
                variant="secondary"
                className="w-fit text-[10px] sm:text-xs px-2.5 py-1 font-bold border-2 border-purple-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))',
                  color: '#9333ea',
                  boxShadow: '0 2px 10px rgba(168, 85, 247, 0.2)'
                }}
              >
                {product.category}
              </Badge>
            )}

            {/* Title with gradient on hover */}
            <h3 
              className="font-bold text-sm sm:text-base md:text-lg leading-snug line-clamp-2 transition-all duration-300"
              style={{
                color: isHovered ? '#a855f7' : 'inherit',
                textShadow: isHovered ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none'
              }}
            >
              {product.name}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
                {product.description}
              </p>
            )}

            {/* Divider with gradient */}
            <div 
              className="h-px"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.3), transparent)'
              }}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {inCart ? (
                <Button
                  onClick={handleAdd}
                  disabled
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 sm:h-10 text-xs sm:text-sm font-bold border-2 cursor-default"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                    color: '#a855f7',
                    borderColor: 'rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">En consulta</span>
                  <span className="xs:hidden">Agregado</span>
                </Button>
              ) : (
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    size="sm"
                    className={`w-full h-9 sm:h-10 text-xs sm:text-sm font-bold transition-all duration-300 border-0 ${
                      product.inStock
                        ? "text-white"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    style={product.inStock ? {
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      boxShadow: isHovered 
                        ? '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.4), 0 8px 20px rgba(0, 0, 0, 0.2)'
                        : '0 0 20px rgba(168, 85, 247, 0.4), 0 4px 15px rgba(0, 0, 0, 0.2)'
                    } : {}}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Agregar a consulta</span>
                    <span className="sm:hidden">Agregar</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Floating particles effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-purple-400"
                  initial={{ 
                    x: Math.random() * 100 + '%', 
                    y: '100%',
                    opacity: 0 
                  }}
                  animate={{ 
                    y: '-20%',
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                  style={{
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                  }}
                />
              ))}
            </div>
          )}
        </motion.article>
      </>
    )
  }
)

ProductCard.displayName = "ProductCard"
export default ProductCard