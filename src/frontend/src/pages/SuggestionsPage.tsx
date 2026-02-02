import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function SuggestionsPage() {
  const { identity } = useInternetIdentity();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter your suggestion');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to submit suggestions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission since backend doesn't support this yet
    setTimeout(() => {
      setContent('');
      setIsSubmitting(false);
      toast.success('Thank you for your suggestion! (Feature coming soon)');
    }, 1000);
  };

  return (
    <div className="min-h-screen py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <img
              src="/assets/generated/suggestions-icon.dim_200x200.jpg"
              alt="Suggestions"
              className="w-16 h-16 rounded-full"
            />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2">Suggestions & Requests</h1>
          <p className="text-muted-foreground">
            Have ideas for new stories, features, or feedback? We'd love to hear from you!
          </p>
        </div>

        {!isAuthenticated && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-center">Please login to submit suggestions</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Share Your Ideas
            </CardTitle>
            <CardDescription>
              Whether it's a book request, feature suggestion, or general feedback, we value your input
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suggestion">Your Suggestion</Label>
                <Textarea
                  id="suggestion"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us what you'd like to see..."
                  rows={8}
                  disabled={!isAuthenticated}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!isAuthenticated || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">What can you suggest?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Book requests or story ideas</li>
              <li>• Feature improvements for the reading experience</li>
              <li>• Topics you'd like to see covered in the blog</li>
              <li>• General feedback about the website</li>
              <li>• Community features you'd like to see</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
