import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Trash2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorPortalLayout } from '@/components/layout/VendorPortalLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function VendorBrochurePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVendor();
    }
  }, [user]);

  const fetchVendor = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('vendors')
      .select('id, brochure_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setVendorId(data.id);
      setBrochureUrl(data.brochure_url);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !vendorId) return;

    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid File', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    setUploading(true);

    const fileName = `brochure-${Date.now()}.pdf`;
    const filePath = `${user.id}/brochure/${fileName}`;

    // Delete old brochure if exists
    if (brochureUrl) {
      const oldPath = brochureUrl.split('/vendor-files/')[1];
      if (oldPath) {
        await supabase.storage.from('vendor-files').remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('vendor-files')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('vendor-files')
      .getPublicUrl(filePath);

    await supabase
      .from('vendors')
      .update({ brochure_url: publicUrl.publicUrl })
      .eq('id', vendorId);

    setBrochureUrl(publicUrl.publicUrl);
    toast({ title: 'Brochure Uploaded', description: 'Your brochure is now available to couples.' });
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteBrochure = async () => {
    if (!brochureUrl || !vendorId) return;

    const filePath = brochureUrl.split('/vendor-files/')[1];
    if (filePath) {
      await supabase.storage.from('vendor-files').remove([filePath]);
    }

    await supabase
      .from('vendors')
      .update({ brochure_url: null })
      .eq('id', vendorId);

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

  return (
    <VendorPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Brochure</h1>
          <p className="text-muted-foreground mt-1">
            Upload a PDF brochure for couples to download
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Brochure</CardTitle>
              <CardDescription>
                A detailed PDF showcasing your services, packages, and pricing
              </CardDescription>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(brochureUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={deleteBrochure}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Replace Brochure'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-lg mb-2">No brochure uploaded</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Upload a PDF brochure with your services, packages, and pricing information
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload PDF Brochure'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tips for a Great Brochure</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Include high-quality images of your work
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Clearly list your packages and pricing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Add testimonials from past clients
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Include your contact information
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Keep the file size under 10MB for faster downloads
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </VendorPortalLayout>
  );
}
