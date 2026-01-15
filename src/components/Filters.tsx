import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Tag,
  Layers,
  X,
  Package,
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

/* ======================= FILTER BADGE ======================= */

interface FilterBadgeProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

const FilterBadge = ({ label, isSelected, onClick }: FilterBadgeProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        min-h-[44px] px-6 py-3 rounded-full text-sm font-bold
        transition-all duration-200 border
        ${
          isSelected
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-md"
            : "bg-black/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/30"
        }
      `}
    >
      <span className="flex items-center gap-2">
        {label}
        {isSelected && <Check className="w-4 h-4" />}
      </span>
    </motion.button>
  )
}

/* ======================= MAIN ======================= */

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
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-purple-300">Filtros</h2>
          {hasActiveFilters && (
            <p className="text-xs text-purple-200">
              {activeFiltersCount} activos
            </p>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-red-400 min-h-[40px]"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* ================= CATEGORIAS ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-300" />
          <h3 className="text-sm font-bold text-purple-300">Categorías</h3>
        </div>

        <div className="flex flex-wrap gap-3">
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

      {/* ================= COLECCIONES ================= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink-300" />
          <h3 className="text-sm font-bold text-pink-300">Colecciones</h3>
        </div>

        <div className="flex flex-wrap gap-3">
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

      {/* ================= STOCK ================= */}
      <div className="p-5 rounded-xl border border-purple-500/30 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-emerald-400" />
          <div>
            <Label className="text-sm font-bold text-white">
              Solo disponibles
            </Label>
            <p className="text-xs text-muted-foreground">
              Ocultar agotados
            </p>
          </div>
        </div>

        <Switch checked={showOnlyInStock} onCheckedChange={onStockFilterChange} />
      </div>
    </div>
  )
}

export default Filters
