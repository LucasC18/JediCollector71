import { useCallback, useEffect, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Sparkles,
  Zap,
  Filter,
  RefreshCw,
  Shield,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PRODUCTS_PER_PAGE = 24

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

/* ======================= PAGINATION COMPONENT ======================= */

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
}

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) => {
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <>
      <style>{`
        @keyframes pagination-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
                        0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6),
                        0 0 60px rgba(168, 85, 247, 0.3);
          }
        }

        .pagination-active {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: white;
          border: 2px solid rgba(168, 85, 247, 0.5);
          animation: pagination-glow 2s ease-in-out infinite;
        }

        .pagination-btn {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 250, 0.8));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 2px solid rgba(168, 85, 247, 0.2);
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          transform: scale(1.05);
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mt-12"
      >
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoPrev || isLoading}
          onClick={() => onPageChange(1)}
          className="hidden sm:inline-flex pagination-btn"
        >
          <ChevronsLeft className="w-4 h-4 text-purple-600" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoPrev || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="pagination-btn"
        >
          <ChevronLeft className="w-4 h-4 text-purple-600" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number

            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            const isActive = pageNum === currentPage

            return (
              <motion.div
                key={pageNum}
                whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  disabled={isLoading}
                  onClick={() => onPageChange(pageNum)}
                  className={isActive ? "pagination-active" : "pagination-btn"}
                >
                  <span className={isActive ? "text-white font-bold" : "text-purple-700 font-semibold"}>
                    {pageNum}
                  </span>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoNext || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="pagination-btn"
        >
          <ChevronRight className="w-4 h-4 text-purple-600" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoNext || isLoading}
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:inline-flex pagination-btn"
        >
          <ChevronsRight className="w-4 h-4 text-purple-600" />
        </Button>

        {/* Page Info */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-4 hidden md:flex items-center gap-2 px-4 py-2 rounded-full border-2 border-purple-200"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.15)'
          }}
        >
          <span className="text-sm font-bold text-purple-700">{currentPage}</span>
          <span className="text-sm text-purple-400">/</span>
          <span className="text-sm text-purple-500">{totalPages}</span>
        </motion.div>
      </motion.div>
    </>
  )
}

/* ======================= STATS BAR COMPONENT ======================= */

interface StatsBarProps {
  total: number
  isLoading: boolean
  hasFilters: boolean
}

const StatsBar = ({ total, isLoading, hasFilters }: StatsBarProps) => {
  return (
    <>
      <style>{`
        @keyframes stats-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
          }
        }

        .stats-icon-box {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1));
          border: 2px solid rgba(168, 85, 247, 0.3);
          animation: stats-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl stats-icon-box">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm font-medium text-purple-500">Cargando productos...</span>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {total}
                </p>
                <p className="text-sm text-muted-foreground">
                  {total === 1 ? "producto disponible" : "productos disponibles"}
                  {hasFilters && " (filtrados)"}
                </p>
              </>
            )}
          </div>
        </div>

        {hasFilters && !isLoading && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Badge 
              className="gap-1.5 px-3 py-1.5 font-bold border-2 border-purple-300"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.15))',
                color: '#9333ea',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtros activos
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

/* ======================= SKELETON LOADER ======================= */

