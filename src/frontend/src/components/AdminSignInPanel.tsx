import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminLogin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Lock, Loader2, LogIn, AlertCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { classifyAdminLoginError, AdminLoginErrorType } from '../utils/errors';

export default function AdminSignInPanel() {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const adminLoginMutation = useAdminLogin();
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AdminLoginErrorType | null>(null);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorType(null);

    if (!adminName.trim()) {
      toast.error('Please enter admin name');
      return;
    }

    if (!adminPassword.trim()) {
      toast.error('Please enter admin password');
      return;
    }

    try {
      // Trim credentials before sending to backend
      const trimmedAdminName = adminName.trim();
      const trimmedAdminPassword = adminPassword.trim();
      
      const result = await adminLoginMutation.mutateAsync({ 
        adminName: trimmedAdminName, 
        adminPassword: trimmedAdminPassword 
      });
      
      if (result) {
        toast.success('Admin access granted!');
        setAdminName('');
        setAdminPassword('');
        setErrorMessage(null);
        setErrorType(null);
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      // Classify the error and show appropriate message
      const { type, message } = classifyAdminLoginError(error);
      setErrorType(type);
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleReLogin = async () => {
    try {
      await clear();
      // Wait a bit for the clear to complete
      setTimeout(() => {
        login();
      }, 300);
    } catch (error) {
      console.error('Re-login error:', error);
      toast.error('Failed to re-login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-serif text-primary mb-2">
              Admin Sign In
            </CardTitle>
            <CardDescription className="text-base">
              Access content management tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-5 w-5 text-primary" />
              <AlertDescription className="text-foreground/90 ml-2">
                <p className="font-medium mb-2">To access admin features:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>First, log in with Internet Identity (if not already logged in)</li>
                  <li>Then, enter your admin name and password below</li>
                  <li>Once authenticated, you'll have full access to content management</li>
                </ol>
              </AlertDescription>
            </Alert>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <Alert className="border-amber-500/20 bg-amber-500/5">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-foreground/90 ml-2">
                    <p className="font-medium">Step 1: Internet Identity Login Required</p>
                    <p className="text-sm mt-1">
                      You must first authenticate with Internet Identity before entering admin credentials.
                    </p>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full"
                  size="lg"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <Alert className="border-green-500/20 bg-green-500/5">
                  <Info className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-foreground/90 ml-2">
                    <p className="font-medium">Step 2: Enter Admin Credentials</p>
                    <p className="text-sm mt-1">
                      You're logged in with Internet Identity. Now enter your admin name and password.
                    </p>
                  </AlertDescription>
                </Alert>

                {errorMessage && (
                  <Alert variant="destructive" className="border-destructive/50">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription className="ml-2">
                      <p className="font-medium">{errorMessage}</p>
                      {errorType === AdminLoginErrorType.AUTHORIZATION_ISSUE && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleReLogin}
                          className="mt-3"
                        >
                          <LogIn className="mr-2 h-3 w-3" />
                          Re-login with Internet Identity
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="admin-name">Admin Name</Label>
                  <Input
                    id="admin-name"
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter admin name"
                    disabled={adminLoginMutation.isPending}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    disabled={adminLoginMutation.isPending}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={adminLoginMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {adminLoginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In as Admin
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Admin access is restricted to authorized personnel only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
