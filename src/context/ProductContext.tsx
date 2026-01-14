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

  // Slugs ya vienen listos desde el backend
  category?: string | null
  collection?: string | null
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

    // Ya vienen como slug, se usan directo
    category: p.category ?? null,
    collection: p.collection ?? "",
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
      // 🔥 Pedimos más de 50 productos
      const res = await apiFetch<ProductApiDTO[]>("/v1/products?limit=1000")

      if (!Array.isArray(res)) {
        throw new Error("Formato inválido del backend")
      }

      const mapped = res.map(mapProductFromApi)
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
