import { useEffect, useMemo, useState, useTransition } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"

import Navbar from "@/components/Navbar"
import SearchBar from "@/components/SearchBar"
import Filters from "@/components/Filters"
import ProductGrid from "@/components/ProductGrid"
import CartDrawer from "@/components/CartDrawer"

import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"

import { ChevronLeft, ChevronRight, Loader2, Package, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/* ================================
   TYPES
================================ */
interface Category { id: string; name: string; slug: string }
interface Collection { id: string; name: string; slug: string }

interface ProductsApiResponse {
  items: Product[]
  total: number
}

interface FilterState {
  category: string | null
  collection: string | null
  search: string
  inStock: boolean
  page: number
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

const PRODUCTS_PER_PAGE = 24

/* ================================
   DEVICE DETECTION
================================ */
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      const nav = navigator as NavigatorWithMemory;
      const cores = navigator.hardwareConcurrency || 4;
      const memory = nav.deviceMemory || 4;
      setIsLowEnd(cores <= 2 || memory <= 2);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isLowEnd };
};

/* ================================
   HELPERS
================================ */
const buildQueryParams = (filters: Partial<FilterState>) => {
  const p = new URLSearchParams()
  if (filters.category) p.set("category", filters.category)
  if (filters.collection) p.set("collection", filters.collection)
  if (filters.search) p.set("search", filters.search)
  if (filters.inStock) p.set("inStock", "true")
  p.set("page", String(filters.page ?? 1))
  p.set("limit", String(PRODUCTS_PER_PAGE))
  return p.toString()
}

const useDebounce = <T,>(v: T, delay: number): T => {
  const [d, setD] = useState(v)
  useEffect(() => {
    const t = setTimeout(() => setD(v), delay)
    return () => clearTimeout(t)
  }, [v, delay])
  return d
}

