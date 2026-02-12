import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/vendors', label: 'Vendors' },
    { href: '/checklist', label: 'Checklist' },
    { href: '/budget', label: 'Budget' },
    { href: '/guests', label: 'Guests' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="container-custom mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">
            Lebanon Wedding
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {user && navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container-custom mx-auto px-4 py-4 space-y-4">
              {user && navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border space-y-2">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <User className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
