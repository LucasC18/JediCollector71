import { useCallback, useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"
import { useProducts } from "@/context/ProductContext"
import { Product } from "@/types/product"
import { useSearchParams } from "react-router-dom"

const PRODUCTS_PER_PAGE = 24
const DEFAULT_COLLECTION = "Personajes"

/* =======================
   Hook: detect mobile
   ======================= */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showOnlyInStock, setShowOnlyInStock] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCollection, setActiveCollection] = useState<string>(DEFAULT_COLLECTION)

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
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  /* =======================
     Collection from URL
     ======================= */
  useEffect(() => {
    if (!collectionFromUrl) return
    setActiveCollection(collectionFromUrl)
    setSelectedCategories([])
    setCurrentPage(1)
  }, [collectionFromUrl])

  /* =======================
     Detect existing collections
     ======================= */
  const existingCollections = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.collection) set.add(p.collection)
    })
    return Array.from(set)
  }, [products])

  const safeActiveCollection = useMemo(() => {
    return existingCollections.includes(activeCollection)
      ? activeCollection
      : DEFAULT_COLLECTION
  }, [existingCollections, activeCollection])

  /* =======================
     Categories
     ======================= */
  const categories = useMemo(() => {
    const set = new Set<string>()
    products
      .filter((p) => (p.collection ?? DEFAULT_COLLECTION) === safeActiveCollection)
      .forEach((p) => {
        if (p.category) set.add(p.category)
      })
    return Array.from(set)
  }, [products, safeActiveCollection])

  /* =======================
     Category toggle
     ======================= */
  const handleCategoryToggle = useCallback(
    (category: string) => {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      )
      setSearchParams({})
    },
    [setSearchParams]
  )

  useEffect(() => {
    if (!categoryFromUrl) return
    setSelectedCategories([categoryFromUrl])
    setCurrentPage(1)
  }, [categoryFromUrl])

  /* =======================
     Filter products
     ======================= */
  const filteredProducts = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase()

    return products.filter((product: Product) => {
      if (!product || typeof product.name !== "string") return false

      const productCollection = product.collection ?? DEFAULT_COLLECTION

      const matchesCollection = productCollection === safeActiveCollection
      const matchesSearch =
        query === "" || product.name.toLowerCase().includes(query)
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category || "")
      const matchesStock = !showOnlyInStock || product.inStock

      return (
        matchesCollection &&
        matchesSearch &&
        matchesCategory &&
        matchesStock
      )
    })
  }, [
    products,
    debouncedQuery,
    selectedCategories,
    showOnlyInStock,
    safeActiveCollection,
  ])

  /* =======================
     Reset page if invalid
     ======================= */
  useEffect(() => {
    if (currentPage > Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)) {
      setCurrentPage(1)
    }
  }, [filteredProducts, currentPage])

  /* =======================
     Pagination
     ======================= */
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const generatePageNumbers = useCallback(() => {
    const pages: (number | string)[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }, [totalPages, currentPage])

  /* =======================
     Handlers
     ======================= */
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleStockFilterChange = useCallback((value: boolean) => {
    setShowOnlyInStock(value)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      <main className="container mx-auto px-4 pt-28 pb-20 bg-grid min-h-screen">
        {/* Collection selector */}
        <div className="flex justify-center gap-3 mb-8">
          {existingCollections.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveCollection(c)
                setSelectedCategories([])
                setSearchParams({ collection: c })
              }}
              className={`px-6 py-3 rounded-xl border ${
                safeActiveCollection === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <ProductGrid
            products={paginatedProducts}
            onClearFilters={() => {
              setSearchQuery("")
              setSelectedCategories([])
              setShowOnlyInStock(false)
              setCurrentPage(1)
            }}
          />
        )}
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Catalog
