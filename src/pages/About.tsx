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
  Truck,
  Search,
  Shield,
  Heart,
  Zap,
} from "lucide-react";

/* =======================
   Hook contador animado
======================= */
const useCounter = (end: number, duration = 2) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    setHasAnimated(true);
    let start: number | null = null;
    let raf: number;

    const animate = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      const next = Math.floor(progress * end);
      setCount(next);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, isInView, hasAnimated]);

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
  emoji,
}: {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}) => {
  const { count, ref } = useCounter(value);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -8, scale: 1.05 }}
      className="glass-card rounded-2xl p-8 text-center space-y-4 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="text-3xl">{emoji}</span>
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <div className="text-5xl md:text-6xl font-bold text-gradient font-display">
          {count}
          {suffix}
        </div>

        <p className="text-sm text-muted-foreground mt-2">{label}</p>
      </div>
    </motion.div>
  );
};

/* =======================
   Category Card
======================= */
const CategoryCard = ({
  name,
  count,
  emoji,
  onClick,
}: {
  name: string;
  count: number;
  emoji: string;
  onClick: () => void;
}) => (
  <motion.div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    whileHover={{ y: -10, scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    className="glass-card rounded-2xl p-8 cursor-pointer text-center space-y-4 relative overflow-hidden group"
  >
    {/* Efecto de brillo */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Partículas flotantes */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary/40 rounded-full"
        animate={{
          y: [0, -15, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5
        }}
      />
    </div>

    <div className="relative z-10 space-y-4">
      <motion.div 
        className="text-5xl"
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
        transition={{ duration: 0.5 }}
      >
        {emoji}
      </motion.div>
      <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Package className="w-4 h-4" />
        {count} productos
      </p>
      <span className="text-primary font-semibold text-sm">Ver categoría →</span>
    </div>
  </motion.div>
);

/* =======================
   FAQ Item
======================= */
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="glass-card rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-all"
    >
      <button
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-primary/5 transition-colors group"
      >
        <span className="font-semibold group-hover:text-primary transition-colors">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
          {a}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* =======================
   Feature Card
======================= */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="glass-card rounded-2xl p-6 space-y-3 text-center"
  >
    <div className="flex justify-center">
      <div className="p-3 bg-primary/10 rounded-xl w-fit">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
    <h3 className="font-display font-semibold text-lg">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

/* =======================
   Step Card
======================= */
const StepCard = ({
  number,
  icon: Icon,
  text,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: number * 0.1 }}
    whileHover={{ y: -6 }}
    className="glass-card rounded-2xl p-6 space-y-4 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center text-lg font-bold shadow-lg">
        {number}
      </span>
      <Icon className="w-8 h-8 text-primary" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  </motion.div>
);

/* =======================
   ABOUT PAGE
======================= */
const About = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  /* Categorías dinámicas reales */
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) =>
      map.set(p.category, (map.get(p.category) ?? 0) + 1)
    );

    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      emoji:
        name === "Star Wars"
          ? "⚔️"
          : name === "Marvel"
          ? "🦸"
          : name === "Harry Potter"
          ? "🪄"
          : name === "DC Comics"
          ? "🦇"
          : name === "Anime"
          ? "🎌"
          : "🎮",
    }));
  }, [products]);

  /* FAQs */
  const faqs = [
    {
      q: "¿Cómo puedo realizar una compra?",
      a: "No vendemos directamente por la web. Agregá los productos que te interesan al carrito de consulta y envianos el detalle por WhatsApp. Te responderemos con información sobre disponibilidad, precio y formas de pago."
    },
    {
      q: "¿Envían a todo el país?",
      a: "Sí, realizamos envíos a toda Argentina. Coordinamos el método de envío más conveniente según tu ubicación a través de WhatsApp."
    },
    {
      q: "¿Los productos son originales?",
      a: "Todos nuestros productos son figuras coleccionables de marcas reconocidas. Verificamos la autenticidad de cada pieza antes de ofrecerla."
    },
    {
      q: "¿Puedo reservar un producto?",
      a: "Sí, podés consultar por WhatsApp para reservar productos con una seña. Te indicaremos el proceso según disponibilidad."
    },
    {
      q: "¿Hacen descuentos por cantidad?",
      a: "Consultanos por WhatsApp si estás interesado en varios productos. Evaluamos cada caso de forma personalizada."
    },
    {
      q: "¿Cuál es el estado de los productos?",
      a: "Especificamos claramente el estado de cada producto: Nuevo, Usado o Armado. Todos los detalles se proporcionan antes de la compra."
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Productos Auténticos",
      description: "Verificamos la autenticidad de cada figura coleccionable antes de ofrecerla."
    },
    {
      icon: MessageCircle,
      title: "Atención Personalizada",
      description: "Respondemos todas tus consultas por WhatsApp de forma rápida y detallada."
    },
    {
      icon: Truck,
      title: "Envíos Seguros",
      description: "Empaque cuidadoso y seguimiento de cada envío hasta tu puerta."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => navigate("/catalogo")} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        {/* HERO con Parallax */}
        <motion.section
          ref={heroRef}
          style={{ y, opacity }}
          className="text-center space-y-8 max-w-5xl mx-auto mb-24"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-primary font-semibold text-sm rounded-full">
              <Sparkles className="w-4 h-4" />
              Colecciones Épicas
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight"
          >
            <span className="text-foreground">Sobre </span>
            <span className="text-gradient">JediCollector71</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Tu destino definitivo para coleccionar personajes épicos de tus series y películas favoritas. 
            Cada figura cuenta una historia.
          </motion.p>
        </motion.section>

        {/* STATS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24"
        >
          <StatCard
            value={products.length}
            label="Productos en catálogo"
            suffix="+"
            icon={Package}
            emoji="📦"
          />
          <StatCard
            value={500}
            label="Clientes satisfechos"
            suffix="+"
            icon={Users}
            emoji="👥"
          />
          <StatCard
            value={5}
            label="Años de experiencia"
            icon={Calendar}
            emoji="📅"
          />
        </motion.section>

        {/* QUIÉNES SOMOS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-24"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card rounded-3xl p-10 space-y-6 border border-primary/10"
          >
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-primary">
                ¿Quiénes somos?
              </h2>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed text-center">
              En JediCollector71 presentamos un universo de personajes organizados por
              temáticas como Star Wars, Harry Potter, Marvel, DC Comics y más.
              Nuestro objetivo es que puedas explorar, comparar y descubrir
              productos de forma clara y visual.
            </p>

            <p className="text-muted-foreground text-lg leading-relaxed text-center">
              No realizamos ventas directas desde la web. Todas las consultas se
              gestionan de manera personalizada a través de WhatsApp, para
              brindarte información detallada sobre disponibilidad, estado y
              características de cada producto.
            </p>
          </motion.div>
        </motion.section>

        {/* POR QUÉ ELEGIRNOS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto mb-24"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="text-gradient">¿Por qué elegirnos?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CÓMO FUNCIONA */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-24"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card rounded-3xl p-10 space-y-8 border border-primary/10"
          >
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-primary">
                ¿Cómo funciona la consulta?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepCard
                number={1}
                icon={Search}
                text="Explorás el catálogo y filtrás por categoría o disponibilidad"
              />
              <StepCard
                number={2}
                icon={Package}
                text="Agregás los productos que te interesan a la consulta"
              />
              <StepCard
                number={3}
                icon={MessageCircle}
                text="Enviás la consulta por WhatsApp y respondemos de forma personalizada"
              />
            </div>
          </motion.div>
        </motion.section>

        {/* CATEGORÍAS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Explorá por Categoría</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Hacé clic en cualquier categoría para ver el catálogo completo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((c, index) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard
                  name={c.name}
                  count={c.count}
                  emoji={c.emoji}
                  onClick={() =>
                    navigate(`/catalogo?category=${encodeURIComponent(c.name)}`)
                  }
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-24"
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Preguntas Frecuentes</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Todo lo que necesitás saber sobre cómo trabajamos
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, index) => (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <FAQItem q={f.q} a={f.a} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA FINAL */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="glass-card rounded-3xl p-12 space-y-6 border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para comenzar tu colección?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Explorá nuestro catálogo y encontrá tus personajes favoritos
              </p>
              
              <motion.button
                onClick={() => navigate("/catalogo")}
                whileHover={!reduceMotion ? { scale: 1.05 } : undefined}
                whileTap={!reduceMotion ? { scale: 0.95 } : undefined}
                className="px-10 py-5 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/50 transition-shadow cursor-pointer"
              >
                🚀 Ver Catálogo Completo
              </motion.button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;