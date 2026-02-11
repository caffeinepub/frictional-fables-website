import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetSuggestionsFeed, useCreateSuggestion } from '../hooks/useQueries';
import { Lightbulb, Clock } from 'lucide-react';
import { toast } from 'sonner';
import UserAvatar from '../components/UserAvatar';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { formatRelativeTime } from '../utils/time';

export default function SuggestionsPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: suggestions = [], isLoading: suggestionsLoading } = useGetSuggestionsFeed();
  const createSuggestionMutation = useCreateSuggestion();

  const [content, setContent] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isAuthenticated = !!identity;
  const hasCompleteProfile = userProfile && userProfile.name && userProfile.email;
  const canPost = isAuthenticated && hasCompleteProfile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter your suggestion');
      return;
    }

    if (!isAuthenticated || !hasCompleteProfile) {
      setShowLoginModal(true);
      return;
    }

    try {
      await createSuggestionMutation.mutateAsync(content.trim());
      setContent('');
      toast.success('Thank you for your suggestion!');
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete Profile')) {
        setShowLoginModal(true);
      } else {
        toast.error('Failed to submit suggestion. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
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

        {/* Submit Suggestion Form */}
        <Card className="mb-8">
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
            {!canPost && profileFetched && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground mb-4">
                <p className="font-medium mb-1">Login Required</p>
                <p>Please login and complete your profile to submit suggestions.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suggestion">Your Suggestion</Label>
                <Textarea
                  id="suggestion"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us what you'd like to see..."
                  rows={6}
                  disabled={!canPost || createSuggestionMutation.isPending}
                  className="font-serif"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!canPost || createSuggestionMutation.isPending || !content.trim()}
              >
                {createSuggestionMutation.isPending ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggestions Feed */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Community Suggestions</CardTitle>
            <CardDescription>See what others are suggesting</CardDescription>
          </CardHeader>
          <CardContent>
            {suggestionsLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Loading suggestions...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No suggestions yet</p>
                <p className="text-sm">Be the first to share your ideas!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex gap-3 p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                  >
                    <UserAvatar
                      name={suggestion.authorName}
                      profilePicture={suggestion.authorAvatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.authorName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(suggestion.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-foreground font-serif whitespace-pre-wrap leading-relaxed">
                        {suggestion.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
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

      <LoginRequiredModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        customMessage="Please login and complete your profile to submit suggestions"
      />
    </div>
  );
}
