import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  onClearFilters?: () => void;
}

const ProductGrid = ({ products, onClearFilters }: ProductGridProps) => {
  const [selected, setSelected] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <PackageSearch className="w-20 h-20 text-muted-foreground mb-6" />
        <h3 className="font-display text-xl font-semibold">
          No se encontraron productos
        </h3>
        <p className="text-muted-foreground mb-4">
          Ajustá los filtros o la búsqueda.
        </p>

        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <>
      {/* GRID MEJORADO */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
          gap-4
          sm:gap-5
          lg:gap-6
          w-full
          px-4
          sm:px-0
        "
      >
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.2,
                delay: index * 0.03,
                ease: "easeOut"
              }}
            >
              <ProductCard
                product={product}
                index={index}
                onOpenDetail={setSelected}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <ProductDetailModal
        product={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default ProductGrid;