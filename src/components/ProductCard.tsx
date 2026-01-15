import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plus,
  Check,
  PackageX,
  CheckCircle2,
  ImageOff,
  Sparkles,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

/* ================================
   TYPES & INTERFACES
================================= */
interface ProductCardProps {
  product: Product;
  index: number;
  onNavigate?: (productId: string) => void;
}

interface ImageState {
  isLoaded: boolean;
  hasError: boolean;
  isLoading: boolean;
}

/* ================================
   CONSTANTS
================================= */
const ANIMATION_DELAY_MULTIPLIER = 0.05;
const ANIMATION_DURATION = 0.4;
const TOAST_DURATION = 2000;
const FEATURED_THRESHOLD = 4;

/* ================================
   SUB-COMPONENTS
================================= */
const FeaturedBadge = React.memo(() => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
    className="absolute top-3 left-3 z-20"
  >
    <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-400/50">
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-3 h-3" />
      </motion.div>
      DESTACADO
    </div>
  </motion.div>
));

FeaturedBadge.displayName = "FeaturedBadge";

const ImageSkeleton = React.memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 animate-pulse" />
));

ImageSkeleton.displayName = "ImageSkeleton";

const ImagePlaceholder = React.memo(() => (
  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800">
    <ImageOff className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600" />
  </div>
));

ImagePlaceholder.displayName = "ImagePlaceholder";

const ProductImage = React.memo(
  ({
    src,
    alt,
    imageState,
    onLoad,
    onError,
  }: {
    src: string | undefined;
    alt: string;
    imageState: ImageState;
    onLoad: () => void;
    onError: () => void;
  }) => {
    if (!src || imageState.hasError) {
      return <ImagePlaceholder />;
    }

    return (
      <>
        {!imageState.isLoaded && <ImageSkeleton />}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageState.isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          onError={onError}
        />
      </>
    );
  }
);

ProductImage.displayName = "ProductImage";

const StockBadge = React.memo(({ inStock }: { inStock: boolean }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="absolute bottom-3 left-3 z-20"
  >
    <Badge
      className={`px-3 py-1.5 text-xs sm:text-sm font-bold shadow-2xl border ${
        inStock
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/50 text-white"
          : "bg-gradient-to-r from-red-500 to-rose-600 border-red-400/50 text-white"
      }`}
    >
      {inStock ? (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Disponible
        </span>
      ) : (
        "✕ Agotado"
      )}
    </Badge>
  </motion.div>
));

StockBadge.displayName = "StockBadge";

const ProductTitle = React.memo(({ name }: { name: string }) => (
  <h3 className="font-bold text-sm sm:text-base line-clamp-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all">
    {name}
  </h3>
));

ProductTitle.displayName = "ProductTitle";

const ProductDescription = React.memo(
  ({ description }: { description?: string }) => {
    if (!description) return null;

    return (
      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {description}
      </p>
    );
  }
);

ProductDescription.displayName = "ProductDescription";

const AddToCartButton = React.memo(
  ({
    inCart,
    inStock,
    onClick,
    isAdding,
    prefersReducedMotion,
  }: {
    inCart: boolean;
    inStock: boolean;
    onClick: (e: React.MouseEvent) => void;
    isAdding: boolean;
    prefersReducedMotion: boolean;
  }) => {
    if (inCart) {
      return (
        <Button
          disabled
          variant="outline"
          size="sm"
          className="w-full min-h-[44px] text-sm sm:text-base font-semibold bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all touch-manipulation"
        >
          <Check className="w-4 h-4 mr-2" />
          En consulta
        </Button>
      );
    }

    return (
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      >
        <Button
          onClick={onClick}
          disabled={!inStock || isAdding}
          size="sm"
          className="group/btn relative w-full min-h-[44px] text-sm sm:text-base font-bold overflow-hidden shadow-xl touch-manipulation disabled:opacity-50"
        >
          {/* Animated gradient background */}
          {!inStock || isAdding ? (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600" />
          ) : !prefersReducedMotion ? (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          )}

          {/* Glow effect */}
          {inStock && !isAdding && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-50 group-hover/btn:opacity-75 transition-opacity" />
          )}

          <span className="relative z-10 flex items-center justify-center text-white">
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar
              </>
            )}
          </span>
        </Button>
      </motion.div>
    );
  }
);

