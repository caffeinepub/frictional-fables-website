import { SiInstagram } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© 2025. Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/frictional_fables"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <SiInstagram className="h-5 w-5" />
              <span>@frictional_fables</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
