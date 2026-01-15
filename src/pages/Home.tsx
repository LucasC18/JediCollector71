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
     Load featured products - SOLO 4
  ======================= */
  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiFetch<{ items: Product[] }>(
          "/v1/products?featured=true&limit=4"
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar onCartClick={() => setIsCartOpen(true)} />

      {/* ================= HERO ================= */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "calc(100svh - 64px)" }}>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
        </motion.div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full mb-8 shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse-glow" />
              <span className="text-base font-semibold text-amber-300">
                Colecciones Exclusivas
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="text-slate-100">Jedi</span>
              <span className="text-gradient block sm:inline"> Collector71</span>
            </h1>

            <p className="text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed px-4">
              Explorá nuestros personajes organizados por colección. Elegí una y
              encontrá tu próximo favorito.
            </p>

            {!isLoadingCollections && collections.length > 0 && (
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-12 w-full max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {collections.slice(0, 2).map((c) => (
                  <Link
                    key={c.id}
                    to={`/catalogo?collection=${c.slug}`}
                    className="px-12 py-5 min-h-[56px] min-w-[180px] rounded-xl font-display font-bold text-lg glass-card neon-border hover-glow text-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    {c.name}
                  </Link>
                ))}
              </motion.div>
            )}

            <motion.button
              onClick={scrollToFeatured}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 min-h-[56px] min-w-[200px] bg-primary text-primary-foreground font-bold text-lg rounded-xl neon-glow transition-all duration-300 shadow-2xl"
            >
              Ver Destacados
            </motion.button>
          </motion.div>

          <motion.div 
            className="absolute bottom-8"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-primary drop-shadow-lg" />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <main
        id="featured"
        className="w-full px-6 py-24 bg-grid"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-16">
            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 text-center">
              Productos Destacados
            </h2>
            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
          </div>

          {isLoadingFeatured ? (
            <div className="text-center py-32">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-300 text-xl">Cargando productos...</p>
            </div>
          ) : featured.length > 0 ? (
            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
                <ProductGrid products={featured} />
              </div>
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="text-slate-400 text-xl">
                No hay productos destacados todavía
              </p>
            </div>
          )}

          <div className="text-center mt-20">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-3 px-12 py-5 min-h-[56px] glass-card neon-border rounded-xl font-semibold text-lg text-primary hover-glow transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
            >
              Ver Catálogo Completo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default Home