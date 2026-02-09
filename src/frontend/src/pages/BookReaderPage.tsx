import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, BookOpen, Loader2 } from 'lucide-react';
import { useGetBookAssets, useGetBook, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEffect, useState } from 'react';
import BookComments from '../components/BookComments';
import BookRating from '../components/BookRating';
import LoginRequiredModal from '../components/LoginRequiredModal';

export default function BookReaderPage() {
  const { bookId } = useParams({ from: '/book/$bookId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: bookAsset, isLoading: assetLoading, error: assetError } = useGetBookAssets(bookId);
  const { data: bookMetadata, isLoading: metadataLoading } = useGetBook(bookId);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isAuthenticated = !!identity;
  const hasCompleteProfile = userProfile && userProfile.email && userProfile.email !== '';
  const needsAuth = !isAuthenticated || !hasCompleteProfile;

  // Check if error is due to incomplete profile
  const isAuthError = assetError?.message?.includes('Unauthorized') || assetError?.message?.includes('complete your profile');

  useEffect(() => {
    // Show login modal if user needs authentication
    if (needsAuth && profileFetched && !profileLoading) {
      setShowLoginModal(true);
    }
  }, [needsAuth, profileLoading, profileFetched]);

  useEffect(() => {
    if (bookAsset?.bookFile) {
      const url = bookAsset.bookFile.getDirectURL();
      setFileUrl(url);
      
      // Determine file type from backend
      let type = '';
      if (bookAsset.fileType === 'pdf') {
        type = 'pdf';
        setViewerUrl(url);
      } else if (bookAsset.fileType === 'wordDoc' || bookAsset.fileType === 'wordDocx') {
        type = 'word';
        // Use Google Docs Viewer for Word documents
        const encodedUrl = encodeURIComponent(url);
        setViewerUrl(`https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`);
      }
      setFileType(type);
    }

    // Cleanup function to revoke blob URL if needed
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [bookAsset]);

  const isLoading = assetLoading || metadataLoading || profileLoading;
  const hasFile = bookAsset?.bookFile && fileUrl;
  const hasMetadata = !!bookMetadata;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/book-reader-bg.dim_1024x768.jpg)`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {isLoading ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading book...</p>
            </CardContent>
          </Card>
        ) : needsAuth || isAuthError ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">Login Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Authentication Required</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Please login and complete your profile to read this book.
              </p>
              <Button onClick={() => setShowLoginModal(true)}>
                Login to Read
              </Button>
            </CardContent>
          </Card>
        ) : hasFile ? (
          <div className="space-y-8">
            {/* Book Reader */}
            <div className="bg-background rounded-lg shadow-lg overflow-hidden">
              <div className="bg-muted px-6 py-4 border-b">
                <h1 className="text-2xl font-serif font-bold">
                  {bookMetadata?.title || `Book ${bookId}`}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {fileType === 'pdf' ? 'PDF Document' : 'Word Document'}
                </p>
              </div>
              <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
                {(fileType === 'pdf' || fileType === 'word') && viewerUrl ? (
                  <iframe
                    src={fileType === 'pdf' ? `${viewerUrl}#toolbar=1` : viewerUrl}
                    className="w-full h-full border-0"
                    title={bookMetadata?.title || `Book ${bookId}`}
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Unsupported file format</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rating and Comments Section */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {/* Rating Component */}
              <BookRating bookId={bookId} />

              {/* Comments Component - Full Width on Mobile, Half on Desktop */}
              <div className="md:col-span-2">
                <BookComments bookId={bookId} />
              </div>
            </div>
          </div>
        ) : hasMetadata ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">{bookMetadata.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Book File Not Available Yet</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                The book file for "{bookMetadata.title}" has not been uploaded yet. Please check back later!
              </p>
              <Button onClick={() => navigate({ to: '/' })}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">Book Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Book Not Available</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                The book you're looking for (ID: {bookId}) does not exist. Please check the book ID or return to the home page.
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
