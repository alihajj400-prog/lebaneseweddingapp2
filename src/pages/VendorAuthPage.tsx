import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, Mail, Lock, Building2, AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { VENDOR_CATEGORIES, LEBANESE_REGIONS } from '@/lib/constants';

const vendorSignUpSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  category: z.string().min(1, 'Please select a category'),
  region: z.string().min(1, 'Please select a region'),
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function VendorAuthPage() {
  const navigate = useNavigate();
  const { signIn, user, profile } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    phone: '',
    category: '',
    region: '',
  });

  // Redirect if already logged in as vendor
  useEffect(() => {
    if (user && profile?.role === 'vendor') {
      navigate('/vendor/dashboard');
    } else if (user && profile?.role === 'couple') {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        const validation = vendorSignUpSchema.safeParse(formData);
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/vendor/dashboard`;

        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.businessName,
              role: 'vendor',
            },
          },
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            setErrors({ email: 'This email is already registered. Please sign in.' });
          } else {
            toast({
              title: 'Sign up failed',
              description: authError.message,
              variant: 'destructive',
            });
          }
          setLoading(false);
          return;
        }

        if (authData.user) {
          // Update the profile to be a vendor
          await supabase
            .from('profiles')
            .update({ role: 'vendor', full_name: formData.businessName, phone: formData.phone })
            .eq('user_id', authData.user.id);

          // Create the vendor profile
          const { error: vendorError } = await supabase
            .from('vendors')
            .insert({
              user_id: authData.user.id,
              business_name: formData.businessName,
              category: formData.category as any,
              region: formData.region as any,
              phone: formData.phone,
              email: formData.email,
              status: 'pending',
            });

          if (vendorError) {
            console.error('Error creating vendor profile:', vendorError);
          }

          // Add vendor role to user_roles
          await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'vendor',
            });
        }

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account. Your business profile is pending approval.',
        });
      } else {
        const validation = signInSchema.safeParse({ email: formData.email, password: formData.password });
        if (!validation.success) {
          const fieldErrors: Record<string, string> = {};
          validation.error.errors.forEach(err => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ password: 'Invalid email or password' });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        }
        // Navigation handled by useEffect when profile loads
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <Building2 className="w-8 h-8 text-primary" />
            <span className="font-serif text-2xl font-semibold text-foreground">
              Vendor Portal
            </span>
          </div>

          {/* Header */}
          <h1 className="heading-section text-foreground mb-2">
            {isSignUp ? 'Register your business' : 'Vendor Sign In'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp
              ? 'Join Lebanon\'s premier wedding vendor directory'
              : 'Access your vendor dashboard'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Your business name"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.businessName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {VENDOR_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleSelectChange('region', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEBANESE_REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.region}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+961 XX XXX XXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@business.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Register Business' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-muted-foreground">
            {isSignUp ? 'Already have a vendor account?' : "Don't have a vendor account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Register'}
            </button>
          </p>

          {/* Couple Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Planning your wedding?{' '}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Sign up as a couple
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary to-secondary/80 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-secondary-foreground max-w-md"
        >
          <Building2 className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="font-serif text-3xl font-semibold mb-4 text-foreground">
            Grow Your Wedding Business
          </h2>
          <p className="text-muted-foreground">
            Join Lebanon's trusted wedding vendor directory. Connect with couples 
            planning their dream wedding and showcase your services to thousands.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-serif text-2xl font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground">Listing</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-serif text-2xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Couples</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-serif text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Regions</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4">
              <div className="font-serif text-2xl font-bold text-primary">Direct</div>
              <div className="text-sm text-muted-foreground">Inquiries</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