AddToCartButton.displayName = "AddToCartButton";

/* ================================
   MAIN COMPONENT
================================= */
const ProductCard = React.forwardRef<HTMLElement, ProductCardProps>(
  ({ product, index, onNavigate }, ref) => {
    const { addToCart, isInCart } = useCart();
    const { toast } = useToast();
    const prefersReducedMotion = useReducedMotion() || false;

    const [imageState, setImageState] = React.useState<ImageState>({
      isLoaded: false,
      hasError: false,
      isLoading: true,
    });
    const [isAdding, setIsAdding] = React.useState(false);

    const inCart = React.useMemo(() => isInCart(product.id), [isInCart, product.id]);
    const isFeatured = React.useMemo(
      () => product.inStock && index < FEATURED_THRESHOLD,
      [product.inStock, index]
    );

    const handleImageLoad = React.useCallback(() => {
      setImageState({
        isLoaded: true,
        hasError: false,
        isLoading: false,
      });
    }, []);

    const handleImageError = React.useCallback(() => {
      setImageState({
        isLoaded: false,
        hasError: true,
        isLoading: false,
      });
    }, []);

    const handleAddToCart = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        if (inCart || !product.inStock || isAdding) return;

        setIsAdding(true);
        addToCart(product);

        toast({
          duration: TOAST_DURATION,
          className:
            "border border-emerald-500/40 bg-slate-950/95 backdrop-blur-md shadow-2xl",
          description: (
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-300">
                  ✅ Agregado a la consulta
                </p>
                <p className="text-xs text-slate-400">{product.name}</p>
              </div>
            </div>
          ),
        });

        setTimeout(() => {
          setIsAdding(false);
        }, 600);
      },
      [inCart, product, isAdding, addToCart, toast]
    );

    const handleCardClick = React.useCallback(() => {
      if (onNavigate) {
        onNavigate(product.id);
      }
    }, [onNavigate, product.id]);

    return (
      <motion.article
        ref={ref}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                delay: index * ANIMATION_DELAY_MULTIPLIER,
                duration: ANIMATION_DURATION,
                ease: "easeOut",
              }
        }
        whileHover={prefersReducedMotion ? undefined : { y: -8 }}
        onClick={handleCardClick}
        className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 shadow-2xl hover:shadow-purple-500/20"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Ver detalles de ${product.name}`}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl" />

        {/* DESTACADO BADGE */}
        {isFeatured && <FeaturedBadge />}

        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800">
          <ProductImage
            src={product.image}
            alt={product.name}
            imageState={imageState}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Overlay hover effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* STOCK BADGE */}
          <StockBadge inStock={product.inStock} />
        </div>

        {/* CONTENT */}
        <div className="relative p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 flex-1">
          <ProductTitle name={product.name} />

          <ProductDescription description={product.description} />

          {/* Spacer */}
          <div className="flex-1 min-h-[8px]" />

          {/* ACTION BUTTON */}
          <div className="mt-auto">
            <AddToCartButton
              inCart={inCart}
              inStock={product.inStock}
              onClick={handleAddToCart}
              isAdding={isAdding}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        {/* Click hint overlay - solo visible en hover en desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none hidden sm:flex items-center justify-center"
        >
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/20">
            <p className="text-xs font-bold text-slate-700">
              👆 Click para ver detalles
            </p>
          </div>
        </motion.div>

        {/* Corner shine effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none" />
      </motion.article>
    );
  }
);

ProductCard.displayName = "ProductCard";
export default ProductCard;