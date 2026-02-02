import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, BookOpen } from 'lucide-react';

export default function BlogPostPage() {
  const { postId } = useParams({ from: '/blog/$postId' });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate({ to: '/blog' })} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Post Not Available</CardTitle>
          </CardHeader>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Blog Coming Soon</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              The blog post you're looking for (ID: {postId}) is not available yet. We're working on creating great content for you!
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
