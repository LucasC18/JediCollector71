import { useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ImageDropzone } from "@/components/ImageDropzone"
import { apiFetch } from "@/config/api"
import { Product } from "@/types/product"

import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  CheckCircle,
  Search,
  Filter,
  X,
  Eye,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  Tag,
  Image as ImageIcon,
  FileText,
  Activity,
  Percent,
  Zap,
  Star,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

/* ======================= TYPES ======================= */

interface Category {
  id: string
  name: string
  slug: string
}

interface Collection {
  id: string
  name: string
  slug: string
}

interface ProductApiDTO {
  id: string
  name: string
  image: string | null
  description: string
  inStock: boolean
  stockQty: number | null
  category: string | null
  categorySlug: string | null
  collection: string | null
  collectionSlug: string | null
}

interface AdminProduct extends Product {
  categorySlug: string | null
  collectionSlug: string | null
}

interface ProductFormState {
  name: string
  categoryId: string
  collectionId: string
  description: string
  imageFile: File | null
  imagePreview: string
  inStock: boolean
  stockQty: number
}

interface StatsData {
  total: number
  inStock: number
  outOfStock: number
  withImages: number
  withDescriptions: number
  categorized: number
}

/* ======================= HELPERS ======================= */

function mapAdminProducts(items: ProductApiDTO[]): AdminProduct[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image ?? "",
    description: p.description,
    inStock: p.inStock,
    stockQty: p.stockQty ?? 0,
    category: p.category,
    categorySlug: p.categorySlug,
    collection: p.collection,
    collectionSlug: p.collectionSlug,
  }))
}

async function fetchAllAdminProducts(): Promise<ProductApiDTO[]> {
  const all: ProductApiDTO[] = []
  let page = 1
  const limit = 50

  while (true) {
    const res = await apiFetch<{ items: ProductApiDTO[] }>(
      `/v1/admin/products?page=${page}&limit=${limit}`,
      { auth: true }
    )
    all.push(...res.items)
    if (res.items.length < limit) break
    page++
  }

  return all
}

function calculateStats(products: AdminProduct[]): StatsData {
  return {
    total: products.length,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    withImages: products.filter((p) => p.image).length,
    withDescriptions: products.filter((p) => p.description?.trim()).length,
    categorized: products.filter((p) => p.category).length,
  }
}

/* ======================= STAT CARD COMPONENT ======================= */

interface StatCardProps {
  title: string
  value: number
  total?: number
  icon: React.ReactNode
  trend?: string
  gradient: string
  delay: number
}

