import { useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import ScrollToTop from "@/components/ScrollToTop"
import Footer from "@/components/Footer"

import Home from "./pages/Home"
import Catalog from "./pages/Catalog"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import NotFound from "./pages/NotFound"
import About from "./pages/About"
import ProductDetail from "./pages/ProductDetail"

const queryClient = new QueryClient()

const App = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get("redirect")

    if (redirect) {
      navigate(redirect, { replace: true })
    }
  }, [navigate])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* Reset de scroll en navegación */}
        <ScrollToTop />

        {/* 👇 LAYOUT GLOBAL CORRECTO */}
        <div className="min-h-screen flex flex-col bg-background">
          {/* Contenido principal */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Footer siempre abajo */}
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
