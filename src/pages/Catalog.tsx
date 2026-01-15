import { useEffect, useMemo, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"

import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"

import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PRODUCTS_PER_PAGE = 24
const FILTERS_LIMIT = 1000 // para calcular categorías/colecciones sin depender de la página

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

const Catalog = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [products, setProducts] = useState<Product[]>([])
  const [allFilteredProducts, setAllFilteredProducts] = useState<Product[]>([])
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

  const handleNavigateToProduct = (id: string) => {
    navigate(`/producto/${id}`)
  }

  /* ======================= DEBOUNCE ======================= */
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  /* ======================= LOAD META ======================= */
  useEffect(() => {
    apiFetch<Category[]>("/v1/categories").then(setCategories).catch(() => setCategories([]))
    apiFetch<Collection[]>("/v1/collections").then(setCollections).catch(() => setCollections([]))
  }, [])

  /* ======================= READ URL PARAMS (IMPORTANT) ======================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlCategory = params.get("category")
    const urlCollection = params.get("collection")
    const urlSearch = params.get("search")

    // Solo seteamos si vienen en URL (así no pisamos cambios del usuario)
    startTransition(() => {
      if (urlCollection !== null) setSelectedCollection(urlCollection || null)
      if (urlCategory !== null) setSelectedCategory(urlCategory || null)
      if (urlSearch !== null) {
        setSearchQuery(urlSearch || "")
        setDebouncedQuery(urlSearch || "")
      }
      setCurrentPage(1)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  /* ======================= FILTER PARAMS ======================= */
  const buildParams = (withPaging: boolean) => {
    const params = new URLSearchParams()

    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedCollection) params.set("collection", selectedCollection)
    if (debouncedQuery) params.set("search", debouncedQuery)
    if (showOnlyInStock) params.set("inStock", "true")

    if (withPaging) {
      params.set("page", String(currentPage))
      params.set("limit", String(PRODUCTS_PER_PAGE))
    }

    return params.toString()
  }

  /* ======================= LOAD PRODUCTS (PAGE) ======================= */
  useEffect(() => {
    setIsLoading(true)

    apiFetch<{ items: Product[]; total: number }>(`/v1/products?${buildParams(true)}`)
      .then((res) => {
        setProducts(res.items || [])
        setTotal(res.total || 0)
      })
      .catch(() => {
        setProducts([])
        setTotal(0)
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCollection, debouncedQuery, showOnlyInStock, currentPage])

  /* ======================= LOAD PRODUCTS (FOR FILTERS) ======================= */
  useEffect(() => {
    // Misma query, pero sin paginar, con limit alto (si backend lo limita por default)
    const params = new URLSearchParams(buildParams(false))
    params.set("limit", String(FILTERS_LIMIT))
    params.set("page", "1")

    apiFetch<{ items: Product[] }>(`/v1/products?${params.toString()}`)
      .then((res) => setAllFilteredProducts(res.items || []))
      .catch(() => setAllFilteredProducts([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCollection, debouncedQuery, showOnlyInStock])

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))

  /* ======================= FILTERS ======================= */
  const visibleCollections = collections.filter((col) =>
    allFilteredProducts.some((p) => p.collectionSlug === col.slug)
  )

  const visibleCategories = categories.filter((cat) =>
    allFilteredProducts.some((p) => p.categorySlug === cat.slug)
  )

  /* ======================= HANDLERS ======================= */
  const handleCategoryChange = (slug: string | null) => {
    startTransition(() => {
      setSelectedCategory(slug)
      setCurrentPage(1)
    })
  }

  const handleCollectionChange = (slug: string | null) => {
    startTransition(() => {
      setSelectedCollection(slug)
      setSelectedCategory(null)
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

  /* ======================= UI ======================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <div className="h-20" />

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        {/* Search Bar */}
        <div className="mb-10">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filters */}
        <div className="mb-10">
          <Filters
            collections={visibleCollections}
            categories={visibleCategories}
            selectedCategory={selectedCategory}
            selectedCollection={selectedCollection}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={handleCollectionChange}
            showOnlyInStock={showOnlyInStock}
            onStockFilterChange={setShowOnlyInStock}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Badge de productos */}
        <div className="mb-8 flex justify-center md:justify-start">
          <Badge className="text-base px-4 py-2 bg-slate-800/80 text-slate-200 border-slate-700 shadow-lg">
            {total} {total === 1 ? "producto" : "productos"}
          </Badge>
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-slate-300 text-xl font-medium">Cargando productos...</p>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductGrid
                products={products}
                onClearFilters={handleClearFilters}
                onNavigate={handleNavigateToProduct}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
          >
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="min-h-[52px] min-w-[52px] px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              size="lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-800/80 border border-slate-700 rounded-xl shadow-lg">
              <span className="text-slate-200 font-semibold text-lg">
                Página <span className="text-primary">{currentPage}</span> de {totalPages}
              </span>
            </div>
            
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="min-h-[52px] min-w-[52px] px-6 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              size="lg"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Catalog