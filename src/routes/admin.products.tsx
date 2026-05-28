import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { normalizeProductImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fcfa } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("*,product_images(id,url,position)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function del(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-primary">Produits</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <Button type="button" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Nouveau produit</Button>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier" : "Nouveau"} produit</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Modifiez les informations du produit existant et enregistrez."
                  : "Ajoutez un nouveau produit avec au moins 3 images."}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              initial={editing}
              onDone={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["featured-products"] }); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p: any) => {
          const img = normalizeProductImageUrl([...(p.product_images ?? [])].sort((a: any, b: any) => a.position - b.position)[0]?.url);
          return (
            <div key={p.id} className="overflow-hidden rounded-xl bg-card shadow-sm">
              {img ? <img src={img} alt={p.name} className="aspect-video w-full object-cover" /> : <div className="aspect-video bg-muted" />}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <span className="text-xs uppercase text-muted-foreground">{p.category}</span>
                </div>
                <div className="mt-1 text-sm">{fcfa(Number(p.price_per_kg))}/kg · {p.stock_kg} kg</div>
                <div className="mt-1 flex gap-2 text-xs">
                  {p.featured && <span className="rounded bg-gold/20 px-2 py-0.5">Vedette</span>}
                  {!p.available && <span className="rounded bg-destructive/20 px-2 py-0.5 text-destructive">Indispo</span>}
                  <span className="text-muted-foreground">{p.product_images?.length ?? 0} image(s)</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => del(p.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductForm({ initial, onDone }: { initial: any; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<"fruit" | "legume">(initial?.category ?? "fruit");
  const [price, setPrice] = useState<number>(Number(initial?.price_per_kg ?? 0));
  const [stock, setStock] = useState<number>(Number(initial?.stock_kg ?? 0));
  const [featured, setFeatured] = useState<boolean>(initial?.featured ?? false);
  const [available, setAvailable] = useState<boolean>(initial?.available ?? true);
  const [files, setFiles] = useState<File[]>([]);
  const [existing, setExisting] = useState<any[]>(initial?.product_images ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setCategory(initial?.category ?? "fruit");
    setPrice(Number(initial?.price_per_kg ?? 0));
    setStock(Number(initial?.stock_kg ?? 0));
    setFeatured(initial?.featured ?? false);
    setAvailable(initial?.available ?? true);
    setExisting(initial?.product_images ?? []);
    setFiles([]);
  }, [initial]);

  async function uploadFiles(productId: string) {
    const uploads: { url: string; position: number }[] = [];
    let pos = existing.length;
    for (const f of files) {
      const ext = f.name.split(".").pop();
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, f);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploads.push({ url: data.publicUrl, position: pos++ });
    }
    if (uploads.length) {
      const { error } = await supabase.from("product_images").insert(uploads.map((u) => ({ ...u, product_id: productId })));
      if (error) throw error;
    }
  }

  async function removeExisting(imgId: string) {
    if (!confirm("Supprimer cette image ?")) return;
    const { error } = await supabase.from("product_images").delete().eq("id", imgId);
    if (error) return toast.error(error.message);
    setExisting((cur) => cur.filter((i) => i.id !== imgId));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalImages = existing.length + files.length;
    if (totalImages < 1) return toast.error("Au moins 1 image est requise.");
    if (totalImages > 3) return toast.error("Au maximum 3 images sont autorisées.");
    setSaving(true);
    try {
      let id = initial?.id;
      if (id) {
        const { error } = await supabase.from("products").update({
          name, description, category, price_per_kg: price, stock_kg: stock, featured, available,
        }).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert({
          name, description, category, price_per_kg: price, stock_kg: stock, featured, available,
        }).select().single();
        if (error) throw error;
        id = data.id;
      }
      await uploadFiles(id);
      toast.success("Enregistré");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Nom</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fruit">Fruit</SelectItem>
              <SelectItem value="legume">Légume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Prix (FC / kg)</Label><Input type="number" min={0} required value={price} onChange={(e) => setPrice(+e.target.value)} /></div>
        <div><Label>Stock (kg)</Label><Input type="number" min={0} step={0.1} required value={stock} onChange={(e) => setStock(+e.target.value)} /></div>
        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2"><Switch checked={featured} onCheckedChange={setFeatured} /> En vedette</label>
          <label className="flex items-center gap-2"><Switch checked={available} onCheckedChange={setAvailable} /> Disponible</label>
        </div>
      </div>

      <div>
        <Label>Images (1 à 3)</Label>
        {existing.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {existing.map((im) => (
              <div key={im.id} className="relative">
                <img src={normalizeProductImageUrl(im.url)} alt="" className="aspect-square w-full rounded object-cover" />
                <button type="button" aria-label="Supprimer l'image" onClick={() => removeExisting(im.id)} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        )}
        <Input type="file" accept="image/*" multiple className="mt-2" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        <p className="mt-1 text-xs text-muted-foreground">{existing.length} existante(s) + {files.length} nouvelle(s) = {existing.length + files.length} (entre 1 et 3)</p>
      </div>

      <Button type="submit" disabled={saving} className="w-full">{saving ? "…" : "Enregistrer"}</Button>
    </form>
  );
}
