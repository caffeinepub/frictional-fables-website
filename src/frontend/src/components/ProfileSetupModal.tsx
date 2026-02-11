import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { AlertCircle } from 'lucide-react';

export default function ProfileSetupModal() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [hasRedirected, setHasRedirected] = useState(false);

  const isAuthenticated = !!identity;
  const needsProfile = isAuthenticated && isFetched && (userProfile === null || (userProfile !== undefined && (!userProfile.email || userProfile.email === '')));
  const showProfileSetup = needsProfile && !profileLoading && !hasRedirected;

  // Reset redirect flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasRedirected(false);
    }
  }, [isAuthenticated]);

  const handleGoToProfile = () => {
    setHasRedirected(true);
    navigate({ to: '/profile' });
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Please complete your profile with your name and email to access books, blogs, and character notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Button 
            onClick={handleGoToProfile}
            className="w-full" 
            size="lg"
          >
            Go to Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
