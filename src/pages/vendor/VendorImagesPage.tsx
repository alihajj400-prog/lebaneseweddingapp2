import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ImagePlus, 
  Trash2, 
  Star, 
  Upload, 
  GripVertical,
  Image as ImageIcon,
  Lock,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VendorImages {
  id: string;
  portfolio_images: string[];
  cover_image_url: string | null;
  subscription_plan: string | null;
  max_images: number | null;
}

export default function VendorImagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [vendor, setVendor] = useState<VendorImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVendor();
    }
  }, [user]);

  const fetchVendor = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('vendors')
      .select('id, portfolio_images, cover_image_url, subscription_plan, max_images')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setVendor(data as VendorImages);
      setImages(data.portfolio_images || []);
      setCoverImage(data.cover_image_url);
    }
    setLoading(false);
  };

  const maxImages = vendor?.max_images || 3;
  const canUploadMore = images.length < maxImages;
  const remainingSlots = maxImages - images.length;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user || !vendor) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
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
      await updateImages(updatedImages);
      setImages(updatedImages);
      toast({ title: 'Images Uploaded', description: `${newImages.length} image(s) added.` });
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateImages = async (updatedImages: string[]) => {
    if (!vendor) return;

    await supabase
      .from('vendors')
      .update({ portfolio_images: updatedImages })
      .eq('id', vendor.id);
  };

  const deleteImage = async (imageUrl: string) => {
    const updatedImages = images.filter(img => img !== imageUrl);
    await updateImages(updatedImages);
    setImages(updatedImages);

    // If deleted image was the cover, clear cover
    if (coverImage === imageUrl) {
      await supabase.from('vendors').update({ cover_image_url: null }).eq('id', vendor!.id);
      setCoverImage(null);
    }

    toast({ title: 'Image Deleted' });
  };

  const setCover = async (imageUrl: string) => {
    if (!vendor) return;

    await supabase
      .from('vendors')
      .update({ cover_image_url: imageUrl })
      .eq('id', vendor.id);

    setCoverImage(imageUrl);
    toast({ title: 'Cover Image Set' });
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

  return (
    <VendorPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Portfolio Images</h1>
            <p className="text-muted-foreground mt-1">
              Showcase your best work to couples
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading || !canUploadMore}
            >
              {canUploadMore ? (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : `Upload Images (${remainingSlots} left)`}
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

        {/* Image Limit Warning */}
        {!canUploadMore && (
          <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Image limit reached</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              You've reached the maximum of {maxImages} images for your {vendor?.subscription_plan || 'free'} plan.{' '}
              <Link to="/vendor/subscription" className="font-medium underline hover:text-amber-800">
                Upgrade your plan
              </Link>{' '}
              to add more portfolio images and attract more couples.
            </AlertDescription>
          </Alert>
        )}

        {/* Cover Image Section */}
        {coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Cover Image
                </CardTitle>
                <CardDescription>
                  This image appears first on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video max-w-md rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Images ({images.length})</CardTitle>
              <CardDescription>
                Click the star to set as cover image
              </CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg mb-2">No images yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your portfolio images to attract couples
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Upload Your First Image
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <motion.div
                      key={img}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
                    >
                      <img
                        src={img}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant={coverImage === img ? "default" : "secondary"}
                          onClick={() => setCover(img)}
                          title="Set as cover"
                        >
                          <Star className={`w-4 h-4 ${coverImage === img ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteImage(img)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Cover Badge */}
                      {coverImage === img && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Cover
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorPortalLayout>
  );
}
