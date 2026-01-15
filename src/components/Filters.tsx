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
  Filter,
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
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`
        min-h-[48px] px-6 py-3 rounded-xl text-base font-bold
        transition-all duration-300 border shadow-lg
        ${
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-primary/50 scale-105"
            : "bg-slate-800/60 text-slate-200 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
        }
      `}
    >
      <span className="flex items-center gap-2">
        {label}
        {isSelected && <Check className="w-5 h-5" />}
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
    <div className="space-y-8 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
            <Filter className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Filtros</h2>
            {hasActiveFilters && (
              <p className="text-sm text-slate-400 mt-1">
                {activeFiltersCount} {activeFiltersCount === 1 ? "activo" : "activos"}
              </p>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onClearFilters}
            className="min-h-[48px] px-5 text-base text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-300"
          >
            <X className="w-5 h-5 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* ================= CATEGORIAS ================= */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-slate-200">Categorías</h3>
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
      )}

      {/* ================= COLECCIONES ================= */}
      {collections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-slate-200">Colecciones</h3>
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
      )}

      {/* ================= STOCK ================= */}
      <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/60 flex items-center justify-between gap-4 min-h-[72px] hover:bg-slate-700/60 hover:border-slate-600 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Package className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <Label className="text-base font-bold text-slate-100 cursor-pointer">
              Solo disponibles
            </Label>
            <p className="text-sm text-slate-400 mt-1">
              Ocultar productos agotados
            </p>
          </div>
        </div>

        <Switch 
          checked={showOnlyInStock} 
          onCheckedChange={onStockFilterChange}
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>
    </div>
  )
}

export default Filters