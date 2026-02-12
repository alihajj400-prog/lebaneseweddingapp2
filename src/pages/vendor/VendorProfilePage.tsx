import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Building2, Upload, Trash2, Star, FileText, 
  ExternalLink, ImagePlus, Lock, Image as ImageIcon 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';

interface VendorData {
  id: string;
  business_name: string;
  category: string;
  region: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  whatsapp: string | null;
  starting_price_usd: number | null;
  portfolio_images: string[] | null;
  cover_image_url: string | null;
  brochure_url: string | null;
  subscription_plan: string | null;
  max_images: number | null;
}

export default function VendorProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [form, setForm] = useState<Partial<VendorData>>({});
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchVendor();
  }, [user]);

  const fetchVendor = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setVendor(data as VendorData);
      setForm(data as VendorData);
      setImages(data.portfolio_images || []);
      setCoverImage(data.cover_image_url);
      setBrochureUrl(data.brochure_url);
    }
    setLoading(false);
  };

  const handleChange = (field: keyof VendorData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!vendor) return;
    setSaving(true);
    const { error } = await supabase
      .from('vendors')
      .update({
        business_name: form.business_name,
        category: form.category as any,
        region: form.region as any,
        description: form.description,
        phone: form.phone,
        email: form.email,
        website: form.website,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
        starting_price_usd: form.starting_price_usd,
      })
      .eq('id', vendor.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save changes.', variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      setVendor({ ...vendor, ...form } as VendorData);
    }
    setSaving(false);
  };

  // === Image logic ===
  const maxImages = vendor?.max_images || 3;
  const canUploadMore = images.length < maxImages;
  const remainingSlots = maxImages - images.length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user || !vendor) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (filesToUpload.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of filesToUpload) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/portfolio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-files')
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from('vendor-files')
        .getPublicUrl(filePath);
      newImages.push(publicUrl.publicUrl);
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      await supabase.from('vendors').update({ portfolio_images: updatedImages }).eq('id', vendor.id);
      setImages(updatedImages);
      toast({ title: 'Images Uploaded', description: `${newImages.length} image(s) added.` });
    }

    setUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const deleteImage = async (imageUrl: string) => {
    if (!vendor) return;
    const updatedImages = images.filter(img => img !== imageUrl);
    await supabase.from('vendors').update({ portfolio_images: updatedImages }).eq('id', vendor.id);
    setImages(updatedImages);

    if (coverImage === imageUrl) {
      await supabase.from('vendors').update({ cover_image_url: null }).eq('id', vendor.id);
      setCoverImage(null);
    }
    toast({ title: 'Image Deleted' });
  };

  const setCover = async (imageUrl: string) => {
    if (!vendor) return;
    await supabase.from('vendors').update({ cover_image_url: imageUrl }).eq('id', vendor.id);
    setCoverImage(imageUrl);
    toast({ title: 'Cover Image Set' });
  };

  // === Brochure logic ===
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !vendor) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid File', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    setUploadingBrochure(true);
    const fileName = `brochure-${Date.now()}.pdf`;
    const filePath = `${user.id}/brochure/${fileName}`;

    if (brochureUrl) {
      const oldPath = brochureUrl.split('/vendor-files/')[1];
      if (oldPath) await supabase.storage.from('vendor-files').remove([oldPath]);
    }

    const { error: uploadError } = await supabase.storage
      .from('vendor-files')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      setUploadingBrochure(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('vendor-files')
      .getPublicUrl(filePath);

    await supabase.from('vendors').update({ brochure_url: publicUrl.publicUrl }).eq('id', vendor.id);
    setBrochureUrl(publicUrl.publicUrl);
    toast({ title: 'Brochure Uploaded' });
    setUploadingBrochure(false);
    if (brochureInputRef.current) brochureInputRef.current.value = '';
  };

  const deleteBrochure = async () => {
    if (!brochureUrl || !vendor) return;
    const filePath = brochureUrl.split('/vendor-files/')[1];
    if (filePath) await supabase.storage.from('vendor-files').remove([filePath]);
    await supabase.from('vendors').update({ brochure_url: null }).eq('id', vendor.id);
    setBrochureUrl(null);
    toast({ title: 'Brochure Deleted' });
  };

  if (loading) {
    return (
      <VendorPortalLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </VendorPortalLayout>
    );
  }

  if (!vendor) {
    return (
      <VendorPortalLayout>
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Vendor Profile</h2>
          <p className="text-muted-foreground">Please complete your vendor registration.</p>
        </div>
      </VendorPortalLayout>
    );
  }

  return (
    <VendorPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your business info, images & brochure</p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Business Info</TabsTrigger>
            <TabsTrigger value="images">Portfolio Images</TabsTrigger>
            <TabsTrigger value="brochure">Brochure</TabsTrigger>
          </TabsList>

          {/* === Business Info Tab === */}
          <TabsContent value="info" className="space-y-6 mt-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Displayed on your public vendor profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input id="business_name" value={form.business_name || ''} onChange={(e) => handleChange('business_name', e.target.value)} placeholder="Your business name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={form.category || ''} onValueChange={(v) => handleChange('category', v)}>
                        <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {VENDOR_CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select value={form.region || ''} onValueChange={(v) => handleChange('region', v)}>
                        <SelectTrigger id="region"><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>
                          {LEBANESE_REGIONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Starting Price (USD)</Label>
                      <Input id="price" type="number" value={form.starting_price_usd || ''} onChange={(e) => handleChange('starting_price_usd', parseFloat(e.target.value) || null)} placeholder="e.g., 500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Tell couples about your business..." rows={5} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How couples can reach you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+961 XX XXX XXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input id="whatsapp" value={form.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="+961 XX XXX XXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="contact@yourbusiness.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram Handle</Label>
                      <Input id="instagram" value={form.instagram || ''} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="@yourbusiness" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" value={form.website || ''} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://www.yourbusiness.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* === Images Tab === */}
          <TabsContent value="images" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {images.length} of {maxImages} images used
              </p>
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading || !canUploadMore}
                  size="sm"
                >
                  {canUploadMore ? (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : `Upload (${remainingSlots} left)`}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Limit Reached
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!canUploadMore && (
              <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 dark:text-amber-200">Image limit reached</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Max {maxImages} images for your {vendor.subscription_plan || 'free'} plan.{' '}
                  <Link to="/vendor/subscription" className="font-medium underline">Upgrade</Link> for more.
                </AlertDescription>
              </Alert>
            )}

            {coverImage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" /> Cover Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                {images.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <h3 className="font-medium mb-1">No images yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Upload portfolio images to attract couples</p>
                    <Button size="sm" onClick={() => imageInputRef.current?.click()}>
                      <ImagePlus className="w-4 h-4 mr-2" /> Upload Your First Image
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
                      >
                        <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="icon" variant={coverImage === img ? "default" : "secondary"} onClick={() => setCover(img)} title="Set as cover">
                            <Star className={`w-4 h-4 ${coverImage === img ? 'fill-current' : ''}`} />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => deleteImage(img)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {coverImage === img && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Cover
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Brochure Tab === */}
          <TabsContent value="brochure" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>PDF Brochure</CardTitle>
                <CardDescription>A detailed PDF showcasing your services, packages, and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                {brochureUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Business Brochure</p>
                        <p className="text-sm text-muted-foreground">PDF Document</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(brochureUrl, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button variant="destructive" size="sm" onClick={deleteBrochure}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <input ref={brochureInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleBrochureUpload} />
                      <Button variant="outline" onClick={() => brochureInputRef.current?.click()} disabled={uploadingBrochure}>
                        <Upload className="w-4 h-4 mr-2" /> {uploadingBrochure ? 'Uploading...' : 'Replace Brochure'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <h3 className="font-medium mb-1">No brochure uploaded</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">Upload a PDF with your services, packages, and pricing</p>
                    <input ref={brochureInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleBrochureUpload} />
                    <Button size="sm" onClick={() => brochureInputRef.current?.click()} disabled={uploadingBrochure}>
                      <Upload className="w-4 h-4 mr-2" /> {uploadingBrochure ? 'Uploading...' : 'Upload PDF Brochure'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendorPortalLayout>
  );
}
