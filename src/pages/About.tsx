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
  suffix = "+",
}: {
  value: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  reduceMotion: boolean
  suffix?: string
}) => {
  const { count, ref } = useCounter(value, 2, reduceMotion)

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-10 text-center hover:scale-105 transition-transform duration-300 shadow-xl border border-slate-700/50"
    >
      <div className="flex justify-center gap-3 mb-6">
        <span className="text-4xl" role="img" aria-label={label}>{emoji}</span>
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div className="text-6xl font-bold text-gradient mb-3">
        {count}{suffix}
      </div>
      <p className="text-slate-300 text-lg font-medium">{label}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar onCartClick={() => navigate("/catalogo")} />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* HERO */}
        <motion.section
          ref={heroRef}
          style={!reduceMotion ? { y, opacity } : {}}
          className="text-center mb-40"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full mb-8 shadow-lg border border-slate-700/50">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse-glow" />
              <span className="text-base font-semibold text-amber-300">
                Sobre Nosotros
              </span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="text-gradient">JediCollector71</span>
            </h1>
            
            <p className="text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Coleccionismo premium, organizado y real. Tu destino para las mejores figuras y productos exclusivos.
            </p>
          </motion.div>
        </motion.section>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <StatCard
            value={totalProducts}
            label="Productos"
            icon={Package}
            emoji="📦"
            reduceMotion={!!reduceMotion}
            suffix=""
          />
          <StatCard
            value={500}
            label="Clientes"
            icon={Users}
            emoji="👥"
            reduceMotion={!!reduceMotion}
            suffix="+"
          />
          <StatCard
            value={10}
            label="Años de experiencia"
            icon={Calendar}
            emoji="📅"
            reduceMotion={!!reduceMotion}
            suffix="+"
          />
        </section>

        {/* FEATURES GRID */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
        >
          {[
            { icon: Shield, title: "Productos Auténticos", desc: "Garantía de autenticidad en cada producto" },
            { icon: Truck, title: "Envío Seguro", desc: "Empaque premium para máxima protección" },
            { icon: Heart, title: "Pasión por Coleccionar", desc: "Entendemos tu amor por las colecciones" },
            { icon: Star, title: "Calidad Premium", desc: "Solo los mejores productos seleccionados" },
            { icon: Zap, title: "Actualización Constante", desc: "Nuevos productos cada semana" },
            { icon: MessageCircle, title: "Atención Personalizada", desc: "Siempre listos para ayudarte" },
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card rounded-xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-lg border border-slate-700/50"
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* CTA */}
        <div className="text-center">
          <motion.button
            onClick={() => navigate("/catalogo")}
            whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
            whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
            className="px-14 py-6 min-h-[56px] bg-primary text-primary-foreground font-bold text-xl rounded-xl neon-glow transition-all duration-300 shadow-2xl hover:shadow-primary/50"
          >
            🚀 Ver catálogo completo
          </motion.button>
        </div>
      </main>
    </div>
  )
}

export default About