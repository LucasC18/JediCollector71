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
  productsCount: number
}

type Collection = {
  id: string
  name: string
  slug: string
  productsCount: number
}

/* ======================= PAGINATION ======================= */

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
    <motion.div className="flex justify-center gap-2 mt-12">
      <Button disabled={!canGoPrev || isLoading} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft />
      </Button>
      <span className="px-4 py-2">{currentPage} / {totalPages}</span>
      <Button disabled={!canGoNext || isLoading} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight />
      </Button>
    </motion.div>
  )
}

/* ======================= MAIN ======================= */

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

  /* Debounce */
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  /* Load filters */
  useEffect(() => {
    apiFetch<Category[]>("/v1/categories").then(setCategories).catch(() => setCategories([]))
    apiFetch<Collection[]>("/v1/collections").then(setCollections).catch(() => setCollections([]))
  }, [])

  /* Visible filters */
  const visibleCollections = collections.filter(c => c.productsCount > 0)
  const visibleCategories = categories.filter(c => c.productsCount > 0)

  const filteredCategories =
    selectedCollection === "star-wars"
      ? visibleCategories
      : visibleCategories.filter(c => c.slug !== "hasbro-375")

  /* Load products */
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedCollection) params.set("collection", selectedCollection)
    if (debouncedQuery) params.set("search", debouncedQuery)
    if (showOnlyInStock) params.set("inStock", "true")
    params.set("page", String(currentPage))
    params.set("limit", String(PRODUCTS_PER_PAGE))

    setIsLoading(true)
    apiFetch<{ items: Product[]; total: number }>(`/v1/products?${params}`)
      .then(res => {
        setProducts(res.items)
        setTotal(res.total)
      })
      .catch(() => {
        setProducts([])
        setTotal(0)
      })
      .finally(() => setIsLoading(false))
  }, [selectedCategory, selectedCollection, debouncedQuery, showOnlyInStock, currentPage])

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))

  const handleCategoryChange = (slug: string | null) => {
    startTransition(() => {
      setSelectedCategory(slug)
      setCurrentPage(1)
    })
  }

  const handleCollectionChange = (slug: string | null) => {
    startTransition(() => {
      setSelectedCollection(slug)
      setSelectedCategory(null) // reset categorías incompatibles
      setCurrentPage(1)
    })
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setDebouncedQuery("")
    setSelectedCategory(null)
    setSelectedCollection(null)
    setShowOnlyInStock(false)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <div className="h-20" />

      <main className="container mx-auto px-4 pt-10 pb-20">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <Filters
          collections={visibleCollections}
          categories={filteredCategories}
          selectedCategory={selectedCategory}
          selectedCollection={selectedCollection}
          onCategoryChange={handleCategoryChange}
          onCollectionChange={handleCollectionChange}
          showOnlyInStock={showOnlyInStock}
          onStockFilterChange={setShowOnlyInStock}
          onClearFilters={handleClearFilters}
        />

        <div className="my-6">
          <Badge>{total} productos</Badge>
        </div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div key="loading">Cargando...</motion.div>
          ) : (
            <ProductGrid products={products} onClearFilters={handleClearFilters} />
          )}
        </AnimatePresence>

        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Catalog
