import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useIsCallerAdmin, useGetSiteAssets } from '../hooks/useQueries';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: siteAssets } = useGetSiteAssets();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Forum', path: '/forum' },
    { label: 'Blog', path: '/blog' },
    { label: 'Suggestions', path: '/suggestions' },
  ];

  // Add Settings to nav items only if user is authenticated and is admin
  if (isAuthenticated && !adminLoading && isAdmin) {
    navItems.push({ label: 'Settings', path: '/settings' });
  }

  // Get logo URL from uploaded assets or fallback to default
  const getLogoUrl = () => {
    if (siteAssets?.logo) {
      const url = siteAssets.logo.getDirectURL();
      if (url && url !== '') return url;
    }
    return '/assets/_FRICTIONAL_FABLES__20241114_192858_0000.jpg';
  };

  const logoUrl = getLogoUrl();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 text-2xl font-serif font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <img 
              src={logoUrl} 
              alt="Frictional Fables" 
              className="h-10 w-10 object-contain"
            />
            <span className="hidden sm:inline">Frictional Fables</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="hidden sm:inline-flex"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-border/40 pt-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate({ to: item.path });
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="w-full sm:hidden"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