/* ================================
   OPTIMIZED BACKGROUND
================================ */
const OptimizedBackground = ({ 
  isMobile, 
  isLowEnd, 
  prefersReducedMotion 
}: { 
  isMobile: boolean; 
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
}) => {
  // Sin animaciones para low-end o reduced motion
  if (prefersReducedMotion || isLowEnd) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-2xl" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Burbuja principal */}
      <motion.div
        className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full ${isMobile ? 'blur-xl' : 'blur-3xl'}`}
        style={{ willChange: "transform" }}
        animate={{ 
          scale: [1, 1.15, 1],
          x: [0, isMobile ? 20 : 50, 0],
          y: [0, isMobile ? 15 : 30, 0]
        }}
        transition={{ 
          duration: isMobile ? 10 : 8,
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Burbujas adicionales - solo desktop */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform" }}
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
              y: [0, -25, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            style={{ willChange: "transform" }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
};

/* ================================
   COMPONENT
================================ */
const Catalog = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [, startTransition] = useTransition()
  const prefersReducedMotion = useReducedMotion() || false;
  const { isMobile, isLowEnd } = useDeviceDetection();

  // Filters
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [collection, setCollection] = useState<string | null>(null)
  const [inStock, setInStock] = useState(false)
  const [page, setPage] = useState(1)
  const [cartOpen, setCartOpen] = useState(false)

  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<{cats: Category[], cols: Collection[]}>({ cats: [], cols: [] })

  const debouncedSearch = useDebounce(search, 300)

  /* ======================
     Load metadata
  ====================== */
  useEffect(() => {
    Promise.all([
      apiFetch<Category[]>("/v1/categories"),
      apiFetch<Collection[]>("/v1/collections"),
    ]).then(([cats, cols]) => {
      setMetadata({ cats: cats || [], cols: cols || [] })
    })
  }, [])

  /* ======================
     Sync URL → State
  ====================== */
  useEffect(() => {
    const p = new URLSearchParams(location.search)
    startTransition(() => {
      setCategory(p.get("category"))
      setCollection(p.get("collection"))
      setSearch(p.get("search") || "")
    })
  }, [location.search])

  /* ======================
     Load products
  ====================== */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const query = buildQueryParams({ category, collection, search: debouncedSearch, inStock, page })
        const r = await apiFetch<ProductsApiResponse>(`/v1/products?${query}`)
        setProducts(r.items || [])
        setTotal(r.total || 0)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, collection, debouncedSearch, inStock, page])

  /* ======================
     Reset page on filter change
  ====================== */
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, collection, inStock])

  /* ======================
     Category filtering by collection
  ====================== */
  const filteredCategories = useMemo(() => {
    if (!collection) return metadata.cats

    const slugs = new Set<string>()

    for (const p of products as unknown[]) {
      if (!p || typeof p !== "object") continue

      const anyP = p as Record<string, unknown>

      const catSlug =
        (typeof anyP.categorySlug === "string" && anyP.categorySlug) ||
        (typeof anyP.category_slug === "string" && anyP.category_slug) ||
        (typeof anyP.category === "string" && anyP.category) ||
        null

      if (catSlug) slugs.add(catSlug)
    }

    if (slugs.size === 0) return metadata.cats

    return metadata.cats.filter(c => slugs.has(c.slug))
  }, [metadata.cats, products, collection])

  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE))

  const clearFilters = () => {
    setSearch("")
    setCategory(null)
    setCollection(null)
    setInStock(false)
    setPage(1)
    navigate(location.pathname, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* Optimized Background */}
      <OptimizedBackground 
        isMobile={isMobile} 
        isLowEnd={isLowEnd}
        prefersReducedMotion={prefersReducedMotion}
      />

      <Navbar onCartClick={() => setCartOpen(true)} />

      <main className="relative max-w-7xl mx-auto px-6 pt-24 pb-24">
        {/* Header with title */}
        <motion.div 
          className="text-center mb-12"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/40 rounded-full mb-6 shadow-2xl shadow-blue-500/20"
            animate={prefersReducedMotion ? undefined : {
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.2)",
                "0 0 30px rgba(59, 130, 246, 0.3)",
                "0 0 20px rgba(59, 130, 246, 0.2)",
              ],
            }}
            transition={prefersReducedMotion ? undefined : {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-base font-bold text-blue-200">
              🧱 Catálogo Completo
            </span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            Explorá Nuestros Productos
          </h1>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.2 }}
        >
          <SearchBar value={search} onChange={setSearch} />
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.6, delay: 0.3 }}
        >
          <Filters
            categories={filteredCategories}
            collections={metadata.cols}
            selectedCategory={category}
            selectedCollection={collection}
            showOnlyInStock={inStock}
            onCategoryChange={setCategory}
            onCollectionChange={(v) => {
              setCollection(v)
              setCategory(null)
            }}
            onStockFilterChange={setInStock}
            onClearFilters={clearFilters}
          />
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 mb-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={prefersReducedMotion ? undefined : { delay: 0.4 }}
        >
          <Badge 
            variant="outline" 
            className="bg-white/5 backdrop-blur-sm border-white/20 text-slate-300 text-base px-4 py-2 font-semibold shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {total} productos encontrados
              </span>
            )}
          </Badge>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <motion.div
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Loader2 className="w-16 h-16 text-purple-400" />
              </motion.div>
              <p className="text-slate-300 text-xl font-medium">Cargando productos...</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? undefined : { duration: 0.4 }}
            >
              <ProductGrid
                products={products}
                onNavigate={(id) => navigate(`/producto/${id}`)}
                onClearFilters={clearFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center items-center gap-6 mt-16"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { delay: 0.5 }}
          >
            <motion.div 
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }} 
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => {
                  setPage(p => p - 1)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="min-h-[48px] px-6 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> Anterior
              </Button>
            </motion.div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 shadow-lg">
              <span className="font-mono text-lg font-bold text-white">
                {page} / {totalPages}
              </span>
            </div>

            <motion.div 
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }} 
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
            >
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => {
                  setPage(p => p + 1)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="min-h-[48px] px-6 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Siguiente <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </main>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default Catalog