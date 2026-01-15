import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Product } from "@/types/product"
import { apiFetch } from "@/config/api"

/* =======================
   Backend DTO
======================= */
interface ProductApiDTO {
  id: string
  name: string
  image?: string | null
  description?: string | null
  inStock: boolean

  category?: string | null
  categorySlug?: string | null

  collection?: string | null
  collectionSlug?: string | null
}

/* =======================
   API Response
======================= */
interface ProductListResponse {
  items: ProductApiDTO[]
  total: number
  page: number
  limit: number
}

/* =======================
   Mapper backend → frontend
======================= */
function mapProductFromApi(p: ProductApiDTO): Product {
  return {
    id: p.id,
    name: p.name,
    image: p.image ?? "",
    description: p.description ?? "",
    inStock: p.inStock,

    // 🔥 Slugs reales para filtros
    category: p.categorySlug ?? null,
    categorySlug: p.categorySlug ?? null,

    collection: p.collectionSlug ?? "",
    collectionSlug: p.collectionSlug ?? "",
  }
}



/* =======================
   Context types
======================= */
interface ProductContextType {
  products: Product[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

/* =======================
   Provider
======================= */
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await apiFetch<ProductListResponse>("/v1/products?limit=1000")

      if (!res || !Array.isArray(res.items)) {
        throw new Error("Respuesta inválida del backend")
      }

      const mapped = res.items.map(mapProductFromApi)
      setProducts(mapped)
    } catch (e) {
      setProducts([])
      setError(e instanceof Error ? e.message : "Error cargando productos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        reload,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

/* =======================
   Hook
======================= */
export const useProducts = () => {
  const ctx = useContext(ProductContext)
  if (!ctx) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return ctx
}
