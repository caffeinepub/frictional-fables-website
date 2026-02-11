import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Clock, MessageCircle } from 'lucide-react';
import { useGetAllThreads, useCreateThread, useReplyToThread, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import UserAvatar from '../components/UserAvatar';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { toast } from 'sonner';
import { formatRelativeTime } from '../utils/time';

export default function ForumPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: threads = [], isLoading: threadsLoading } = useGetAllThreads();
  const createThreadMutation = useCreateThread();
  const replyToThreadMutation = useReplyToThread();

  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadMessage, setNewThreadMessage] = useState('');
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');

  const isAuthenticated = !!identity;
  const hasCompleteProfile = userProfile && userProfile.name && userProfile.email;
  const canPost = isAuthenticated && hasCompleteProfile;

  const handleCreateThread = async () => {
    // Check authentication and profile completion
    if (!isAuthenticated || !hasCompleteProfile) {
      setLoginModalMessage('Please login and complete your profile to post or reply');
      setShowLoginModal(true);
      return;
    }

    if (!newThreadTitle.trim() || !newThreadMessage.trim()) {
      toast.error('Please provide both a title and message for your thread');
      return;
    }

    try {
      await createThreadMutation.mutateAsync({
        title: newThreadTitle.trim(),
        message: newThreadMessage.trim(),
      });
      setNewThreadTitle('');
      setNewThreadMessage('');
      toast.success('Thread created successfully!');
    } catch (error: any) {
      console.error('Error creating thread:', error);
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete Profile')) {
        setLoginModalMessage('Please login and complete your profile to post or reply');
        setShowLoginModal(true);
      } else {
        toast.error('Failed to create thread. Please try again.');
      }
    }
  };

  const handleReply = async (threadId: string) => {
    // Check authentication and profile completion
    if (!isAuthenticated || !hasCompleteProfile) {
      setLoginModalMessage('Please login and complete your profile to post or reply');
      setShowLoginModal(true);
      return;
    }

    const message = replyMessages[threadId]?.trim();
    if (!message) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await replyToThreadMutation.mutateAsync({
        threadId,
        message,
      });
      setReplyMessages({ ...replyMessages, [threadId]: '' });
      toast.success('Reply posted successfully!');
    } catch (error: any) {
      console.error('Error posting reply:', error);
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete Profile')) {
        setLoginModalMessage('Please login and complete your profile to post or reply');
        setShowLoginModal(true);
      } else {
        toast.error('Failed to post reply. Please try again.');
      }
    }
  };

  return (
    <div
      className="min-h-screen py-16 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(250, 245, 235, 0.95), rgba(250, 245, 235, 0.95)), url(/assets/generated/forum-background.dim_1200x800.png)`,
      }}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 text-primary">Discussion Forum</h1>
          <p className="text-muted-foreground">Connect with fellow readers and share your thoughts</p>
        </div>

        {/* Create New Thread Section */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <MessageSquare className="h-5 w-5" />
              Start a New Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canPost && profileFetched && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-1">Login Required</p>
                <p>Please login and complete your profile to create threads and post replies.</p>
              </div>
            )}
            <div>
              <Input
                placeholder="Thread title..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="font-serif"
                disabled={createThreadMutation.isPending || !canPost}
              />
            </div>
            <div>
              <Textarea
                placeholder="Share your thoughts with the community..."
                value={newThreadMessage}
                onChange={(e) => setNewThreadMessage(e.target.value)}
                rows={4}
                className="font-serif resize-none"
                disabled={createThreadMutation.isPending || !canPost}
              />
            </div>
            <Button
              onClick={handleCreateThread}
              disabled={createThreadMutation.isPending || !newThreadTitle.trim() || !newThreadMessage.trim() || !canPost}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {createThreadMutation.isPending ? 'Posting...' : 'Post Thread'}
            </Button>
          </CardContent>
        </Card>

        {/* Threads List */}
        <div className="space-y-6">
          {threadsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading discussions...</p>
              </CardContent>
            </Card>
          ) : threads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No discussions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => (
              <Card key={thread.threadId} className="border-2 border-border/50 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={thread.authorName}
                      profilePicture={thread.authorAvatar}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-serif font-bold text-primary mb-1">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{thread.authorName}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(thread.timestamp)}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {Number(thread.replyCount)} {Number(thread.replyCount) === 1 ? 'reply' : 'replies'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground font-serif whitespace-pre-wrap leading-relaxed">
                    {thread.message}
                  </p>

                  {/* Replies Section */}
                  {thread.replies && thread.replies.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Replies
                      </h4>
                      {thread.replies.map((reply) => (
                        <div
                          key={reply.replyId}
                          className="flex gap-3 pl-4 border-l-2 border-primary/30"
                        >
                          <UserAvatar
                            name={reply.authorName}
                            profilePicture={reply.authorAvatar}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{reply.authorName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(reply.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-serif whitespace-pre-wrap">
                              {reply.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    {!canPost && profileFetched && (
                      <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground mb-3">
                        <p>Login and complete your profile to reply</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyMessages[thread.threadId] || ''}
                        onChange={(e) =>
                          setReplyMessages({ ...replyMessages, [thread.threadId]: e.target.value })
                        }
                        rows={2}
                        className="font-serif resize-none flex-1"
                        disabled={replyToThreadMutation.isPending || !canPost}
                      />
                      <Button
                        onClick={() => handleReply(thread.threadId)}
                        disabled={
                          replyToThreadMutation.isPending ||
                          !replyMessages[thread.threadId]?.trim() ||
                          !canPost
                        }
                        size="sm"
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <LoginRequiredModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        customMessage={loginModalMessage}
      />
    </div>
  );
}
