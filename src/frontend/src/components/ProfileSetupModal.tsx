import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: profileLoading, isFetched } = useGetCallerUserRole();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!identity;
  const needsProfile = userRole === 'guest';
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && needsProfile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Profile setup is handled by the backend automatically when user interacts
      toast.success('Welcome to Frictional Fables!');
      window.location.reload();
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to set up profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Frictional Fables!</DialogTitle>
          <DialogDescription>
            Please tell us your name to get started with reading and community features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
