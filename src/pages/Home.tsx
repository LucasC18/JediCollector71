import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import Navbar from "@/components/Navbar"
import CartDrawer from "@/components/CartDrawer"
import { Sparkles, ChevronDown, ArrowRight, Star } from "lucide-react"
import heroImage from "@/assets/hero-starwars.jpg"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"
import ProductGrid from "@/components/ProductGrid"

interface Collection {
  id: string
  name: string
  slug: string
}

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [collections, setCollections] = useState<Collection[]>([])
  const [featured, setFeatured] = useState<Product[]>([])

  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)

  /* =======================
     Load collections
  ======================= */
  useEffect(() => {
    async function loadCollections() {
      try {
        const res = await apiFetch<Collection[]>("/v1/collections")
        setCollections(res || [])
      } catch {
        setCollections([])
      } finally {
        setIsLoadingCollections(false)
      }
    }

    loadCollections()
  }, [])

  /* =======================
     Load featured products
  ======================= */
  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiFetch<{ items: Product[] }>(
          "/v1/products?featured=true&limit=8"
        )
        setFeatured(res.items || [])
      } catch {
        setFeatured([])
      } finally {
        setIsLoadingFeatured(false)
      }
    }

    loadFeatured()
  }, [])

  const scrollToFeatured = () => {
    document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* ================= HERO ================= */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse-glow" />
              <span className="text-sm font-medium text-secondary">
                Colecciones Exclusivas
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="text-foreground">Jedi</span>
              <span className="text-gradient">Collector71</span>
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Explorá nuestros personajes organizados por colección. Elegí una y
              encontrá tu próximo favorito.
            </p>

            {!isLoadingCollections && collections.length > 0 && (
              <motion.div className="flex flex-wrap justify-center gap-4 mb-10">
                {collections.slice(0, 2).map((c) => (
                  <Link
                    key={c.id}
                    to={`/catalogo?collection=${c.slug}`}
                    className="px-10 py-6 min-h-[52px] rounded-xl font-display font-bold text-lg glass-card neon-border hover-glow text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </motion.div>
            )}

            <motion.button
              onClick={scrollToFeatured}
              className="px-8 py-6 min-h-[52px] bg-primary text-primary-foreground font-bold rounded-lg neon-glow"
            >
              Ver Destacados
            </motion.button>
          </motion.div>

          <motion.div className="absolute bottom-8">
            <ChevronDown className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <main
        id="featured"
        className="container mx-auto px-4 py-20 bg-grid"
      >
        <div className="flex items-center gap-3 mb-10">
          <Star className="text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            Productos Destacados
          </h2>
        </div>

        {isLoadingFeatured ? (
          <div className="text-center py-20">Cargando…</div>
        ) : featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <div className="text-center text-muted-foreground">
            No hay productos destacados todavía
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-10 py-5 glass-card neon-border rounded-lg font-semibold text-primary hover-glow"
          >
            Ver Catálogo Completo
            <ArrowRight />
          </Link>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Home
