import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { useGetBookRatings, useGetBookAverageRating, useAddBookRating } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

interface BookRatingProps {
  bookId: string;
}

export default function BookRating({ bookId }: BookRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { identity } = useInternetIdentity();
  
  const { data: ratings, isLoading: ratingsLoading } = useGetBookRatings(bookId);
  const { data: averageRating, isLoading: avgLoading } = useGetBookAverageRating(bookId);
  const addRating = useAddBookRating();

  // Check if current user has already rated
  const userRating = ratings?.find(r => r.userId.toString() === identity?.getPrincipal().toString());
  const hasRated = !!userRating;

  useEffect(() => {
    if (userRating) {
      setSelectedRating(Number(userRating.rating));
    }
  }, [userRating]);

  const handleRatingClick = async (rating: number) => {
    if (hasRated) {
      toast.info('You have already rated this book');
      return;
    }

    try {
      // Convert number to bigint for backend
      await addRating.mutateAsync({ bookId, rating: BigInt(rating) });
      setSelectedRating(rating);
      toast.success('Thank you for rating this book!');
    } catch (error: any) {
      if (error.message?.includes('already rated')) {
        toast.error('You have already rated this book');
      } else {
        toast.error(error.message || 'Failed to submit rating');
      }
    }
  };

  const displayRating = hoveredRating || selectedRating;

  return (
    <Card className="border-2 shadow-md">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Star className="h-5 w-5 text-primary fill-primary" />
          Rate This Book
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Rating Display */}
        {avgLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : averageRating !== null && averageRating !== undefined ? (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-primary">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(averageRating)
                        ? 'text-primary fill-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {ratings?.length || 0} {ratings?.length === 1 ? 'rating' : 'ratings'}
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground">No ratings yet</p>
          </div>
        )}

        {/* Rating Input */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3 text-center">
            {hasRated ? 'Your Rating' : 'Rate this book'}
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => !hasRated && setHoveredRating(star)}
                onMouseLeave={() => !hasRated && setHoveredRating(0)}
                disabled={hasRated || addRating.isPending}
                className={`transition-all ${
                  hasRated ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                }`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= displayRating
                      ? 'text-primary fill-primary'
                      : 'text-muted-foreground hover:text-primary/50'
                  } ${hasRated ? 'opacity-70' : ''}`}
                />
              </button>
            ))}
          </div>
          {hasRated && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              You rated this book {selectedRating} {selectedRating === 1 ? 'star' : 'stars'}
            </p>
          )}
          {addRating.isPending && (
            <div className="flex justify-center mt-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