const SkeletonGrid = () => {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton-card {
          background: linear-gradient(
            90deg,
            rgba(168, 85, 247, 0.05) 0%,
            rgba(236, 72, 153, 0.1) 50%,
            rgba(168, 85, 247, 0.05) 100%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 2s ease-in-out infinite;
          border: 2px solid rgba(168, 85, 247, 0.1);
        }
      `}</style>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="space-y-3"
          >
            <div className="aspect-square skeleton-card rounded-2xl" />
            <div className="h-4 skeleton-card rounded-full w-3/4" />
            <div className="h-3 skeleton-card rounded-full w-1/2" />
          </motion.div>
        ))}
      </div>
    </>
  )
}

/* ======================= HERO SECTION ======================= */

const HeroSection = ({ total, isLoading }: { total: number; isLoading: boolean }) => {
  return (
    <>
      <style>{`
        @keyframes text-glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.3),
                         0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% { 
            text-shadow: 0 0 30px rgba(168, 85, 247, 0.5),
                         0 0 60px rgba(168, 85, 247, 0.3);
          }
        }

        .hero-title {
          animation: text-glow 3s ease-in-out infinite;
        }

        .feature-badge {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 2px solid rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
        }

        .feature-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
          border-color: rgba(168, 85, 247, 0.5);
        }

        .feature-badge-emerald {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.1));
          border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .feature-badge-emerald:hover {
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
          border-color: rgba(16, 185, 129, 0.5);
        }

        .feature-badge-blue {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1));
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .feature-badge-blue:hover {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.4);
          border-color: rgba(59, 130, 246, 0.5);
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 space-y-6"
      >
        {/* Title with gradient */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight hero-title"
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Nuestro Catálogo
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Descubre nuestra selección de productos de calidad
          </motion.p>
        </div>

        {/* Quick Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full feature-badge"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Alta Calidad</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full feature-badge-emerald"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Envío Rápido</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full feature-badge-blue"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Garantía</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

/* ======================= MAIN CATALOG COMPONENT ======================= */

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showOnlyInStock, setShowOnlyInStock] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [, startTransition] = useTransition()

  /* =======================
     Debounce search
  ======================= */
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  /* =======================
     Load categories & collections
  ======================= */
  useEffect(() => {
    apiFetch<Category[]>("/v1/categories")
      .then(setCategories)
      .catch(() => setCategories([]))

    apiFetch<Collection[]>("/v1/collections")
      .then(setCollections)
      .catch(() => setCollections([]))
  }, [])

  /* =======================
     Fetch products
  ======================= */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const params = new URLSearchParams()

      if (selectedCategory) params.set("category", selectedCategory)
      if (selectedCollection) params.set("collection", selectedCollection)
      if (debouncedQuery) params.set("search", debouncedQuery)
      if (showOnlyInStock) params.set("inStock", "true")

      params.set("page", String(currentPage))
      params.set("limit", String(PRODUCTS_PER_PAGE))

      try {
        const res = await apiFetch<{ items: Product[]; total: number }>(
          `/v1/products?${params.toString()}`
        )

        setProducts(res.items)
        setTotal(res.total)
      } catch {
        setProducts([])
        setTotal(0)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [selectedCategory, selectedCollection, debouncedQuery, showOnlyInStock, currentPage])

  /* =======================
     Handlers
  ======================= */

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      startTransition(() => {
        setSelectedCategory(slug)
        setCurrentPage(1)
      })
    },
    []
  )

  const handleCollectionChange = useCallback(
    (slug: string | null) => {
      startTransition(() => {
        setSelectedCollection(slug)
        setCurrentPage(1)
      })
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
    setSelectedCategory(null)
    setSelectedCollection(null)
    setShowOnlyInStock(false)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))
  
  const hasActiveFilters = 
    !!selectedCategory || 
    !!selectedCollection || 
    !!debouncedQuery || 
    showOnlyInStock

  /* =======================
     UI
  ======================= */
  return (
    <>
      <style>{`
        .results-info {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05));
          border: 2px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.15);
        }
      `}</style>

      <div className="min-h-screen bg-background">
        <Navbar onCartClick={() => setIsCartOpen(true)} />

        {/* Spacer for fixed navbar */}
        <div className="h-20" />

        <main className="container mx-auto px-4 pt-10 pb-20">
          {/* Hero Section */}
          <HeroSection total={total} isLoading={isLoading} />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Filters
              categories={categories}
              collections={collections}
              selectedCategory={selectedCategory}
              selectedCollection={selectedCollection}
              onCategoryChange={handleCategoryChange}
              onCollectionChange={handleCollectionChange}
              showOnlyInStock={showOnlyInStock}
              onStockFilterChange={(value) => {
                startTransition(() => {
                  setShowOnlyInStock(value)
                  setCurrentPage(1)
                })
              }}
              onClearFilters={handleClearFilters}
            />
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <StatsBar 
              total={total} 
              isLoading={isLoading} 
              hasFilters={hasActiveFilters}
            />
          </motion.div>

          {/* Products Grid / Loading / Empty State */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonGrid />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ProductGrid 
                  products={products} 
                  onClearFilters={handleClearFilters}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!isLoading && products.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}

          {/* Results Info at Bottom */}
          {!isLoading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mt-10"
            >
              <div className="results-info px-4 py-3 rounded-full inline-block">
                <p className="text-sm">
                  Mostrando{" "}
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                  </span>
                  {" "}-{" "}
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, total)}
                  </span>
                  {" "}de{" "}
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {total}
                  </span>
                  {" "}productos
                </p>
              </div>
            </motion.div>
          )}
        </main>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </>
  )
}

export default Catalog