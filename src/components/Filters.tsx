import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Tag, 
  Layers, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Package,
  Filter,
  Sparkles,
} from "lucide-react"
import { useState } from "react"

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

/* ======================= FILTER SECTION COMPONENT ======================= */

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isCollapsible?: boolean
  defaultExpanded?: boolean
}

const FilterSection = ({ 
  title, 
  icon, 
  children, 
  isCollapsible = true,
  defaultExpanded = true 
}: FilterSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        
        {isCollapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ======================= FILTER BADGE COMPONENT ======================= */

interface FilterBadgeProps {
  label: string
  isSelected: boolean
  onClick: () => void
  count?: number
}

const FilterBadge = ({ label, isSelected, onClick, count }: FilterBadgeProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge
        role="button"
        onClick={onClick}
        className={`
          cursor-pointer px-4 py-2 transition-all duration-300 font-medium
          ${
            isSelected
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "bg-card border-2 border-border hover:border-primary/50 hover:bg-primary/10"
          }
        `}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span className="ml-1.5 opacity-70 text-xs">({count})</span>
        )}
      </Badge>
    </motion.div>
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
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 space-y-6 shadow-lg border-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Filtros</h2>
              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground">
                  {activeFiltersCount} {activeFiltersCount === 1 ? "filtro activo" : "filtros activos"}
                </p>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Limpiar todo</span>
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" />
                  Filtros aplicados:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <Badge 
                      variant="secondary" 
                      className="gap-1 pr-1 bg-primary/20 text-primary border-primary/30"
                    >
                      <Tag className="w-3 h-3" />
                      {categories.find(c => c.slug === selectedCategory)?.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCategoryChange(null)}
                        className="h-4 w-4 p-0 ml-1 hover:bg-primary/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  {selectedCollection && (
                    <Badge 
                      variant="secondary"
                      className="gap-1 pr-1 bg-primary/20 text-primary border-primary/30"
                    >
                      <Layers className="w-3 h-3" />
                      {collections.find(c => c.slug === selectedCollection)?.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCollectionChange(null)}
                        className="h-4 w-4 p-0 ml-1 hover:bg-primary/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                  {showOnlyInStock && (
                    <Badge 
                      variant="secondary"
                      className="gap-1 pr-1 bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                    >
                      <Package className="w-3 h-3" />
                      Solo disponibles
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStockFilterChange(false)}
                        className="h-4 w-4 p-0 ml-1 hover:bg-emerald-500/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categorías */}
        <FilterSection 
          title="Categorías" 
          icon={<Tag className="w-4 h-4 text-primary" />}
        >
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
        </FilterSection>

        {/* Colecciones */}
        <FilterSection 
          title="Colecciones" 
          icon={<Layers className="w-4 h-4 text-primary" />}
        >
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
        </FilterSection>

        {/* Stock Filter */}
        <div className="pt-4 border-t">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 rounded-lg border-2 bg-card hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${
                showOnlyInStock 
                  ? "bg-emerald-500/20 text-emerald-600" 
                  : "bg-muted text-muted-foreground"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <Label 
                  htmlFor="stock-filter" 
                  className="text-sm font-semibold cursor-pointer"
                >
                  Solo productos disponibles
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ocultar productos sin stock
                </p>
              </div>
            </div>
            
            <Switch
              id="stock-filter"
              checked={showOnlyInStock}
              onCheckedChange={onStockFilterChange}
              className="data-[state=checked]:bg-emerald-500"
            />
          </motion.div>
        </div>

        {/* Clear All Button (Bottom) */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 border-t"
          >
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
            >
              <X className="w-4 h-4" />
              Limpiar todos los filtros
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}

export default Filters