const StatCard = ({ title, value, total, icon, trend, gradient, delay }: StatCardProps) => {
  const percentage = total ? Math.round((value / total) * 100) : 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
    >
      <Card className={`border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${gradient} relative overflow-hidden`}>
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-white">{value}</div>
              {total && (
                <div className="text-lg font-semibold text-white/70">/ {total}</div>
              )}
            </div>
            
            {total && (
              <div className="space-y-2">
                <Progress value={percentage} className="h-2 bg-white/20" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/90 font-semibold">{percentage}% completado</span>
                  {trend && (
                    <span className="flex items-center gap-1 text-white/80">
                      <TrendingUp className="w-3 h-3" />
                      {trend}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {!total && trend && (
              <p className="text-sm text-white/80 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ======================= FILTER BAR COMPONENT ======================= */

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  collectionFilter: string
  onCollectionChange: (value: string) => void
  categories: Category[]
  collections: Collection[]
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const FilterBar = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  collectionFilter,
  onCollectionChange,
  categories,
  collections,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) => {
  return (
    <Card className="p-6 border-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <SelectValue placeholder="Todas las categorías" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Collection Filter */}
        <Select value={collectionFilter} onValueChange={onCollectionChange}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <SelectValue placeholder="Todas las colecciones" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las colecciones</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  )
}

/* ======================= PRODUCT ROW COMPONENT ======================= */

interface ProductRowProps {
  product: AdminProduct
  onEdit: (product: AdminProduct) => void
  onDelete: (product: AdminProduct) => void
  onView: (product: AdminProduct) => void
}

const ProductRow = ({ product, onEdit, onDelete, onView }: ProductRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <TableRow className="group hover:bg-muted/50 transition-colors">
        {/* Image */}
        <TableCell className="w-16">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
            )}
          </div>
        </TableCell>

        {/* Name */}
        <TableCell className="font-semibold">
          <div className="flex items-center gap-2">
            {product.name}
            {product.description && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </TableCell>

        {/* Category */}
        <TableCell>
          {product.category ? (
            <Badge className="gap-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
              <Tag className="w-3 h-3" />
              {product.category}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Sin categoría</span>
          )}
        </TableCell>

        {/* Collection */}
        <TableCell>
          {product.collection ? (
            <Badge className="gap-1.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">
              <Layers className="w-3 h-3" />
              {product.collection}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Sin colección</span>
          )}
        </TableCell>

        {/* Stock */}
        <TableCell>
          {product.inStock ? (
            <Badge className="gap-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En stock
            </Badge>
          ) : (
            <Badge className="gap-1.5 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Sin stock
            </Badge>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(product)}
              className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-600"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Description Row */}
      {isExpanded && product.description && (
        <TableRow className="bg-gradient-to-r from-muted/50 to-muted/20">
          <TableCell colSpan={6} className="py-4">
            <div className="flex gap-3 text-sm pl-14">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

/* ======================= MAIN COMPONENT ======================= */

const Admin = () => {
  const { isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [collectionFilter, setCollectionFilter] = useState<string>("all")

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    categoryId: "",
    collectionId: "",
    description: "",
    imageFile: null,
    imagePreview: "",
    inStock: true,
    stockQty: 0,
  })

  /* ======================= LOAD DATA ======================= */
  
  const loadData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      
      const [cats, cols, items] = await Promise.all([
        apiFetch<Category[]>("/v1/categories"),
        apiFetch<Collection[]>("/v1/collections"),
        fetchAllAdminProducts(),
      ])

      setCategories(cats)
      setCollections(cols)
      setProducts(mapAdminProducts(items))

      if (showToast) {
        toast({
          title: "Actualizado",
          description: "Datos actualizados correctamente",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (showToast) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated])

  /* ======================= STATS ======================= */
  
  const stats = useMemo(() => calculateStats(products), [products])

  /* ======================= FILTER ======================= */
  
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()

    return products.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)

      const matchesCategory =
        categoryFilter === "all" || p.categorySlug === categoryFilter

      const matchesCollection =
        collectionFilter === "all" || p.collectionSlug === collectionFilter

      return matchesSearch && matchesCategory && matchesCollection
    })
  }, [products, search, categoryFilter, collectionFilter])

  const hasActiveFilters = 
    search !== "" || categoryFilter !== "all" || collectionFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setCategoryFilter("all")
    setCollectionFilter("all")
  }

  /* ======================= CRUD OPERATIONS ======================= */

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: "",
      categoryId: "",
      collectionId: "",
      description: "",
      imageFile: null,
      imagePreview: "",
      inStock: true,
      stockQty: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (p: AdminProduct) => {
    const categoryId = categories.find((c) => c.slug === p.categorySlug)?.id ?? ""
    const collectionId =
      collections.find((c) => c.slug === p.collectionSlug)?.id ?? ""

    setEditing(p)
    setForm({
      name: p.name,
      categoryId,
      collectionId,
      description: p.description,
      imageFile: null,
      imagePreview: p.image,
      inStock: p.inStock,
      stockQty: p.stockQty ?? 0,
    })
    setDialogOpen(true)
  }

  const openView = (p: AdminProduct) => {
    setViewingProduct(p)
    setViewDialogOpen(true)
  }

  const openDelete = (p: AdminProduct) => {
    setProductToDelete(p)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        collectionId: form.collectionId,
        inStock: form.inStock,
        stockQty: form.stockQty,
      }

      let id: string

      if (editing) {
        const updated = await apiFetch<ProductApiDTO>(
          `/v1/admin/products/${editing.id}`,
          { method: "PUT", auth: true, body: JSON.stringify(payload) }
        )
        id = updated.id
      } else {
        const created = await apiFetch<ProductApiDTO>(`/v1/admin/products`, {
          method: "POST",
          auth: true,
          body: JSON.stringify(payload),
        })
        id = created.id
      }

      if (form.imageFile) {
        const fd = new FormData()
        fd.append("image", form.imageFile)

        await apiFetch(`/v1/admin/products/${id}/image`, {
          method: "POST",
          auth: true,
          body: fd,
        })
      }

      const items = await fetchAllAdminProducts()
      setProducts(mapAdminProducts(items))

      setDialogOpen(false)
      toast({
        title: editing ? "Actualizado" : "Creado",
        description: `Producto ${editing ? "actualizado" : "creado"} correctamente`,
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await apiFetch(`/v1/admin/products/${productToDelete.id}`, {
        method: "DELETE",
        auth: true,
      })

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setDeleteDialogOpen(false)
      setProductToDelete(null)

      toast({
        title: "Eliminado",
        description: "Producto eliminado correctamente",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
  }

  /* ======================= RENDER ======================= */

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <Package className="w-20 h-20 text-primary animate-bounce" />
            <div className="absolute inset-0 w-20 h-20 animate-ping opacity-20">
              <Package className="w-20 h-20 text-primary" />
            </div>
          </div>
          <p className="text-lg font-semibold text-muted-foreground animate-pulse">
            Cargando panel de administración...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
                <Package className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Gestiona tu catálogo de productos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="gap-2 border-2 hover:border-primary/50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 border-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Productos"
            value={stats.total}
            icon={<Package className="w-6 h-6 text-white" />}
            trend="Inventario completo"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400"
            delay={0}
          />
          <StatCard
            title="En Stock"
            value={stats.inStock}
            total={stats.total}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            trend="Disponibles"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400"
            delay={1}
          />
          <StatCard
            title="Sin Stock"
            value={stats.outOfStock}
            total={stats.total}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            trend="Requieren atención"
            gradient="bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400"
            delay={2}
          />
          <StatCard
            title="Con Imágenes"
            value={stats.withImages}
            total={stats.total}
            icon={<ImageIcon className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400"
            delay={3}
          />
          <StatCard
            title="Con Descripción"
            value={stats.withDescriptions}
            total={stats.total}
            icon={<FileText className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-pink-500 to-pink-600 border-pink-400"
            delay={4}
          />
          <StatCard
            title="Categorizados"
            value={stats.categorized}
            total={stats.total}
            icon={<Tag className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400"
            delay={5}
          />
        </div>

        {/* Actions Bar */}
        <Card className="p-5 border-2 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={openCreate} className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80">
                <Plus className="w-5 h-5" />
                Nuevo Producto
              </Button>
              
              <div className="h-10 w-px bg-border hidden sm:block" />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>
                  Mostrando <span className="font-bold text-foreground text-base">{filteredProducts.length}</span> de{" "}
                  <span className="font-bold text-foreground text-base">{stats.total}</span> productos
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          collectionFilter={collectionFilter}
          onCollectionChange={setCollectionFilter}
          categories={categories}
          collections={collections}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Products Table */}
        <Card className="border-2 shadow-xl">
          <div className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-muted to-muted/50 hover:from-muted hover:to-muted/50">
                  <TableHead className="w-16"></TableHead>
                  <TableHead className="font-bold">Nombre</TableHead>
                  <TableHead className="font-bold">Categoría</TableHead>
                  <TableHead className="font-bold">Colección</TableHead>
                  <TableHead className="font-bold">Stock</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-muted to-muted/50">
                          <Package className="w-16 h-16" />
                        </div>
                        <div>
                          <p className="font-semibold text-xl mb-2">No hay productos</p>
                          <p className="text-sm">
                            {hasActiveFilters
                              ? "No se encontraron productos con los filtros aplicados"
                              : "Comienza creando tu primer producto"}
                          </p>
                        </div>
                        {!hasActiveFilters && (
                          <Button onClick={openCreate} className="gap-2 mt-2">
                            <Plus className="w-4 h-4" />
                            Crear Producto
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      onEdit={openEdit}
                      onDelete={openDelete}
                      onView={openView}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {editing ? (
                <>
                  <Pencil className="w-5 h-5" />
                  Editar Producto
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Nuevo Producto
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información del producto"
                : "Completa los campos para crear un nuevo producto"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nombre del producto *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Laptop HP Pavilion"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe el producto..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="text-base resize-none"
              />
            </div>

            {/* Category & Collection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoría
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Colección
                </Label>
                <Select
                  value={form.collectionId}
                  onValueChange={(v) => setForm({ ...form, collectionId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una colección" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Switch */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/30">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-semibold cursor-pointer">
                      Disponibilidad
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {form.inStock ? "Producto en stock" : "Producto sin stock"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.inStock}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, inStock: checked })
                  }
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagen del producto
              </Label>
              <ImageDropzone
                preview={form.imagePreview}
                onImageSelect={(file) => {
                  setForm({ ...form, imageFile: file })
                }}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {editing ? "Actualizar" : "Crear"} Producto
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl border-2">
          {viewingProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="w-5 h-5" />
                  Vista Previa del Producto
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                {viewingProduct.image && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2">
                    <img
                      src={viewingProduct.image}
                      alt={viewingProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Nombre</Label>
                    <p className="text-xl font-semibold mt-1">{viewingProduct.name}</p>
                  </div>

                  {viewingProduct.description && (
                    <div>
                      <Label className="text-muted-foreground text-sm">Descripción</Label>
                      <p className="mt-1 leading-relaxed">{viewingProduct.description}</p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground text-sm">Categoría</Label>
                      <div className="mt-1">
                        {viewingProduct.category ? (
                          <Badge className="gap-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                            <Tag className="w-3 h-3" />
                            {viewingProduct.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin categoría</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">Colección</Label>
                      <div className="mt-1">
                        {viewingProduct.collection ? (
                          <Badge className="gap-1.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">
                            <Layers className="w-3 h-3" />
                            {viewingProduct.collection}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin colección</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground text-sm">Disponibilidad</Label>
                    <div className="mt-1">
                      {viewingProduct.inStock ? (
                        <Badge className="gap-1.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          En stock
                        </Badge>
                      ) : (
                        <Badge className="gap-1.5 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Sin stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false)
                    openEdit(viewingProduct)
                  }}
                  className="gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ¿Eliminar producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Esta acción eliminará permanentemente el producto{" "}
                <span className="font-semibold text-foreground">
                  "{productToDelete?.name}"
                </span>
                .
              </p>
              <p className="text-destructive font-medium">
                Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Admin