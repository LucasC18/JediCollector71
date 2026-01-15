import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { apiFetch } from "@/config/api";
import {
  ChevronDown,
  Sparkles,
  Package,
  Users,
  Calendar,
  MessageCircle,
  Truck,
  Shield,
  Heart,
  Zap,
  Star,
  Loader2,
} from "lucide-react";

/* ================================
   TYPES & INTERFACES
================================= */
interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

interface ProductLite {
  id: string;
  category?: CategoryRef | null;
}

interface ProductsApiResponse {
  items: ProductLite[];
  total: number;
  page?: number;
  limit?: number;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  emoji: string;
}

interface StatCardProps {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  reduceMotion: boolean;
  suffix?: string;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/* ================================
   CONSTANTS
================================= */
const PRODUCTS_LIMIT = 1000;
const COUNTER_DURATION = 2;
const NAVBAR_HEIGHT = 64;

const FEATURES: FeatureItem[] = [
  {
    icon: Shield,
    title: "Productos Auténticos",
    desc: "Garantía de autenticidad en cada producto",
    emoji: "🛡️",
  },
  {
    icon: Truck,
    title: "Envío Seguro",
    desc: "Empaque premium para máxima protección",
    emoji: "🚚",
  },
  {
    icon: Heart,
    title: "Pasión por Coleccionar",
    desc: "Entendemos tu amor por las colecciones",
    emoji: "❤️",
  },
  {
    icon: Star,
    title: "Calidad Premium",
    desc: "Solo los mejores productos seleccionados",
    emoji: "⭐",
  },
  {
    icon: Zap,
    title: "Actualización Constante",
    desc: "Nuevos productos cada semana",
    emoji: "⚡",
  },
  {
    icon: MessageCircle,
    title: "Atención Personalizada",
    desc: "Siempre listos para ayudarte",
    emoji: "💬",
  },
];

/* ================================
   DEVICE DETECTION
================================= */
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
   HELPERS & UTILITIES
================================= */
const isApiError = (error: unknown): error is ApiError => {
  return error instanceof Error;
};

const getSafeAreaStyle = (): React.CSSProperties => {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

/* ================================
   CUSTOM HOOKS
================================= */
const useCounter = (end: number, duration = COUNTER_DURATION, reduceMotion = false) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { margin: "-60px", once: true });

  useEffect(() => {
    if (!isInView) return;

    if (reduceMotion) {
      setCount(end);
      return;
    }

    let start: number | null = null;
    let raf: number;

    const animate = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, isInView, reduceMotion]);

  return { count, ref };
};

const useProducts = () => {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<ProductsApiResponse>(
        `/v1/products?limit=${PRODUCTS_LIMIT}`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      setProducts(response.items || []);
      setTotalProducts(response.total || 0);
    } catch (err: unknown) {
      if (isApiError(err) && err.name === "AbortError") {
        return;
      }
      setError("Error al cargar productos");
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  return { products, totalProducts, isLoading, error };
};

const useViewportHeight = () => {
  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    };

    updateVh();
    window.addEventListener("resize", updateVh);
    window.addEventListener("orientationchange", updateVh);

    return () => {
      window.removeEventListener("resize", updateVh);
      window.removeEventListener("orientationchange", updateVh);
    };
  }, []);
};

/* ================================
   OPTIMIZED BACKGROUND
================================= */
const OptimizedBackground = ({ 
  isMobile, 
  isLowEnd, 
  prefersReducedMotion 
}: { 
  isMobile: boolean; 
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
}) => {
  if (prefersReducedMotion || isLowEnd) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-2xl" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
   SUB-COMPONENTS
================================= */
const StatCard = React.memo<StatCardProps>(
  ({ value, label, icon: Icon, emoji, reduceMotion, suffix = "+" }) => {
    const { count, ref } = useCounter(value, COUNTER_DURATION, reduceMotion);

    return (
      <motion.div
        ref={ref}
        initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={reduceMotion ? undefined : { duration: 0.6 }}
        whileHover={reduceMotion ? undefined : { scale: 1.05, y: -5 }}
        className="relative group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-10 text-center transition-all duration-300 shadow-2xl">
          <div className="flex justify-center gap-3 mb-6">
            <span className="text-4xl" role="img" aria-label={label}>
              {emoji}
            </span>
            <Icon className="w-8 h-8 text-purple-400" />
          </div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3">
            {count}
            {suffix}
          </div>
          <p className="text-slate-300 text-lg font-semibold">{label}</p>
        </div>
      </motion.div>
    );
  }
);

StatCard.displayName = "StatCard";

const HeroSection = ({ reduceMotion }: { reduceMotion: boolean }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section
      ref={heroRef}
      style={!reduceMotion ? { y, opacity } : undefined}
      className="text-center mb-40"
    >
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.8 }}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/40 rounded-full mb-8 shadow-2xl shadow-amber-500/20"
          animate={reduceMotion ? undefined : {
            boxShadow: [
              "0 0 20px rgba(251, 191, 36, 0.2)",
              "0 0 30px rgba(251, 191, 36, 0.4)",
              "0 0 20px rgba(251, 191, 36, 0.2)",
            ],
          }}
          transition={reduceMotion ? undefined : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-base font-bold text-amber-200">
            ℹ️ Sobre Nosotros
          </span>
        </motion.div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black mb-8 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-2xl">
            JediCollector71
          </span>
        </h1>

        <p className="text-slate-200 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          Coleccionismo premium, organizado y real. Tu destino para las mejores
          figuras y productos exclusivos. 🧱✨
        </p>
      </motion.div>
    </motion.section>
  );
};

