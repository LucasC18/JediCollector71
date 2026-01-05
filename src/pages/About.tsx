import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useProducts } from "@/context/ProductContext";
import {
  ChevronDown,
  Sparkles,
  Package,
  Users,
  Calendar,
  MessageCircle,
} from "lucide-react";

/* =======================
   Hook contador animado
======================= */
const useCounter = (end: number, duration = 2) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start: number | null = null;
    let raf: number;

    const animate = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      const next = Math.floor(progress * end);
      setCount((prev) => (prev === next ? prev : next));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, isInView]);

  return { count, ref };
};

/* =======================
   Stat Card
======================= */
const StatCard = ({
  value,
  label,
  suffix = "",
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const { count, ref } = useCounter(value);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -6, scale: 1.05 }}
      className="glass-card rounded-2xl p-8 text-center space-y-4"
    >
      <div className="flex justify-center">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-5xl font-bold text-gradient font-display">
        {count}
        {suffix}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
};

/* =======================
   Category Card
======================= */
const CategoryCard = ({
  name,
  count,
  onClick,
}: {
  name: string;
  count: number;
  onClick: () => void;
}) => (
  <motion.div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    whileHover={{ y: -8, scale: 1.06 }}
    whileTap={{ scale: 0.95 }}
    className="glass-card rounded-2xl p-8 cursor-pointer text-center space-y-4"
  >
    <div className="text-4xl">📦</div>
    <h3 className="font-display font-bold text-xl">{name}</h3>
    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
      <Package className="w-4 h-4" />
      {count} productos
    </p>
  </motion.div>
);

/* =======================
   FAQ Item
======================= */
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex justify-between items-center text-left"
      >
        <span className="font-semibold">{q}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

/* =======================
   ABOUT PAGE
======================= */
const About = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  /* Categorías dinámicas */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) =>
      map.set(p.category, (map.get(p.category) ?? 0) + 1)
    );
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  /* FAQs */
  const faqs = [
    {
      q: "¿Cómo compro?",
      a: "La web es solo de consulta. Armás tu carrito y nos escribís por WhatsApp.",
    },
    {
      q: "¿Hacen envíos?",
      a: "Sí, enviamos a todo el país. Coordinamos por WhatsApp.",
    },
    {
      q: "¿Son originales?",
      a: "Sí, todas las figuras son verificadas antes de publicarse.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => navigate("/catalogo")} />

      <main className="container mx-auto px-4 pt-28 pb-20 space-y-32">
        {/* HERO */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-primary font-semibold text-sm rounded-full">
            <Sparkles className="w-4 h-4" />
            Colecciones únicas
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold">
            Sobre <span className="text-gradient">JediCollector71</span>
          </h1>

          <p className="text-muted-foreground text-xl">
            Catálogo visual de figuras coleccionables organizado por categorías.
          </p>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <StatCard
            value={products.length}
            label="Productos en catálogo"
            suffix="+"
            icon={Package}
          />
          <StatCard value={500} label="Clientes satisfechos" suffix="+" icon={Users} />
          <StatCard value={5} label="Años de experiencia" icon={Calendar} />
        </section>

        {/* CATEGORIES */}
        <section className="max-w-6xl mx-auto space-y-12">
          <h2 className="text-center font-display text-4xl font-bold">
            Explorá por categoría
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((c) => (
              <CategoryCard
                key={c.name}
                {...c}
                onClick={() =>
                  navigate(`/catalogo?category=${encodeURIComponent(c.name)}`)
                }
              />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-center font-display text-4xl font-bold">
            Preguntas frecuentes
          </h2>
          {faqs.map((f) => (
            <FAQItem key={f.q} {...f} />
          ))}
        </section>

        {/* CTA */}
        <section className="text-center">
          <motion.button
            whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
            whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
            onClick={() => navigate("/catalogo")}
            className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-xl shadow-lg"
          >
            Ver catálogo completo
          </motion.button>
        </section>
      </main>
    </div>
  );
};

export default About;
