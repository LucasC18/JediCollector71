import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Tag, 
  Layers, 
  X, 
  Package,
  Filter,
  Sparkles,
  Check,
} from "lucide-react"

type Category = {
  id: string
  name: string
  slug: string
}

type Collection = {
  id: string
  name: string
  slug: string
}

interface FiltersProps {
  categories: Category[]
  collections: Collection[]

  selectedCategory: string | null
  selectedCollection: string | null

  onCategoryChange: (slug: string | null) => void
  onCollectionChange: (slug: string | null) => void

  showOnlyInStock: boolean
  onStockFilterChange: (value: boolean) => void
  onClearFilters: () => void
}

/* ======================= FILTER BADGE COMPONENT ======================= */

interface FilterBadgeProps {
  label: string
  isSelected: boolean
  onClick: () => void
  icon?: React.ReactNode
}

const FilterBadge = ({ label, isSelected, onClick, icon }: FilterBadgeProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative px-4 py-2.5 rounded-full text-sm font-medium
        transition-all duration-300 border-2
        ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
            : "bg-background/50 backdrop-blur-sm text-foreground border-border hover:border-primary/60 hover:bg-primary/5"
        }
      `}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
        {isSelected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </span>
    </motion.button>
  )
}

/* ======================= MAIN FILTERS COMPONENT ======================= */

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
  const hasActiveFilters = 
    selectedCategory !== null || 
    selectedCollection !== null || 
    showOnlyInStock

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedCollection ? 1 : 0) + 
    (showOnlyInStock ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header con contador y clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Filter className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Filtros</h2>
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeFiltersCount} {activeFiltersCount === 1 ? "activo" : "activos"}
              </p>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
              >
                <X className="w-4 h-4" />
                Limpiar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Filters Pills */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Filtros aplicados</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge 
                      className="gap-1.5 pl-2 pr-1 py-1.5 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {categories.find(c => c.slug === selectedCategory)?.name}
                      <button
                        onClick={() => onCategoryChange(null)}
                        className="ml-1 p-0.5 hover:bg-primary/30 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                )}
                {selectedCollection && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge 
                      className="gap-1.5 pl-2 pr-1 py-1.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                    >
                      <Layers className="w-3 h-3" />
                      {collections.find(c => c.slug === selectedCollection)?.name}
                      <button
                        onClick={() => onCollectionChange(null)}
                        className="ml-1 p-0.5 hover:bg-purple-500/30 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                )}
                {showOnlyInStock && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge 
                      className="gap-1.5 pl-2 pr-1 py-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    >
                      <Package className="w-3 h-3" />
                      Solo disponibles
                      <button
                        onClick={() => onStockFilterChange(false)}
                        className="ml-1 p-0.5 hover:bg-emerald-500/30 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categorías */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Categorías
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterBadge
            label="Todas"
            isSelected={!selectedCategory}
            onClick={() => onCategoryChange(null)}
          />

          {categories.map((cat) => (
            <FilterBadge
              key={cat.id}
              label={cat.name}
              isSelected={selectedCategory === cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* Colecciones */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Colecciones
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterBadge
            label="Todas"
            isSelected={!selectedCollection}
            onClick={() => onCollectionChange(null)}
          />

          {collections.map((col) => (
            <FilterBadge
              key={col.id}
              label={col.name}
              isSelected={selectedCollection === col.slug}
              onClick={() => onCollectionChange(col.slug)}
            />
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="pt-2">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="p-4 rounded-2xl border-2 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div 
                animate={{ 
                  backgroundColor: showOnlyInStock 
                    ? "rgb(16 185 129 / 0.2)" 
                    : "rgb(0 0 0 / 0.05)" 
                }}
                className="p-2.5 rounded-xl transition-colors"
              >
                <Package className={`w-5 h-5 transition-colors ${
                  showOnlyInStock 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-muted-foreground"
                }`} />
              </motion.div>
              <div className="flex-1">
                <Label 
                  htmlFor="stock-filter" 
                  className="text-sm font-semibold cursor-pointer block"
                >
                  Solo productos disponibles
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ocultar productos agotados
                </p>
              </div>
            </div>
            
            <Switch
              id="stock-filter"
              checked={showOnlyInStock}
              onCheckedChange={onStockFilterChange}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Filters