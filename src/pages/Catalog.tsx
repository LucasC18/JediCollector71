import { useCallback, useEffect, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"
import { useSearchParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Sparkles,
  TrendingUp,
  Zap,
  LayoutGrid,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

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
        className="hidden sm:inline-flex hover:scale-110 transition-transform"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>

      {/* Previous Page */}
      <Button
        variant="outline"
        size="icon"
        disabled={!canGoPrev || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="hover:scale-110 transition-transform"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {/* Show up to 5 page numbers */}
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
            <Button
              key={pageNum}
              variant={isActive ? "default" : "outline"}
              size="icon"
              disabled={isLoading}
              onClick={() => onPageChange(pageNum)}
              className={`
                transition-all duration-300
                ${isActive 
                  ? "scale-110 shadow-lg ring-2 ring-primary ring-offset-2" 
                  : "hover:scale-105"
                }
              `}
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      {/* Next Page */}
      <Button
        variant="outline"
        size="icon"
        disabled={!canGoNext || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="hover:scale-110 transition-transform"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Last Page */}
      <Button
        variant="outline"
        size="icon"
        disabled={!canGoNext || isLoading}
        onClick={() => onPageChange(totalPages)}
        className="hidden sm:inline-flex hover:scale-110 transition-transform"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>

      {/* Page Info */}
      <div className="ml-4 hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{currentPage}</span>
        <span>/</span>
        <span>{totalPages}</span>
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Cargando...
              </span>
            ) : (
              <>
                <span className="font-bold text-foreground text-lg">{total}</span>{" "}
                {total === 1 ? "producto" : "productos"}
                {hasFilters && " encontrados"}
              </>
            )}
          </span>
        </div>
      </div>

      {hasFilters && !isLoading && (
        <Badge variant="secondary" className="gap-1 animate-in fade-in duration-300">
          <Filter className="w-3 h-3" />
          Filtros activos
        </Badge>
      )}
    </motion.div>
  )
}

/* ======================= SKELETON LOADER ======================= */

const SkeletonGrid = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="space-y-3"
        >
          <div className="aspect-square bg-gradient-to-br from-muted/80 to-muted/40 animate-pulse rounded-xl" />
          <div className="h-4 bg-muted/60 animate-pulse rounded w-3/4" />
          <div className="h-3 bg-muted/40 animate-pulse rounded w-1/2" />
        </motion.div>
      ))}
    </div>
  )
}

/* ======================= HERO SECTION ======================= */

const HeroSection = ({ total, isLoading }: { total: number; isLoading: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10 space-y-4"
    >
      {/* Title with gradient */}
      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in slide-in-from-top-4 duration-700">
        Nuestro Catálogo
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-lg text-muted-foreground max-w-2xl mx-auto"
      >
        Descubre nuestra selección de productos premium
      </motion.p>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex items-center justify-center gap-6 pt-2"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Calidad Premium</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Zap className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium">Entrega Rápida</span>
        </div>
      </motion.div>
    </motion.div>
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

  const [searchParams, setSearchParams] = useSearchParams()

  const categoryFromUrl = searchParams.get("category")
  const collectionFromUrl = searchParams.get("collection")

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
     Sync URL → state
  ======================= */
  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
    setSelectedCollection(collectionFromUrl)
    setCurrentPage(1)
  }, [categoryFromUrl, collectionFromUrl])

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
     Handlers (URL SAFE)
  ======================= */

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      startTransition(() => {
        setSelectedCategory(slug)
        setCurrentPage(1)
      })

      const params = new URLSearchParams()
      if (slug) params.set("category", slug)
      if (selectedCollection) params.set("collection", selectedCollection)

      setSearchParams(params)
    },
    [selectedCollection, setSearchParams]
  )

  const handleCollectionChange = useCallback(
    (slug: string | null) => {
      startTransition(() => {
        setSelectedCollection(slug)
        setCurrentPage(1)
      })

      const params = new URLSearchParams()
      if (selectedCategory) params.set("category", selectedCategory)
      if (slug) params.set("collection", slug)

      setSearchParams(params)
    },
    [selectedCategory, setSearchParams]
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
    setSelectedCategory(null)
    setSelectedCollection(null)
    setShowOnlyInStock(false)
    setCurrentPage(1)
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Smooth scroll to top
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
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      <main className="container mx-auto px-4 pt-8 pb-20">
        {/* Hero Section */}
        <HeroSection total={total} isLoading={isLoading} />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
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
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
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
              transition={{ duration: 0.5 }}
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
            transition={{ delay: 0.3 }}
            className="text-center mt-8 text-sm text-muted-foreground"
          >
            Mostrando{" "}
            <span className="font-semibold text-foreground">
              {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
            </span>
            {" "}-{" "}
            <span className="font-semibold text-foreground">
              {Math.min(currentPage * PRODUCTS_PER_PAGE, total)}
            </span>
            {" "}de{" "}
            <span className="font-semibold text-foreground">{total}</span>
            {" "}productos
          </motion.div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Custom Styles */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default Catalog