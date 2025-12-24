import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

/* ================================
   📞 WhatsApp desde .env
   ================================ */
const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE as string | undefined;

const Footer = () => {
  return (
    <footer className="relative mt-20">
      {/* Neon divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card border-t border-primary/20"
      >
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold">
              Mike<span className="text-gradient">Co</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tienda de exhibición LEGO. Explorá sets únicos y consultá
              disponibilidad directamente por WhatsApp.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Contacto
            </h4>

            <div className="flex items-center gap-4 pt-2">
              {WHATSAPP_PHONE && (
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}

              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary/10">
          <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} MikeCo — Exhibición LEGO
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
