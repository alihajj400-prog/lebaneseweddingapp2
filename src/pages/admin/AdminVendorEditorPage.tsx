import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Star, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';

const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';
const MAX_IMAGES = 15;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_MB = 5;

interface FormState {
  business_name: string;
  category: string;
  region: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  whatsapp: string;
  starting_price_usd: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  portfolio_images: string[];
  cover_image_url: string | null;
}

const defaultForm: FormState = {
  business_name: '',
  category: 'venue',
  region: 'beirut',
  description: '',
  phone: '',
  email: '',
  website: '',
  instagram: '',
  whatsapp: '',
  starting_price_usd: '',
  status: 'approved',
  is_featured: false,
  portfolio_images: [],
  cover_image_url: null,
};

export default function AdminVendorEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isNew = id === 'new';
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
          navigate('/admin/vendors');
          return;
        }
        if (data) {
          setForm({
            business_name: data.business_name ?? '',
            category: data.category ?? 'venue',
            region: data.region ?? 'beirut',
            description: data.description ?? '',
            phone: data.phone ?? '',
            email: data.email ?? '',
            website: data.website ?? '',
            instagram: data.instagram ?? '',
            whatsapp: data.whatsapp ?? '',
            starting_price_usd: data.starting_price_usd != null ? String(data.starting_price_usd) : '',
            status: data.status ?? 'approved',
            is_featured: data.is_featured ?? false,
            portfolio_images: data.portfolio_images ?? [],
            cover_image_url: data.cover_image_url ?? null,
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew, navigate, toast]);

  const update = (updates: Partial<FormState>) => setForm((prev) => ({ ...prev, ...updates }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !user) return;

    const remaining = MAX_IMAGES - form.portfolio_images.length;
    const toUpload = Array.from(files).slice(0, remaining).filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_MB * 1024 * 1024) return false;
      return true;
    });

    if (toUpload.length === 0) {
      toast({ title: 'Invalid files', description: 'Use JPEG/PNG/WebP/GIF, max 5MB each.', variant: 'destructive' });
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    setUploading(true);
    const prefix = isNew ? 'new' : id;
    const folder = `${user.id}/admin-vendors/${prefix}`;
    const newUrls: string[] = [];

    for (const file of toUpload) {
      const ext = file.name.split('.').pop() || 'jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const path = `${folder}/${name}`;
      const { error } = await supabase.storage.from('vendor-files').upload(path, file);
      if (error) {
        toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
        continue;
      }
      const { data: urlData } = supabase.storage.from('vendor-files').getPublicUrl(path);
      newUrls.push(urlData.publicUrl);
    }

    if (newUrls.length > 0) {
      const updated = [...form.portfolio_images, ...newUrls];
      update({ portfolio_images: updated, cover_image_url: form.cover_image_url || updated[0] });
      toast({ title: 'Images added', description: `${newUrls.length} image(s) uploaded.` });
    }
    setUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeImage = (url: string) => {
    const next = form.portfolio_images.filter((u) => u !== url);
    const nextCover = form.cover_image_url === url ? (next[0] || null) : form.cover_image_url;
    update({ portfolio_images: next, cover_image_url: nextCover });
  };

  const setCover = (url: string) => update({ cover_image_url: url });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.business_name.trim();
    if (!name) {
      toast({ title: 'Validation', description: 'Business name is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const priceUsd = form.starting_price_usd ? parseFloat(form.starting_price_usd) : null;
    const priceLbp = priceUsd != null ? Math.round(priceUsd * 89500) : null;
    const payload = {
      user_id: PLACEHOLDER_USER_ID,
      business_name: name,
      category: form.category,
      region: form.region,
      description: form.description || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      instagram: form.instagram || null,
      whatsapp: form.whatsapp || null,
      starting_price_usd: priceUsd,
      starting_price_lbp: priceLbp,
      status: form.status,
      is_featured: form.is_featured,
      is_sample: true,
      portfolio_images: form.portfolio_images,
      cover_image_url: form.cover_image_url || form.portfolio_images[0] || null,
      shortlist_count: 0,
    };

    if (isNew) {
      const { data, error } = await supabase.from('vendors').insert(payload).select('id').single();
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
      toast({ title: 'Vendor created', description: name });
      navigate(`/admin/vendors/${data.id}/edit`);
    } else {
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: payload.business_name,
          category: payload.category,
          region: payload.region,
          description: payload.description,
          phone: payload.phone,
          email: payload.email,
          website: payload.website,
          instagram: payload.instagram,
          whatsapp: payload.whatsapp,
          starting_price_usd: payload.starting_price_usd,
          starting_price_lbp: payload.starting_price_lbp,
          status: payload.status,
          is_featured: payload.is_featured,
          portfolio_images: payload.portfolio_images,
          cover_image_url: payload.cover_image_url,
        })
        .eq('id', id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Vendor updated', description: name });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/vendors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isNew ? 'Add Vendor' : 'Edit Vendor'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Create a new vendor in the directory.' : 'Update business info and images.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business info</CardTitle>
              <CardDescription>Required and public fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business name *</Label>
                  <Input
                    id="business_name"
                    value={form.business_name}
                    onChange={(e) => update({ business_name: e.target.value })}
                    placeholder="e.g. Beirut Venue Co"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(v) => update({ category: v })}>
                    <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VENDOR_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={form.region} onValueChange={(v) => update({ region: v })}>
                    <SelectTrigger id="region"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEBANESE_REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Starting price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={1}
                    value={form.starting_price_usd}
                    onChange={(e) => update({ starting_price_usd: e.target.value })}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Tell couples about this vendor..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Phone, email, website, social</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  placeholder="+961 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="contact@..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  placeholder="+961 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => update({ instagram: e.target.value })}
                  placeholder="@handle"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => update({ website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & visibility</CardTitle>
              <CardDescription>Approval and featured badge</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex items-center gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v: FormState['status']) => update({ status: v })}>
                  <SelectTrigger id="status" className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={form.is_featured}
                  onCheckedChange={(v) => update({ is_featured: v })}
                />
                <Label htmlFor="is_featured">Featured (verified-style badge)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery & cover</CardTitle>
              <CardDescription>Upload images (JPEG/PNG/WebP/GIF, max 5MB). First or selected image is the cover.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={imageInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading || form.portfolio_images.length >= MAX_IMAGES}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : `Add images (${form.portfolio_images.length}/${MAX_IMAGES})`}
                </Button>
              </div>
              {form.cover_image_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cover image</p>
                  <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border bg-muted">
                    <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {form.portfolio_images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {form.portfolio_images.map((url) => (
                    <div key={url} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant={form.cover_image_url === url ? 'default' : 'secondary'}
                          onClick={() => setCover(url)}
                          title="Set as cover"
                        >
                          <Star className={`w-4 h-4 ${form.cover_image_url === url ? 'fill-current' : ''}`} />
                        </Button>
                        <Button type="button" size="icon" variant="destructive" onClick={() => removeImage(url)} title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {form.cover_image_url === url && (
                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded font-medium">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/vendors')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isNew ? 'Create vendor' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
