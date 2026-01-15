import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { apiFetch } from "@/config/api"
import {
  ChevronDown,
  Sparkles,
  Package,
  Users,
  Calendar,
  MessageCircle,
  Truck,
  Search,
  Shield,
  Heart,
  Zap,
  Star,
} from "lucide-react"

/* ===================== TYPES ===================== */

type CategoryRef = {
  id: string
  name: string
  slug: string
}

type ProductLite = {
  id: string
  category?: CategoryRef | null
}

/* ===================== COUNTER ===================== */

const useCounter = (end: number, duration = 2, reduceMotion = false) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { margin: "-60px" })

  useEffect(() => {
    if (!isInView) return
    if (reduceMotion) {
      setCount(end)
      return
    }

    let start: number | null = null
    let raf: number

    const animate = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / (duration * 1000), 1)
      setCount(Math.floor(p * end))
      if (p < 1) raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, isInView, reduceMotion])

  return { count, ref }
}

/* ===================== UI PIECES ===================== */

const StatCard = ({
  value,
  label,
  icon: Icon,
  emoji,
  reduceMotion,
}: {
  value: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  reduceMotion: boolean
}) => {
  const { count, ref } = useCounter(value, 2, reduceMotion)

  return (
    <motion.div ref={ref} className="glass-card rounded-2xl p-8 text-center">
      <div className="flex justify-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-5xl font-bold text-gradient">{count}+</div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </motion.div>
  )
}

/* ===================== ABOUT ===================== */

const About = () => {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const heroRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({ target: heroRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, 220])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  /* REAL DATA FROM BACKEND */
  const [products, setProducts] = useState<ProductLite[]>([])
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    apiFetch<{ items: ProductLite[]; total: number }>(
      "/v1/products?limit=1000"
    ).then((res) => {
      setProducts(res.items)
      setTotalProducts(res.total)
    })
  }, [])

  /* CATEGORIES */
  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>()

    products.forEach((p) => {
      const cat = p.category
      if (!cat) return
      map.set(cat.slug, {
        name: cat.name,
        count: (map.get(cat.slug)?.count || 0) + 1,
      })
    })

    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [products])

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => navigate("/catalogo")} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        {/* HERO */}
        <motion.section
          ref={heroRef}
          style={{ y, opacity }}
          className="text-center mb-32"
        >
          <h1 className="text-5xl font-bold text-gradient">
            JediCollector71
          </h1>
          <p className="text-muted-foreground mt-4">
            Coleccionismo premium, organizado y real.
          </p>
        </motion.section>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          <StatCard
            value={totalProducts}
            label="Productos reales"
            icon={Package}
            emoji="📦"
            reduceMotion={!!reduceMotion}
          />
          <StatCard
            value={categories.length}
            label="Categorías"
            icon={Sparkles}
            emoji="🏷️"
            reduceMotion={!!reduceMotion}
          />
          <StatCard
            value={10}
            label="Años de experiencia"
            icon={Calendar}
            emoji="📅"
            reduceMotion={!!reduceMotion}
          />
        </section>

        {/* CTA */}
        <div className="text-center">
          <motion.button
            onClick={() => navigate("/catalogo")}
            whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
            className="px-10 py-5 bg-primary text-white rounded-xl"
          >
            🚀 Ver catálogo completo
          </motion.button>
        </div>
      </main>
    </div>
  )
}

export default About
