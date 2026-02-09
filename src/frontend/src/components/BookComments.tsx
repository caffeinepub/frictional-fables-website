import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send, Heart } from 'lucide-react';
import { useGetBookComments, useAddBookComment, useLikeComment } from '../hooks/useQueries';
import UserAvatar from './UserAvatar';
import { toast } from 'sonner';

interface BookCommentsProps {
  bookId: string;
}

export default function BookComments({ bookId }: BookCommentsProps) {
  const [commentText, setCommentText] = useState('');
  const { data: comments, isLoading } = useGetBookComments(bookId);
  const addComment = useAddBookComment();
  const likeComment = useLikeComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addComment.mutateAsync({ bookId, comment: commentText.trim() });
      setCommentText('');
      toast.success('Comment added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeComment.mutateAsync(commentId);
      toast.success('Comment liked!');
    } catch (error: any) {
      if (error.message?.includes('already liked')) {
        toast.error('You have already liked this comment');
      } else {
        toast.error(error.message || 'Failed to like comment');
      }
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-2 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Reader Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this book..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={addComment.isPending}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={addComment.isPending || !commentText.trim()}
              className="gap-2"
            >
              {addComment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.commentId}
                className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <UserAvatar 
                  name={comment.userName} 
                  profilePicture={undefined}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words mb-2">
                    {comment.comment}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => handleLike(comment.commentId)}
                      disabled={likeComment.isPending}
                    >
                      <Heart className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        {Number(comment.likeCount)}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
