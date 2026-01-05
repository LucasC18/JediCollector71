import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// Hook para animar contadores
const useCounter = (end: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration, hasAnimated]);

  return { count, ref };
};

// Componente de Estadística
const StatCard = ({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) => {
  const { count, ref } = useCounter(value);
  
  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-card rounded-2xl p-8 text-center space-y-2"
    >
      <div className="text-4xl md:text-5xl font-bold text-gradient font-display">
        {count}{suffix}
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </motion.div>
  );
};

// Componente de Acordeón FAQ
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={false}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 text-muted-foreground">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente de Categoría
const CategoryCard = ({ 
  name, 
  icon, 
  count 
}: { 
  name: string; 
  icon: string; 
  count: number;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 space-y-3">
        <div className="text-4xl">{icon}</div>
        <h3 className="font-display font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{count} productos</p>
      </div>
    </motion.div>
  );
};

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Productos destacados para el carrusel
  const featuredProducts = [
    {
      image: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=600&h=400&fit=crop",
      title: "Colección Star Wars",
      description: "Las mejores figuras de la saga"
    },
    {
      image: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=600&h=400&fit=crop",
      title: "Universo Marvel",
      description: "Superhéroes y villanos épicos"
    },
    {
      image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=400&fit=crop",
      title: "Harry Potter Magic",
      description: "El mundo mágico en tus manos"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // FAQs
  const faqs = [
    {
      question: "¿Cómo puedo realizar una compra?",
      answer: "No vendemos directamente por la web. Agregá los productos que te interesan al carrito de consulta y envianos el detalle por WhatsApp. Te responderemos con información sobre disponibilidad, precio y formas de pago."
    },
    {
      question: "¿Envían a todo el país?",
      answer: "Sí, realizamos envíos a toda Argentina. Coordinamos el método de envío más conveniente según tu ubicación a través de WhatsApp."
    },
    {
      question: "¿Los productos son originales?",
      answer: "Todos nuestros productos son figuras coleccionables de marcas reconocidas. Verificamos la autenticidad de cada pieza antes de ofrecerla."
    },
    {
      question: "¿Puedo reservar un producto?",
      answer: "Sí, podés consultar por WhatsApp para reservar productos con una seña. Te indicaremos el proceso según disponibilidad."
    },
    {
      question: "¿Hacen descuentos por cantidad?",
      answer: "Consultanos por WhatsApp si estás interesado en varios productos. Evaluamos cada caso de forma personalizada."
    }
  ];

  // Categorías
  const categories = [
    { name: "Star Wars", icon: "⚔️", count: 45 },
    { name: "Marvel", icon: "🦸", count: 38 },
    { name: "Harry Potter", icon: "🪄", count: 27 },
    { name: "DC Comics", icon: "🦇", count: 31 },
    { name: "Anime", icon: "🎌", count: 22 },
    { name: "Gaming", icon: "🎮", count: 19 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => {}} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        {/* HERO con Parallax */}
        <motion.section
          ref={heroRef}
          style={{ y, opacity }}
          className="max-w-4xl mx-auto text-center space-y-6 mb-20"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-6xl font-bold"
          >
            <span className="text-foreground">Sobre </span>
            <span className="text-gradient">JediCollector71</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Somos una tienda dedicada al universo de personajes de series y películas.
          </motion.p>
        </motion.section>

        {/* GALERÍA CARRUSEL */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="text-gradient">Productos Destacados</span>
          </h2>

          <div className="relative group">
            <div className="overflow-hidden rounded-3xl">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="relative h-[400px] md:h-[500px]"
              >
                <img
                  src={featuredProducts[currentSlide].image}
                  alt={featuredProducts[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                  <h3 className="font-display text-3xl font-bold text-white mb-2">
                    {featuredProducts[currentSlide].title}
                  </h3>
                  <p className="text-white/80">
                    {featuredProducts[currentSlide].description}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Controles del carrusel */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 glass-card p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 glass-card p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-6">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ESTADÍSTICAS ANIMADAS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard value={250} label="Productos en catálogo" suffix="+" />
            <StatCard value={500} label="Clientes satisfechos" suffix="+" />
            <StatCard value={5} label="Años de experiencia" />
          </div>
        </motion.section>

        {/* CONTENIDO ORIGINAL */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-20 space-y-8"
        >
          {/* QUÉ HACEMOS */}
          <div className="glass-card rounded-2xl p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-primary">
              ¿Qué hacemos?
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              En JediCollector71 presentamos un universo personajes organizados por
              temáticas como Star Wars, Harry Potter, Marvel, Technic y más.
              Nuestro objetivo es que puedas explorar, comparar y descubrir
              productos de forma clara y visual.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              No realizamos ventas directas desde la web. Todas las consultas se
              gestionan de manera personalizada a través de WhatsApp, para
              brindarte información detallada sobre disponibilidad, estado y
              características de cada producto.
            </p>
          </div>

          {/* CÓMO FUNCIONA */}
          <div className="glass-card rounded-2xl p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-primary">
              ¿Cómo funciona la consulta?
            </h2>

            <ul className="space-y-3">
              {[
                "Explorás el catálogo y filtrás por categoría o disponibilidad.",
                "Agregás los productos que te interesan a la consulta.",
                "Enviás la consulta directamente por WhatsApp.",
                "Respondemos de forma personalizada."
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* MAPA DE CATEGORÍAS */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="text-gradient">Nuestras Categorías</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard {...category} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ INTERACTIVO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            <span className="text-gradient">Preguntas Frecuentes</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FAQItem {...faq} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;