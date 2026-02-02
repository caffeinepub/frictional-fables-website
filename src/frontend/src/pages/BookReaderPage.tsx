import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, BookOpen, Loader2 } from 'lucide-react';
import { useGetBookAssets } from '../hooks/useQueries';
import { useEffect, useState } from 'react';

export default function BookReaderPage() {
  const { bookId } = useParams({ from: '/book/$bookId' });
  const navigate = useNavigate();
  const { data: bookAsset, isLoading } = useGetBookAssets(bookId);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [viewerUrl, setViewerUrl] = useState<string>('');

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
        // Encode the URL to ensure it works properly
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

  const hasFile = bookAsset?.bookFile && fileUrl;

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
        ) : hasFile ? (
          <div className="bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="bg-muted px-6 py-4 border-b">
              <h1 className="text-2xl font-serif font-bold">Book {bookId}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {fileType === 'pdf' ? 'PDF Document' : 'Word Document'}
              </p>
            </div>
            <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
              {(fileType === 'pdf' || fileType === 'word') && viewerUrl ? (
                <iframe
                  src={fileType === 'pdf' ? `${viewerUrl}#toolbar=1` : viewerUrl}
                  className="w-full h-full border-0"
                  title={`Book ${bookId}`}
                  allow="autoplay"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Unsupported file format</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-serif text-center">Book Reader</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Book Not Available</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                The book you're looking for (ID: {bookId}) is not currently available. Books will be added soon!
              </p>
              <Button onClick={() => navigate({ to: '/' })}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
