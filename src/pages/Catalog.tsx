import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"
import { useSearchParams } from "react-router-dom"

const PRODUCTS_PER_PAGE = 24

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showOnlyInStock, setShowOnlyInStock] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

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
     Sync URL → state
  ======================= */
  useEffect(() => {
    if (categoryFromUrl) setSelectedCategories([categoryFromUrl])
    else setSelectedCategories([])

    if (collectionFromUrl) setSelectedCollection(collectionFromUrl)
    else setSelectedCollection(null)

    setCurrentPage(1)
  }, [categoryFromUrl, collectionFromUrl])

  /* =======================
     Fetch desde backend
  ======================= */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)

      const params = new URLSearchParams()

      if (selectedCategories[0]) params.set("category", selectedCategories[0])
      if (selectedCollection) params.set("collection", selectedCollection)
      if (debouncedQuery) params.set("search", debouncedQuery)
      if (showOnlyInStock) params.set("inStock", "true")

      params.set("page", String(currentPage))
      params.set("limit", String(PRODUCTS_PER_PAGE))

      try {
        const res = await apiFetch<{
          items: Product[]
          total: number
        }>(`/v1/products?${params.toString()}`)

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
  }, [
    selectedCategories,
    selectedCollection,
    debouncedQuery,
    showOnlyInStock,
    currentPage,
  ])

  /* =======================
     Categorías visibles
  ======================= */
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  /* =======================
     Handlers
  ======================= */
  const handleCategoryToggle = useCallback(
    (category: string) => {
      startTransition(() => {
        setSelectedCategories((prev) =>
          prev.includes(category) ? [] : [category]
        )
        setCurrentPage(1)
      })
      setSearchParams(category ? { category } : {})
    },
    [setSearchParams]
  )

  const handleClearCategories = useCallback(() => {
    startTransition(() => {
      setSelectedCategories([])
      setCurrentPage(1)
    })
    setSearchParams({})
  }, [setSearchParams])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setDebouncedQuery("")
    setSelectedCategories([])
    setSelectedCollection(null)
    setShowOnlyInStock(false)
    setCurrentPage(1)
    setSearchParams({})
  }, [setSearchParams])

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Catálogo <span className="text-gradient">Completo</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} productos
          </p>
        </motion.div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <Filters
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          onClearCategories={handleClearCategories}
          showOnlyInStock={showOnlyInStock}
          onStockFilterChange={(value) => {
            startTransition(() => {
              setShowOnlyInStock(value)
              setCurrentPage(1)
            })
          }}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} onClearFilters={handleClearFilters} />
        )}

        {/* Paginación */}
        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-card rounded disabled:opacity-50"
          >
            ←
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-card rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Catalog
