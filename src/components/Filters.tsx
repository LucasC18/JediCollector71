import { motion, useReducedMotion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tag, Layers, X, Package, Check, Filter } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

/* ================================
   TYPES & INTERFACES
================================= */
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface FiltersProps {
  categories: Category[];
  collections: Collection[];
  selectedCategory: string | null;
  selectedCollection: string | null;
  onCategoryChange: (slug: string | null) => void;
  onCollectionChange: (slug: string | null) => void;
  showOnlyInStock: boolean;
  onStockFilterChange: (value: boolean) => void;
  onClearFilters: () => void;
}

interface FilterBadgeProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  reduceMotion?: boolean;
}

/* ================================
   HELPERS
================================= */
const getActiveFiltersCount = (
  selectedCategory: string | null,
  selectedCollection: string | null,
  showOnlyInStock: boolean
): number => {
  let count = 0;
  if (selectedCollection) count++;
  // Categoría solo cuenta si hay colección seleccionada (porque si no, ni debería existir en UI)
  if (selectedCollection && selectedCategory) count++;
  if (showOnlyInStock) count++;
  return count;
};

const hasActiveFilters = (
  selectedCategory: string | null,
  selectedCollection: string | null,
  showOnlyInStock: boolean
): boolean => {
  return (
    selectedCollection !== null ||
    (selectedCollection !== null && selectedCategory !== null) ||
    showOnlyInStock
  );
};

/* ================================
   SUB-COMPONENTS
================================= */
const FilterBadge = React.memo<FilterBadgeProps>(
  ({ label, isSelected, onClick, reduceMotion = false }) => {
    return (
      <motion.button
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        onClick={onClick}
        className="group relative"
        aria-pressed={isSelected}
        aria-label={`Filtrar por ${label}`}
        type="button"
      >
        {/* Glow effect - solo si está seleccionado */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
        )}

        <div
          className={`
            relative min-h-[48px] px-6 py-3 rounded-xl text-base font-bold
            transition-all duration-300 border shadow-lg touch-manipulation
            ${
              isSelected
                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-blue-500/50"
                : "bg-white/5 backdrop-blur-sm text-slate-200 border-white/10 hover:bg-white/10 hover:border-white/20"
            }
          `}
        >
          <span className="flex items-center gap-2">
            {label}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            )}
          </span>
        </div>
      </motion.button>
    );
  }
);

FilterBadge.displayName = "FilterBadge";

const FiltersHeader = React.memo(
  ({
    hasFilters,
    activeCount,
    onClear,
    reduceMotion,
  }: {
    hasFilters: boolean;
    activeCount: number;
    onClear: () => void;
    reduceMotion: boolean;
  }) => (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <motion.div
          className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg"
          animate={
            reduceMotion
              ? undefined
              : {
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(168, 85, 247, 0.4)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <Filter className="w-6 h-6 text-blue-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Filtros
          </h2>
          {hasFilters && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-slate-400 mt-1 font-medium"
            >
              ✨ {activeCount} {activeCount === 1 ? "activo" : "activos"}
            </motion.p>
          )}
        </div>
      </div>

      {hasFilters && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={onClear}
            className="min-h-[48px] px-5 text-base font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 touch-manipulation shadow-lg hover:shadow-red-500/20"
            aria-label="Limpiar todos los filtros"
            type="button"
          >
            <X className="w-5 h-5 mr-2" />
            Limpiar
          </Button>
        </motion.div>
      )}
    </div>
  )
);

FiltersHeader.displayName = "FiltersHeader";

