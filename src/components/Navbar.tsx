import { motion } from "framer-motion"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NavbarProps {
  onCartClick: () => void
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const { itemCount } = useCart()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const category = searchParams.get("category")
  const collection = searchParams.get("collection")

  const catalogUrl = (() => {
    const p = new URLSearchParams()
    if (category) p.set("category", category)
    if (collection) p.set("collection", collection)
    const q = p.toString()
    return q ? `/catalogo?${q}` : "/catalogo"
  })()

  const links = [
    { href: "/", label: "Inicio" },
    { href: catalogUrl, label: "Catálogo" }, // 🔥 AHORA RESPETA LOS FILTROS
    { href: "/nosotros", label: "Nosotros" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/">
              <motion.div
                className="flex items-center gap-2 w-fit"
                whileHover={{ scale: 1.02 }}
              >
                <h1 className="font-display text-xl md:text-2xl font-bold neon-text whitespace-nowrap">
                  Jedi
                  <span className="text-secondary neon-text-magenta">
                    Collector71
                  </span>
                </h1>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === link.href.split("?")[0]
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onCartClick}
              className="relative neon-border hover-glow bg-transparent"
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden pt-4 pb-2 border-t border-border mt-4"
          >
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
