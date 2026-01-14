import { useEffect, useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
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
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  X,
  Eye,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Layers,
  Tag,
  Image as ImageIcon,
  FileText,
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
  }
}

/* ======================= STAT CARD COMPONENT ======================= */

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
  color: string
  delay: number
}

const StatCard = ({ title, value, icon, trend, color, delay }: StatCardProps) => {
  return (
    <Card
      className={`border-l-4 hover:shadow-lg transition-all duration-300 opacity-0 animate-[slideInUp_0.6s_ease-out_${delay}ms_forwards] hover:scale-[1.02]`}
      style={{ borderLeftColor: color }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${color}/10`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
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
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-xs"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
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
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </TableCell>

        {/* Name */}
        <TableCell className="font-medium">
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
            <Badge variant="secondary" className="gap-1">
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
            <Badge variant="outline" className="gap-1">
              <Layers className="w-3 h-3" />
              {product.collection}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">Sin colección</span>
          )}
        </TableCell>

        {/* Stock */}
        <TableCell>
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  En stock
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Sin stock
                </span>
              </>
            )}
          </div>
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(product)}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
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
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="py-3">
            <div className="flex gap-2 text-sm text-muted-foreground pl-14">
              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Package className="w-16 h-16 animate-bounce text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Cargando panel de administración...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">
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
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Productos"
            value={stats.total}
            icon={<Package className="w-5 h-5 text-blue-600" />}
            color="#3b82f6"
            delay={0}
          />
          <StatCard
            title="En Stock"
            value={stats.inStock}
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            trend={`${Math.round((stats.inStock / stats.total) * 100)}% del total`}
            color="#10b981"
            delay={100}
          />
          <StatCard
            title="Sin Stock"
            value={stats.outOfStock}
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            color="#f59e0b"
            delay={200}
          />
          <StatCard
            title="Con Imágenes"
            value={stats.withImages}
            icon={<ImageIcon className="w-5 h-5 text-purple-600" />}
            trend={`${Math.round((stats.withImages / stats.total) * 100)}% del total`}
            color="#a855f7"
            delay={300}
          />
        </div>

        {/* Actions Bar */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={openCreate} className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </Button>
              
              <div className="h-8 w-px bg-border" />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span>
                  Mostrando <span className="font-semibold text-foreground">{filteredProducts.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{stats.total}</span> productos
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
        <Card>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16"></TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold">Colección</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="text-right font-semibold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Package className="w-12 h-12" />
                        <div>
                          <p className="font-medium text-lg">No hay productos</p>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
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
        <DialogContent className="max-w-3xl">
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
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
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
                          <Badge variant="secondary" className="gap-1">
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
                          <Badge variant="outline" className="gap-1">
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
                    <div className="mt-1 flex items-center gap-2">
                      {viewingProduct.inStock ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            En stock
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Sin stock
                          </span>
                        </>
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
        <AlertDialogContent>
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

      {/* Custom Animations */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Admin