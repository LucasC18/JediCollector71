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
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

/* ======================= COMPONENT ======================= */

const Admin = () => {
  const { isAuthenticated, logout } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)

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

  /* ======================= LOAD ======================= */
  useEffect(() => {
    if (!isAuthenticated) return

    async function load() {
      try {
        const [cats, cols, items] = await Promise.all([
          apiFetch<Category[]>("/v1/categories"),
          apiFetch<Collection[]>("/v1/collections"),
          fetchAllAdminProducts(),
        ])

        setCategories(cats)
        setCollections(cols)
        setProducts(mapAdminProducts(items))
      } catch {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      }
    }

    load()
  }, [isAuthenticated])

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

  /* ======================= CRUD ======================= */

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      toast({ title: "Guardado", description: "Producto guardado correctamente" })
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel Admin</h1>

      <Button onClick={openCreate} className="mb-6">
        <Plus className="mr-2" /> Nuevo producto
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Colección</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>{p.collection}</TableCell>
              <TableCell>{p.inStock ? "Sí" : "No"}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => openEdit(p)}>
                  <Pencil />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nuevo"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Textarea
              placeholder="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={form.collectionId}
              onValueChange={(v) => setForm({ ...form, collectionId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Colección" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ImageDropzone
              preview={form.imagePreview}
              onImageSelect={(file) => setForm({ ...form, imageFile: file })}
            />

            <Button type="submit">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Admin