const SectionTitle = React.memo(
  ({
    icon: Icon,
    title,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-full bg-purple-500/20 border border-purple-500/30">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
  )
);

SectionTitle.displayName = "SectionTitle";

const CategoryFilters = React.memo(
  ({
    categories,
    selectedCategory,
    onCategoryChange,
    reduceMotion,
  }: {
    categories: Category[];
    selectedCategory: string | null;
    onCategoryChange: (slug: string | null) => void;
    reduceMotion: boolean;
  }) => {
    // Si no hay categorías (o todavía no cargaron), no renderizamos nada
    if (!categories || categories.length === 0) return null;

    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle icon={Tag} title="🏷️ Categorías" />

        <div className="flex flex-wrap gap-3">
          <FilterBadge
            label="Todas"
            isSelected={!selectedCategory}
            onClick={() => onCategoryChange(null)}
            reduceMotion={reduceMotion}
          />

          {categories.map((cat) => (
            <FilterBadge
              key={cat.id}
              label={cat.name}
              isSelected={selectedCategory === cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </motion.div>
    );
  }
);

CategoryFilters.displayName = "CategoryFilters";

const CollectionFilters = React.memo(
  ({
    collections,
    selectedCollection,
    onCollectionChange,
    reduceMotion,
  }: {
    collections: Collection[];
    selectedCollection: string | null;
    onCollectionChange: (slug: string | null) => void;
    reduceMotion: boolean;
  }) => {
    if (collections.length === 0) return null;

    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle icon={Layers} title="📦 Colecciones" />

        <div className="flex flex-wrap gap-3">
          <FilterBadge
            label="Todas"
            isSelected={!selectedCollection}
            onClick={() => onCollectionChange(null)}
            reduceMotion={reduceMotion}
          />

          {collections.map((col) => (
            <FilterBadge
              key={col.id}
              label={col.name}
              isSelected={selectedCollection === col.slug}
              onClick={() => onCollectionChange(col.slug)}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </motion.div>
    );
  }
);

CollectionFilters.displayName = "CollectionFilters";

const StockFilter = React.memo(
  ({
    showOnlyInStock,
    onStockFilterChange,
    reduceMotion,
  }: {
    showOnlyInStock: boolean;
    onStockFilterChange: (value: boolean) => void;
    reduceMotion: boolean;
  }) => {
    const handleToggle = useCallback(() => {
      onStockFilterChange(!showOnlyInStock);
    }, [showOnlyInStock, onStockFilterChange]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        className="group relative"
      >
        {/* Glow effect cuando está activo */}
        {showOnlyInStock && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        )}

        <div className="relative p-6 rounded-xl border bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-between gap-4 min-h-[72px] transition-all duration-300 shadow-lg">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 shadow-lg"
              animate={
                showOnlyInStock && !reduceMotion
                  ? {
                      boxShadow: [
                        "0 0 20px rgba(16, 185, 129, 0.3)",
                        "0 0 30px rgba(16, 185, 129, 0.5)",
                        "0 0 20px rgba(16, 185, 129, 0.3)",
                      ],
                    }
                  : undefined
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              <Package className="w-6 h-6 text-emerald-400" />
            </motion.div>
            <div>
              <Label
                htmlFor="stock-filter"
                className="text-base font-bold text-white cursor-pointer flex items-center gap-2"
              >
                Solo disponibles
                {showOnlyInStock && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    ✅
                  </motion.span>
                )}
              </Label>
              <p className="text-sm text-slate-400 mt-1">
                Ocultar productos agotados
              </p>
            </div>
          </div>

          <Switch
            id="stock-filter"
            checked={showOnlyInStock}
            onCheckedChange={onStockFilterChange}
            className="data-[state=checked]:bg-emerald-500 touch-manipulation scale-125"
            aria-label="Mostrar solo productos disponibles"
          />
        </div>
      </motion.div>
    );
  }
);

StockFilter.displayName = "StockFilter";

/* ================================
   MAIN COMPONENT
================================= */
const Filters = ({
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  onCategoryChange,
  onCollectionChange,
  showOnlyInStock,
  onStockFilterChange,
  onClearFilters,
}: FiltersProps) => {
  const reduceMotion = useReducedMotion() || false;

  // ✅ Reseteo automático de categoría cuando cambia la colección
  const prevCollectionRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevCollectionRef.current;
    const curr = selectedCollection;

    // Primer render: setear ref y listo
    if (prev === null && curr === null) {
      prevCollectionRef.current = curr;
      return;
    }

    // Si cambia colección (incluye pasar a null), limpiar categoría
    if (prev !== curr) {
      if (selectedCategory !== null) {
        onCategoryChange(null);
      }
      prevCollectionRef.current = curr;
    }
  }, [selectedCollection, selectedCategory, onCategoryChange]);

  const hasFilters = useMemo(
    () => hasActiveFilters(selectedCategory, selectedCollection, showOnlyInStock),
    [selectedCategory, selectedCollection, showOnlyInStock]
  );

  const activeCount = useMemo(
    () =>
      getActiveFiltersCount(selectedCategory, selectedCollection, showOnlyInStock),
    [selectedCategory, selectedCollection, showOnlyInStock]
  );

  const handleClearFilters = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);

  // ✅ Mostrar categorías SOLO si hay colección seleccionada
  const shouldShowCategories = !!selectedCollection;

  return (
    <motion.div
      className="relative space-y-8 p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <FiltersHeader
          hasFilters={hasFilters}
          activeCount={activeCount}
          onClear={handleClearFilters}
          reduceMotion={reduceMotion}
        />

        {/* ✅ 1) Primero Colecciones */}
        <CollectionFilters
          collections={collections}
          selectedCollection={selectedCollection}
          onCollectionChange={onCollectionChange}
          reduceMotion={reduceMotion}
        />

        {/* ✅ 2) Luego Categorías (solo si hay colección elegida) */}
        {shouldShowCategories ? (
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            reduceMotion={reduceMotion}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 rounded-xl border bg-white/5 backdrop-blur-sm border-white/10 text-slate-300"
          >
            <p className="text-sm font-medium">
              Elegí una <span className="text-white font-bold">colección</span>{" "}
              para ver sus categorías.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              (Así evitamos el “menú de categorías infinito” versión director’s cut 😄)
            </p>
          </motion.div>
        )}

        <StockFilter
          showOnlyInStock={showOnlyInStock}
          onStockFilterChange={onStockFilterChange}
          reduceMotion={reduceMotion}
        />
      </div>
    </motion.div>
  );
};

export default Filters;
