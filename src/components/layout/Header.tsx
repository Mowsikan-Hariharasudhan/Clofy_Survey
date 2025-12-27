import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = "Clofy Survey", showBack = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBack && !isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground leading-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">Billing Experience</p>
            </div>
          </div>
        </div>

        {!isHome && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
