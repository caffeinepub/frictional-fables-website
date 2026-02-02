import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ForumPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen py-16 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/forum-illustration.dim_600x400.jpg)`,
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Discussion Forum</h1>
          <p className="text-muted-foreground">Connect with fellow readers and share your thoughts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent className="py-20 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-2">Forum Under Construction</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              We're building an amazing community space where you can discuss books, share insights, and connect with fellow readers. Check back soon!
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