const StatsSection = ({
  totalProducts,
  isLoading,
  reduceMotion,
}: {
  totalProducts: number;
  isLoading: boolean;
  reduceMotion: boolean;
}) => {
  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center mb-32 py-20">
        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-16 h-16 text-purple-400" />
        </motion.div>
        <p className="text-slate-300 text-xl font-medium">Cargando estadísticas...</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
      <StatCard
        value={totalProducts}
        label="Productos"
        icon={Package}
        emoji="📦"
        reduceMotion={reduceMotion}
        suffix=""
      />
      <StatCard
        value={500}
        label="Clientes"
        icon={Users}
        emoji="👥"
        reduceMotion={reduceMotion}
        suffix="+"
      />
      <StatCard
        value={10}
        label="Años de experiencia"
        icon={Calendar}
        emoji="📅"
        reduceMotion={reduceMotion}
        suffix="+"
      />
    </section>
  );
};

const FeatureCard = ({
  feature,
  index,
  reduceMotion,
}: {
  feature: FeatureItem;
  index: number;
  reduceMotion: boolean;
}) => (
  <motion.div
    initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={
      reduceMotion
        ? undefined
        : { duration: 0.6, delay: index * 0.1 }
    }
    whileHover={reduceMotion ? undefined : { scale: 1.05, y: -5 }}
    className="relative group"
  >
    {/* Glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center transition-all duration-300 shadow-xl">
      <div className="flex justify-center mb-5">
        <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg">
          <feature.icon className="w-8 h-8 text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
      <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
    </div>
  </motion.div>
);

const FeaturesSection = ({ reduceMotion }: { reduceMotion: boolean }) => (
  <motion.section
    initial={reduceMotion ? undefined : { opacity: 0, y: 40 }}
    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={reduceMotion ? undefined : { duration: 0.8 }}
    className="mb-32"
  >
    <motion.div 
      className="text-center mb-16"
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
        ¿Por qué elegirnos?
      </h2>
      <p className="text-slate-300 text-lg max-w-2xl mx-auto">
        Nos comprometemos a brindarte la mejor experiencia en coleccionismo
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {FEATURES.map((feature, idx) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={idx}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  </motion.section>
);

const CTASection = ({
  onNavigate,
  reduceMotion,
}: {
  onNavigate: () => void;
  reduceMotion: boolean;
}) => (
  <motion.div 
    className="text-center"
    initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={reduceMotion ? undefined : { duration: 0.6 }}
  >
    <motion.button
      onClick={onNavigate}
      whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      className="group relative px-14 py-6 min-h-[64px] font-bold text-xl rounded-2xl overflow-hidden shadow-2xl"
      aria-label="Ver catálogo completo"
    >
      {/* Animated gradient */}
      {!reduceMotion ? (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      )}
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
      
      <span className="relative z-10 flex items-center justify-center gap-2 text-white">
        🚀 Ver catálogo completo
      </span>
    </motion.button>
  </motion.div>
);

/* ================================
   MAIN COMPONENT
================================= */
const About = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { isMobile, isLowEnd } = useDeviceDetection();

  const { totalProducts, isLoading } = useProducts();

  useViewportHeight();

  const handleNavigateToCatalog = useCallback(() => {
    navigate("/catalogo");
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate("/catalogo");
  }, [navigate]);

  return (
    <div
      className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden"
      style={getSafeAreaStyle()}
    >
      {/* Optimized Background */}
      <OptimizedBackground 
        isMobile={isMobile} 
        isLowEnd={isLowEnd}
        prefersReducedMotion={!!reduceMotion}
      />

      <Navbar onCartClick={handleCartClick} />

      <main className="relative max-w-7xl mx-auto px-6 pt-32 pb-24">
        <HeroSection reduceMotion={!!reduceMotion} />

        <StatsSection
          totalProducts={totalProducts}
          isLoading={isLoading}
          reduceMotion={!!reduceMotion}
        />

        <FeaturesSection reduceMotion={!!reduceMotion} />

        <CTASection
          onNavigate={handleNavigateToCatalog}
          reduceMotion={!!reduceMotion}
        />
      </main>
    </div>
  );
};

export default About;