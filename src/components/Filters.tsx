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
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative px-5 py-2.5 rounded-full text-sm font-bold
        transition-all duration-300 border-2 overflow-hidden
        ${
          isSelected
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 shadow-lg"
            : "bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-purple-200 border-purple-500/30 hover:border-purple-400/60"
        }
      `}
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isSelected 
          ? '0 0 25px rgba(168, 85, 247, 0.5), 0 0 50px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
          : '0 4px 15px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      
      <span className="flex items-center gap-2 relative z-10">
        {icon}
        {label}
        {isSelected && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </span>

      {/* Glow effect when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.4)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
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
    <>
      <style>{`
        @keyframes filter-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
                        0 0 40px rgba(168, 85, 247, 0.15);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
                        0 0 60px rgba(168, 85, 247, 0.25);
          }
        }

        @keyframes sparkle-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .filter-header-glow {
          animation: filter-glow 3s ease-in-out infinite;
        }

        .sparkle-animate {
          animation: sparkle-pulse 2s ease-in-out infinite;
        }

        .gradient-animated {
          background-size: 200% 200%;
          animation: gradient-move 4s ease infinite;
        }

        .glassmorphism-filter {
          background: rgba(30, 30, 30, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid rgba(168, 85, 247, 0.2);
        }

        .neon-border-purple {
          position: relative;
          border: 2px solid rgba(168, 85, 247, 0.3);
        }

        .neon-border-purple::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7);
          background-size: 300% 300%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
          animation: gradient-move 4s ease infinite;
        }

        .neon-border-purple:hover::before {
          opacity: 0.4;
        }

        /* Safari-specific optimizations */
        @supports (-webkit-touch-callout: none) {
          .glassmorphism-filter {
            -webkit-backdrop-filter: blur(20px);
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header con contador y clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2.5 rounded-xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                border: '2px solid rgba(168, 85, 247, 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                  '0 0 30px rgba(168, 85, 247, 0.5)',
                  '0 0 20px rgba(168, 85, 247, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Filter className="w-5 h-5 text-purple-400 relative z-10" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Filtros
              </h2>
              {hasActiveFilters && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-purple-300/70 mt-0.5"
                >
                  {activeFiltersCount} {activeFiltersCount === 1 ? "activo" : "activos"}
                </motion.p>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 font-bold glassmorphism-filter rounded-xl"
                  style={{
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                  }}
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
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div 
                className="p-5 rounded-2xl relative overflow-hidden gradient-animated"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1), rgba(6, 182, 212, 0.1))',
                  border: '2px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.2), inset 0 0 30px rgba(168, 85, 247, 0.05)'
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400 sparkle-animate" />
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Filtros aplicados
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge 
                        className="gap-1.5 pl-3 pr-2 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white border-0 font-bold rounded-full"
                        style={{
                          boxShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {categories.find(c => c.slug === selectedCategory)?.name}
                        <button
                          onClick={() => onCategoryChange(null)}
                          className="ml-1 p-1 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  )}
                  {selectedCollection && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge 
                        className="gap-1.5 pl-3 pr-2 py-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white border-0 font-bold rounded-full"
                        style={{
                          boxShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {collections.find(c => c.slug === selectedCollection)?.name}
                        <button
                          onClick={() => onCollectionChange(null)}
                          className="ml-1 p-1 hover:bg-white/20 rounded-full transition-all hover:scale-110"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  )}
                  {showOnlyInStock && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge 
                        className="gap-1.5 pl-3 pr-2 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-0 font-bold rounded-full"
                        style={{
                          boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <Package className="w-3.5 h-3.5" />
                        Solo disponibles
                        <button
                          onClick={() => onStockFilterChange(false)}
                          className="ml-1 p-1 hover:bg-white/20 rounded-full transition-all hover:scale-110"
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
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Categorías
            </h3>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <FilterBadge
              label="Todas"
              isSelected={!selectedCategory}
              onClick={() => onCategoryChange(null)}
            />

            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + (index * 0.05) }}
              >
                <FilterBadge
                  label={cat.name}
                  isSelected={selectedCategory === cat.slug}
                  onClick={() => onCategoryChange(cat.slug)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Colecciones */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Colecciones
            </h3>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <FilterBadge
              label="Todas"
              isSelected={!selectedCollection}
              onClick={() => onCollectionChange(null)}
            />

            {collections.map((col, index) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + (index * 0.05) }}
              >
                <FilterBadge
                  label={col.name}
                  isSelected={selectedCollection === col.slug}
                  onClick={() => onCollectionChange(col.slug)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stock Filter */}
        <motion.div 
          className="pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-5 rounded-2xl neon-border-purple relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(20, 20, 20, 0.8))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Animated background gradient */}
            <div 
              className="absolute inset-0 opacity-20 gradient-animated"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.2))',
                backgroundSize: '200% 200%'
              }}
            ></div>

            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3 flex-1">
                <motion.div 
                  animate={{ 
                    backgroundColor: showOnlyInStock 
                      ? "rgba(16, 185, 129, 0.3)" 
                      : "rgba(168, 85, 247, 0.1)" 
                  }}
                  className="p-3 rounded-xl transition-all"
                  style={{
                    border: showOnlyInStock 
                      ? '2px solid rgba(16, 185, 129, 0.5)' 
                      : '2px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: showOnlyInStock 
                      ? '0 0 20px rgba(16, 185, 129, 0.4)' 
                      : '0 0 15px rgba(168, 85, 247, 0.2)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Package className={`w-5 h-5 transition-all ${
                    showOnlyInStock 
                      ? "text-emerald-400" 
                      : "text-purple-400"
                  }`} />
                </motion.div>
                <div className="flex-1">
                  <Label 
                    htmlFor="stock-filter" 
                    className="text-sm font-bold cursor-pointer block text-purple-100"
                  >
                    Solo productos disponibles
                  </Label>
                  <p className="text-xs text-purple-300/60 mt-1">
                    Ocultar productos agotados
                  </p>
                </div>
              </div>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Switch
                  id="stock-filter"
                  checked={showOnlyInStock}
                  onCheckedChange={onStockFilterChange}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default Filters