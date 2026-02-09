import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookOpen, User, Upload, X } from 'lucide-react';
import WelcomeMessageModal from '../components/WelcomeMessageModal';
import UserAvatar from '../components/UserAvatar';
import { ExternalBlob } from '../backend';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [bestReads, setBestReads] = useState('');
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | undefined>(undefined);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;

  // Load existing profile data when available
  useEffect(() => {
    if (userProfile && isFetched && !hasLoadedProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setGender(userProfile.gender || '');
      setBestReads(userProfile.bestReads || '');
      setProfilePicture(userProfile.profilePicture);
      
      if (userProfile.profilePicture) {
        setProfilePicturePreview(userProfile.profilePicture.getDirectURL());
      }
      
      setHasLoadedProfile(true);
      
      // Show a subtle notification that profile was loaded
      if (userProfile.email) {
        console.log('Profile loaded successfully for:', userProfile.name);
      }
    }
  }, [userProfile, isFetched, hasLoadedProfile]);

  const validateName = (value: string): boolean => {
    const trimmedName = value.trim();
    
    if (!trimmedName) {
      setNameError('Name is required');
      return false;
    }
    
    // Allow "Kriti 1" exactly
    if (trimmedName === 'Kriti 1') {
      setNameError('');
      return true;
    }
    
    // Disallow any other name containing "1"
    if (trimmedName.includes('1')) {
      setNameError('Names cannot contain the number "1" (except for admin name "Kriti 1")');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const validateEmail = (value: string): boolean => {
    const trimmedEmail = value.trim();
    
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      
      setProfilePicture(blob);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
      
      toast.success('Profile picture selected');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(undefined);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Profile picture removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to update your profile');
      return;
    }

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);

    if (!isNameValid || !isEmailValid) {
      toast.error('Please fix the validation errors');
      return;
    }

    // Check if this is first-time profile completion
    const isFirstTimeCompletion = !userProfile || !userProfile.email || userProfile.email === '';

    try {
      await saveProfileMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        gender: gender.trim() || undefined,
        bestReads: bestReads.trim() || undefined,
        profilePicture: profilePicture || undefined,
        welcomeMessageShown: userProfile?.welcomeMessageShown || false,
      });
      toast.success('Profile saved successfully! Your information is now stored persistently.');
      
      // Show welcome message only on first-time completion
      if (isFirstTimeCompletion) {
        setShowWelcome(true);
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleWelcomeClose = async () => {
    setShowWelcome(false);
    // Mark welcome message as shown
    if (userProfile) {
      try {
        await saveProfileMutation.mutateAsync({
          ...userProfile,
          welcomeMessageShown: true,
        });
      } catch (error) {
        console.error('Failed to update welcome message status:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Profile</CardTitle>
            <CardDescription>
              Please log in to view and manage your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Your profile allows you to personalize your reading experience and connect with the Frictional Fables community.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[60vh] py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-serif">Your Profile</CardTitle>
                  <CardDescription>
                    {userProfile && userProfile.email 
                      ? 'Update your personal information and reading preferences'
                      : 'Create your profile to access all content and features'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Profile Picture <span className="text-muted-foreground text-sm">(optional)</span>
                  </Label>
                  <div className="flex items-center gap-4">
                    <UserAvatar 
                      name={name || 'User'} 
                      profilePicture={profilePicture}
                      size="lg"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={saveProfileMutation.isPending || isUploading}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={saveProfileMutation.isPending || isUploading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {profilePicture ? 'Change Picture' : 'Upload Picture'}
                        </Button>
                        {profilePicture && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveProfilePicture}
                            disabled={saveProfileMutation.isPending || isUploading}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                      {isUploading && uploadProgress > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Uploading: {uploadProgress}%
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {profilePicture 
                          ? 'Your profile picture will be displayed in comments and discussions'
                          : 'If no picture is uploaded, the first letter of your name will be shown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Field - Mandatory */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Enter your name"
                    disabled={saveProfileMutation.isPending}
                    className={nameError ? 'border-destructive' : ''}
                  />
                  {nameError && (
                    <p className="text-sm text-destructive">{nameError}</p>
                  )}
                </div>

                {/* Email Field - Mandatory */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="your.email@example.com"
                    disabled={saveProfileMutation.isPending}
                    className={emailError ? 'border-destructive' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>

                {/* Gender Field - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-base font-medium">
                    Gender <span className="text-muted-foreground text-sm">(optional)</span>
                  </Label>
                  <Input
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="Enter your gender"
                    disabled={saveProfileMutation.isPending}
                  />
                </div>

                {/* Best Reads Field - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="bestReads" className="text-base font-medium">
                    Best Reads <span className="text-muted-foreground text-sm">(optional)</span>
                  </Label>
                  <Textarea
                    id="bestReads"
                    value={bestReads}
                    onChange={(e) => setBestReads(e.target.value)}
                    placeholder="Share your favorite books or reading experiences..."
                    disabled={saveProfileMutation.isPending}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saveProfileMutation.isPending || !!nameError || !!emailError || isUploading}
                  >
                    {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>

              {/* Display Current Profile Info */}
              {userProfile && userProfile.email && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-lg font-serif font-semibold mb-4">Current Profile</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        name={userProfile.name} 
                        profilePicture={userProfile.profilePicture}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Name:</span>
                          <span className="font-medium">{userProfile.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{userProfile.email}</span>
                    </div>
                    {userProfile.gender && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">{userProfile.gender}</span>
                      </div>
                    )}
                    {userProfile.bestReads && (
                      <div className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Best Reads:</span>
                        <p className="text-foreground whitespace-pre-wrap">{userProfile.bestReads}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <WelcomeMessageModal open={showWelcome} onClose={handleWelcomeClose} />
    </>
  );
}
