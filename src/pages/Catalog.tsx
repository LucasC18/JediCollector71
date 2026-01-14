import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"
import { useProducts } from "@/context/ProductContext"
import { Product } from "@/types/product"
import { useSearchParams } from "react-router-dom"

const PRODUCTS_PER_PAGE = 24

// Hook optimizado para detectar móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    handleChange(mediaQuery)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return isMobile
}

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [showOnlyInStock, setShowOnlyInStock] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryFromUrl = searchParams.get("category")
  const collectionFromUrl = searchParams.get("collection")

  const { products, isLoading } = useProducts()

  /* =======================
     Debounce search
  ======================= */
  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(searchQuery)
      })
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  /* =======================
     Categories dinámicas
  ======================= */
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort()
  }, [products])

  /* =======================
     Sync URL → state
  ======================= */
  useEffect(() => {
    if (collectionFromUrl) {
      setSelectedCollection(collectionFromUrl)
      setCurrentPage(1)
    }
  }, [collectionFromUrl])

  useEffect(() => {
    if (!categoryFromUrl || !categories.length) return
    if (categories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl])
      setCurrentPage(1)
    }
  }, [categoryFromUrl, categories])

  /* =======================
     Category toggle
  ======================= */
  const handleCategoryToggle = useCallback(
    (category: string) => {
      startTransition(() => {
        setSelectedCategories((prev) =>
          prev.includes(category)
            ? prev.filter((c) => c !== category)
            : [...prev, category]
        )
        setCurrentPage(1)
      })
      setSearchParams({})
    },
    [setSearchParams]
  )

  /* =======================
     Clear filters
  ======================= */
  const handleClearFilters = useCallback(() => {
    startTransition(() => {
      setSearchQuery("")
      setDebouncedQuery("")
      setSelectedCategories([])
      setSelectedCollection(null)
      setShowOnlyInStock(false)
      setCurrentPage(1)
    })
    setSearchParams({})
  }, [setSearchParams])

  /* =======================
     Filtrado
  ======================= */
  const filteredProducts = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase()

    return products.filter((product: Product) => {
      if (!product?.name) return false
      if (showOnlyInStock && !product.inStock) return false

      if (selectedCollection && product.collection !== selectedCollection) return false

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category || "")
      )
        return false

      if (query && !product.name.toLowerCase().includes(query)) return false

      return true
    })
  }, [products, debouncedQuery, selectedCategories, selectedCollection, showOnlyInStock])

  /* =======================
     Paginación
  ======================= */
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 pt-28 pb-20 bg-grid min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl font-bold mb-4">
            Catálogo <span className="text-gradient">Completo</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} productos
          </p>
        </motion.div>

        <div className="space-y-6 mb-10">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Filters
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            showOnlyInStock={showOnlyInStock}
            onStockFilterChange={(value) => {
              startTransition(() => {
                setShowOnlyInStock(value)
                setCurrentPage(1)
              })
            }}
            categories={categories}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <ProductGrid products={paginatedProducts} onClearFilters={handleClearFilters} />
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Catalog
