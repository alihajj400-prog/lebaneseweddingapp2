import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";

// Pages
import LandingPage from "./pages/LandingPage";

// Marketing Website Pages
import HomePage from "./website/pages/HomePage";
import ForCouplesPage from "./website/pages/ForCouplesPage";
import ForVendorsPage from "./website/pages/ForVendorsPage";
import AboutPage from "./website/pages/AboutPage";
import ContactPage from "./website/pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import VendorAuthPage from "./pages/VendorAuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import ChecklistPage from "./pages/ChecklistPage";
import BudgetPage from "./pages/BudgetPage";
import GuestsPage from "./pages/GuestsPage";
import VendorsPage from "./pages/VendorsPage";
import VendorDetailPage from "./pages/VendorDetailPage";
import ShortlistPage from "./pages/ShortlistPage";
import BookingsPage from "./pages/BookingsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Vendor Portal Pages
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";
// VendorImagesPage and VendorBrochurePage merged into VendorProfilePage
import VendorLeadsPage from "./pages/vendor/VendorLeadsPage";
import VendorPromotionsPage from "./pages/vendor/VendorPromotionsPage";
import VendorSettingsPage from "./pages/vendor/VendorSettingsPage";
import VendorBookingsPage from "./pages/vendor/VendorBookingsPage";
import VendorSubscriptionPage from "./pages/vendor/VendorSubscriptionPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVendorsPage from "./pages/admin/AdminVendorsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminVendorImportPage from "./pages/admin/AdminVendorImportPage";

const queryClient = new QueryClient();

// Auth redirect - redirect logged in users away from landing/auth pages
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If logged in, redirect to appropriate dashboard
  if (user) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (profile?.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    // Couples - check if onboarding is needed
    if (profile?.role === 'couple' && profile?.onboarding_completed === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Protected Route Component for Couples
function CoupleRoute({ children, requireOnboarding = true }: { children: React.ReactNode; requireOnboarding?: boolean }) {
  const { user, profile, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect admins to their dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Redirect vendors to their dashboard
  if (profile?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  // Redirect to onboarding if not completed (for couples only)
  if (requireOnboarding && profile?.role === 'couple' && profile?.onboarding_completed === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Protected Route Component for Vendors
function VendorRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/vendor/auth" replace />;
  }

  // Redirect couples to their dashboard
  if (profile?.role === 'couple') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Protected Route Component for Admins
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public Marketing Website Pages */}
    <Route path="/" element={<HomePage />} />
    <Route path="/for-couples" element={<ForCouplesPage />} />
    <Route path="/for-vendors" element={<ForVendorsPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    
    {/* Auth routes - redirect to dashboard if logged in */}
    <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
    <Route path="/vendor/auth" element={<PublicOnlyRoute><VendorAuthPage /></PublicOnlyRoute>} />
    
    {/* Onboarding - requires auth but not onboarding completion */}
    <Route path="/onboarding" element={<CoupleRoute requireOnboarding={false}><OnboardingPage /></CoupleRoute>} />
    
    {/* Vendors page - requires auth */}
    <Route path="/vendors" element={<CoupleRoute><VendorsPage /></CoupleRoute>} />
    <Route path="/vendors/:id" element={<CoupleRoute><VendorDetailPage /></CoupleRoute>} />
    
    {/* Protected Couple Routes */}
    <Route path="/dashboard" element={<CoupleRoute><DashboardPage /></CoupleRoute>} />
    <Route path="/checklist" element={<CoupleRoute><ChecklistPage /></CoupleRoute>} />
    <Route path="/budget" element={<CoupleRoute><BudgetPage /></CoupleRoute>} />
    <Route path="/guests" element={<CoupleRoute><GuestsPage /></CoupleRoute>} />
    <Route path="/shortlist" element={<CoupleRoute><ShortlistPage /></CoupleRoute>} />
    <Route path="/bookings" element={<CoupleRoute><BookingsPage /></CoupleRoute>} />
    <Route path="/settings" element={<CoupleRoute><SettingsPage /></CoupleRoute>} />
    
    {/* Protected Vendor Routes - Dedicated Business Portal */}
    <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboardPage /></VendorRoute>} />
    <Route path="/vendor/profile" element={<VendorRoute><VendorProfilePage /></VendorRoute>} />
    <Route path="/vendor/images" element={<Navigate to="/vendor/profile" replace />} />
    <Route path="/vendor/brochure" element={<Navigate to="/vendor/profile" replace />} />
    <Route path="/vendor/leads" element={<VendorRoute><VendorLeadsPage /></VendorRoute>} />
    <Route path="/vendor/promotions" element={<VendorRoute><VendorPromotionsPage /></VendorRoute>} />
    <Route path="/vendor/bookings" element={<VendorRoute><VendorBookingsPage /></VendorRoute>} />
    <Route path="/vendor/settings" element={<VendorRoute><VendorSettingsPage /></VendorRoute>} />
    <Route path="/vendor/subscription" element={<VendorRoute><VendorSubscriptionPage /></VendorRoute>} />
    
    {/* Protected Admin Routes */}
    <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
    <Route path="/admin/vendors" element={<AdminRoute><AdminVendorsPage /></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
    <Route path="/admin/vendor-import" element={<AdminRoute><AdminVendorImportPage /></AdminRoute>} />
    <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
