import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container-custom mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 fill-current" />
              <span className="font-serif text-xl font-semibold">
                Lebanon Wedding
              </span>
            </Link>
            <p className="text-primary-foreground/80 text-sm">
              Your complete wedding planning companion, designed exclusively for Lebanese couples.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Planning Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/checklist" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Wedding Checklist
                </Link>
              </li>
              <li>
                <Link to="/budget" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Budget Planner
                </Link>
              </li>
              <li>
                <Link to="/guests" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Guest List
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-primary-foreground/80 hover:text-primary-foreground text-sm transition-colors">
                  Find Vendors
                </Link>
              </li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="font-semibold mb-4">Regions</h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80 text-sm">Beirut</li>
              <li className="text-primary-foreground/80 text-sm">Mount Lebanon</li>
              <li className="text-primary-foreground/80 text-sm">North Lebanon</li>
              <li className="text-primary-foreground/80 text-sm">South Lebanon</li>
              <li className="text-primary-foreground/80 text-sm">Bekaa</li>
              <li className="text-primary-foreground/80 text-sm">Nabatieh</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="mailto:hello@lebanonwedding.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              hello@lebanonwedding.com
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Lebanon Wedding Planner. Made with ❤️ in Lebanon.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
