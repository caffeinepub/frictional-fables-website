import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AlertCircle, LogIn } from 'lucide-react';

interface LoginRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customMessage?: string;
}

export default function LoginRequiredModal({ open, onOpenChange, customMessage }: LoginRequiredModalProps) {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const displayMessage = customMessage || 'Please Login and complete Profile to Read and access';

  const handleLogin = async () => {
    if (!isAuthenticated) {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
      }
    } else {
      // User is authenticated but needs to complete profile
      onOpenChange(false);
      navigate({ to: '/profile' });
    }
  };

  const handleGoToProfile = () => {
    onOpenChange(false);
    navigate({ to: '/profile' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Login Required</DialogTitle>
          <DialogDescription className="text-center">
            {displayMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {!isAuthenticated ? (
            <Button 
              onClick={handleLogin}
              className="w-full" 
              size="lg"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <LogIn className="mr-2 h-4 w-4 animate-pulse" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleGoToProfile}
              className="w-full" 
              size="lg"
            >
              Complete Profile
            </Button>
          )}
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
