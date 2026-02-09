import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Tag, Loader2, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { useGetCharacterNote, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEffect, useState } from 'react';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function CharacterNoteViewerPage() {
  const { noteId } = useParams({ from: '/character-note/$noteId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: note, isLoading, error } = useGetCharacterNote(noteId);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isAuthenticated = !!identity;
  const hasCompleteProfile = userProfile && userProfile.email && userProfile.email !== '';
  const needsAuth = !isAuthenticated || !hasCompleteProfile;

  // Check if error is due to incomplete profile
  const isAuthError = error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile');

  useEffect(() => {
    // Show login modal if user needs authentication
    if (needsAuth && !profileLoading) {
      setShowLoginModal(true);
    }
  }, [needsAuth, profileLoading]);

  useEffect(() => {
    if (note?.file && note.fileType) {
      const url = note.file.getDirectURL();
      setFileUrl(url);
      
      // Determine file type from backend
      let type = '';
      if (note.fileType === 'pdf') {
        type = 'pdf';
        setViewerUrl(url);
      } else if (note.fileType === 'image') {
        type = 'image';
        setViewerUrl(url);
      } else if (note.fileType === 'video') {
        type = 'video';
        setViewerUrl(url);
      }
      setFileType(type);
    }

    // Cleanup function to revoke blob URL if needed
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [note]);

  const hasFile = note?.file && fileUrl;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/character-notes-preview.dim_600x300.jpg)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {isLoading || profileLoading ? (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading character note...</p>
            </CardContent>
          </Card>
        ) : needsAuth || isAuthError ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Authentication Required</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Please login and complete your profile to view this character note.
              </p>
              <Button onClick={() => setShowLoginModal(true)}>
                Login to View
              </Button>
            </CardContent>
          </Card>
        ) : note ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-3xl font-serif flex items-center gap-3">
                  <Tag className="h-7 w-7 text-primary" />
                  {note.title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {note.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {hasFile && (
              <Card className="border-primary/10 overflow-hidden">
                <div className="bg-muted px-6 py-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {fileType === 'pdf' && <FileText className="h-5 w-5 text-primary" />}
                    {fileType === 'image' && <ImageIcon className="h-5 w-5 text-primary" />}
                    {fileType === 'video' && <Video className="h-5 w-5 text-primary" />}
                    <span className="font-medium">
                      {fileType === 'pdf' && 'PDF Document'}
                      {fileType === 'image' && 'Image'}
                      {fileType === 'video' && 'Video'}
                    </span>
                  </div>
                </div>
                <CardContent className="p-0">
                  {fileType === 'pdf' && viewerUrl && (
                    <div className="w-full" style={{ height: 'calc(100vh - 350px)', minHeight: '600px' }}>
                      <iframe
                        src={`${viewerUrl}#toolbar=1`}
                        className="w-full h-full border-0"
                        title={note.title}
                        allow="autoplay"
                      />
                    </div>
                  )}
                  
                  {fileType === 'image' && viewerUrl && (
                    <div className="w-full p-6 bg-muted/20">
                      <img
                        src={viewerUrl}
                        alt={note.title}
                        className="w-full h-auto max-h-[800px] object-contain rounded-lg shadow-lg mx-auto"
                      />
                    </div>
                  )}
                  
                  {fileType === 'video' && viewerUrl && (
                    <div className="w-full p-6 bg-muted/20">
                      <video
                        src={viewerUrl}
                        controls
                        className="w-full max-h-[600px] rounded-lg shadow-lg mx-auto"
                        style={{ maxWidth: '100%' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!hasFile && (
              <Card className="border-primary/10">
                <CardContent className="text-center py-12">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    This character note contains text information only.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">Character Note Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Note Not Available</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                The character note you're looking for (ID: {noteId}) could not be found.
              </p>
              <Button onClick={() => navigate({ to: '/' })}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
