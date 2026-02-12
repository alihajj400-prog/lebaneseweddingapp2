import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Trash2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';
import { SAMPLE_VENDORS } from '@/lib/sampleVendors';

const VALID_CATEGORIES = VENDOR_CATEGORIES.map(c => c.value);
const VALID_REGIONS = LEBANESE_REGIONS.map(r => r.value);

interface ParsedVendor {
  business_name: string;
  category: string;
  region: string;
  starting_price_usd: number | null;
  starting_price_lbp: number | null;
  description: string | null;
  instagram: string | null;
  whatsapp: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  is_featured: boolean;
  error?: string;
}

const CSV_HEADER = 'name,category,region,starting_price_usd,description,instagram_handle,whatsapp_number,phone_number,website_url,is_featured';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

function parseVendorRow(fields: string[], headers: string[]): ParsedVendor {
  const get = (key: string) => {
    const idx = headers.indexOf(key);
    return idx >= 0 && idx < fields.length ? fields[idx] || null : null;
  };

  const name = get('name') || get('business_name') || '';
  const category = (get('category') || '').toLowerCase().trim();
  const region = (get('region') || '').toLowerCase().trim();
  const priceUsd = get('starting_price_usd');
  const priceLbp = get('starting_price_lbp');

  const errors: string[] = [];
  if (!name) errors.push('Missing name');
  if (!VALID_CATEGORIES.includes(category as any)) errors.push(`Invalid category: "${category}"`);
  if (!VALID_REGIONS.includes(region as any)) errors.push(`Invalid region: "${region}"`);

  return {
    business_name: name,
    category,
    region,
    starting_price_usd: priceUsd ? Number(priceUsd) || null : null,
    starting_price_lbp: priceLbp ? Number(priceLbp) || null : null,
    description: get('description'),
    instagram: get('instagram_handle') || get('instagram'),
    whatsapp: get('whatsapp_number') || get('whatsapp'),
    phone: get('phone_number') || get('phone'),
    website: get('website_url') || get('website'),
    email: get('email'),
    is_featured: (get('is_featured') || '').toLowerCase() === 'true',
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

function parseCSV(text: string): ParsedVendor[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  return lines.slice(1).map(line => parseVendorRow(parseCSVLine(line), headers));
}

export default function AdminVendorImportPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<ParsedVendor[]>([]);
  const [importing, setImporting] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const validVendors = parsed.filter(v => !v.error);
  const invalidVendors = parsed.filter(v => !!v.error);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setParsed(parseCSV(text));
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleParse = () => {
    setParsed(parseCSV(csvText));
    setImportResult(null);
  };

  const handleRemoveRow = (index: number) => {
    setParsed(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (validVendors.length === 0) return;
    setImporting(true);
    setImportResult(null);

    // We need a dummy user_id for seeded vendors. Use a placeholder UUID.
    const SEED_USER_ID = '00000000-0000-0000-0000-000000000000';

    const rows = validVendors.map(v => ({
      business_name: v.business_name,
      category: v.category as any,
      region: v.region as any,
      starting_price_usd: v.starting_price_usd,
      starting_price_lbp: v.starting_price_lbp,
      description: v.description,
      instagram: v.instagram,
      whatsapp: v.whatsapp,
      phone: v.phone,
      website: v.website,
      email: v.email,
      is_featured: v.is_featured,
      status: 'approved' as const,
      user_id: SEED_USER_ID,
    }));

    const { error, data } = await supabase.from('vendors').insert(rows).select('id');

    if (error) {
      toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
      setImportResult({ success: 0, failed: validVendors.length });
    } else {
      const count = data?.length || 0;
      toast({ title: 'Import Complete', description: `${count} vendors imported successfully.` });
      setImportResult({ success: count, failed: invalidVendors.length });
      setParsed(invalidVendors); // keep only failed rows
    }
    setImporting(false);
  };

  const handleSeedSample = async () => {
    setSeedLoading(true);
    const SEED_USER_ID = '00000000-0000-0000-0000-000000000000';

    const rows = SAMPLE_VENDORS.map(v => ({
      ...v,
      status: 'approved' as const,
      user_id: SEED_USER_ID,
    }));

    const { error, data } = await supabase.from('vendors').insert(rows).select('id');

    if (error) {
      toast({ title: 'Seed Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Seed Complete', description: `${data?.length || 0} sample vendors added.` });
    }
    setSeedLoading(false);
  };

  const getCategoryLabel = (v: string) => VENDOR_CATEGORIES.find(c => c.value === v)?.label || v;
  const getRegionLabel = (v: string) => LEBANESE_REGIONS.find(r => r.value === v)?.label || v;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Vendor Import</h2>
          <p className="text-muted-foreground">Bulk import vendors via CSV or seed sample data</p>
        </div>

        {/* Seed Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" /> Seed Sample Vendors
            </CardTitle>
            <CardDescription>
              Add {SAMPLE_VENDORS.length} realistic sample Lebanese vendors across all categories and regions.
              These are placeholders you can later edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedSample} disabled={seedLoading}>
              {seedLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Seeding...</> : 'Seed Sample Vendors'}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5" /> CSV Import
            </CardTitle>
            <CardDescription>
              Upload a CSV file or paste CSV data. Expected headers: {CSV_HEADER}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="paste">
              <TabsList>
                <TabsTrigger value="paste"><FileText className="w-4 h-4 mr-1.5" />Paste</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1.5" />Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="space-y-3 mt-4">
                <Textarea
                  placeholder={`${CSV_HEADER}\nBeirut Seaview Ballroom,venue,beirut,5000,Stunning waterfront venue,...`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                />
                <Button onClick={handleParse} variant="outline">Parse CSV</Button>
              </TabsContent>
              <TabsContent value="upload" className="space-y-3 mt-4">
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview */}
        {parsed.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Preview ({validVendors.length} valid, {invalidVendors.length} invalid)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {importResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${importResult.success > 0 ? 'bg-muted text-foreground' : 'bg-destructive/10 text-destructive'}`}>
                  <CheckCircle className="w-4 h-4 inline mr-1.5" />
                  {importResult.success} imported, {importResult.failed} skipped
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((v, i) => (
                      <TableRow key={i} className={v.error ? 'bg-red-50/50' : ''}>
                        <TableCell className="font-medium">{v.business_name || '—'}</TableCell>
                        <TableCell>{getCategoryLabel(v.category)}</TableCell>
                        <TableCell>{getRegionLabel(v.region)}</TableCell>
                        <TableCell>{v.starting_price_usd ? `$${v.starting_price_usd.toLocaleString()}` : '—'}</TableCell>
                        <TableCell>
                          {v.error ? (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <AlertCircle className="w-3 h-3" /> {v.error}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs gap-1">
                              <CheckCircle className="w-3 h-3" /> Valid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveRow(i)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleImport} disabled={importing || validVendors.length === 0}>
                  {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : `Import ${validVendors.length} Vendors`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
