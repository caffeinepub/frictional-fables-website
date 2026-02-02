import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetAllBlogPosts } from '../hooks/useQueries';
import { FileText, Loader2, Video, Image as ImageIcon, File } from 'lucide-react';

export default function BlogPage() {
  const navigate = useNavigate();
  const { data: blogPosts, isLoading } = useGetAllBlogPosts();

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    if (fileType === 'pdf') return <FileText className="h-5 w-5" />;
    if (fileType === 'image') return <ImageIcon className="h-5 w-5" />;
    if (fileType === 'video') return <Video className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen">
      <div
        className="py-16 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/assets/generated/blog-header.dim_800x400.jpg)`,
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Fables Blog</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Writing tips, reading recommendations, and literary insights
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : blogPosts && blogPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {post.previewImage ? (
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={post.previewImage.getDirectURL()}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : post.file && post.fileType === 'image' ? (
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={post.file.getDirectURL()}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {getFileIcon(post.fileType || undefined)}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.description}</CardDescription>
                  {post.fileType && (
                    <Badge variant="secondary" className="w-fit mt-2">
                      {post.fileType}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {post.file && post.fileType === 'video' && (
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={post.file.getDirectURL()}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {post.file && post.fileType === 'pdf' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(post.file!.getDirectURL(), '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent className="py-20 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground mb-2">Blog Posts Coming Soon</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                We're preparing insightful articles about writing, reading, and the creative process. Check back soon for literary content and author insights!
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
