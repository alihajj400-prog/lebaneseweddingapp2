import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/for-couples', label: 'For Couples' },
  { href: '/for-vendors', label: 'For Vendors' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function WebsiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="container-custom mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">
            Lebanon Wedding
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container-custom mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Log In</Button>
                </Link>
                <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
