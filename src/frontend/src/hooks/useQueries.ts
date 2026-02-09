import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole, BookAsset, SiteAssets, BookMetadata, BlogPost, CharacterNote, NewComing, BookFileType, UserProfile, BookComment, BookRating, PublicUserProfile, ForumThread, ForumReply } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetPublicUserProfile(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserProfile | null>({
    queryKey: ['publicUserProfile', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getPublicUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// Admin Authentication
export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCurrentSessionAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminName, adminPassword }: { adminName: string; adminPassword: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Defensively trim credentials before calling backend
      const trimmedName = adminName.trim();
      const trimmedPassword = adminPassword.trim();
      
      const result = await actor.adminLogin(trimmedName, trimmedPassword);
      if (!result) {
        throw new Error('Invalid admin credentials');
      }
      return result;
    },
    onSuccess: () => {
      // Set cached value immediately
      queryClient.setQueryData(['isAdmin'], true);
      // Also invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Remove legacy session token if it exists
      sessionStorage.removeItem('caffeineAdminToken');
      // Call backend logout
      const result = await actor.adminLogout();
      if (!result) {
        throw new Error('Failed to sign out');
      }
      return result;
    },
    onSuccess: () => {
      // Set cached value immediately to false
      queryClient.setQueryData(['isAdmin'], false);
      // Invalidate to refetch and confirm
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

// Book File Upload
export function useUploadBookFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, file, fileType }: { bookId: string; file: ExternalBlob; fileType: BookFileType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadBookFile(bookId, file, fileType);
    },
    onSuccess: (_, variables) => {
      // Invalidate both book assets and book metadata queries
      queryClient.invalidateQueries({ queryKey: ['bookAssets', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['featuredBooks'] });
    },
  });
}

export function useUploadBookCover() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, image }: { bookId: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadBookCover(bookId, image);
    },
    onSuccess: (_, variables) => {
      // Invalidate both book assets and book metadata queries
      queryClient.invalidateQueries({ queryKey: ['bookAssets', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['featuredBooks'] });
    },
  });
}

export function useUploadLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadLogo(logo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteAssets'] });
    },
  });
}

export function useGetBookAssets(bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BookAsset | null>({
    queryKey: ['bookAssets', bookId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBookAssets(bookId);
    },
    enabled: !!actor && !isFetching && !!bookId,
    retry: (failureCount, error: any) => {
      // Don't retry if it's an authorization error
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetSiteAssets() {
  const { actor, isFetching } = useActor();

  return useQuery<SiteAssets | null>({
    queryKey: ['siteAssets'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSiteAssets();
    },
    enabled: !!actor && !isFetching,
  });
}

// Book Metadata Management
export function useGetFeaturedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookMetadata[]>({
    queryKey: ['featuredBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksInFeaturedOrder();
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetBook(bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BookMetadata | null>({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBook(bookId);
    },
    enabled: !!actor && !isFetching && !!bookId,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      summary, 
      genre, 
      sortOrder, 
      coverImage 
    }: { 
      id: string; 
      title: string; 
      summary: string; 
      genre: string; 
      sortOrder: bigint; 
      coverImage: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBook(id, title, summary, genre, sortOrder, coverImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredBooks'] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      summary, 
      genre, 
      sortOrder, 
      coverImage 
    }: { 
      id: string; 
      title: string; 
      summary: string; 
      genre: string; 
      sortOrder: bigint; 
      coverImage: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(id, title, summary, genre, sortOrder, coverImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredBooks'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBook(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredBooks'] });
    },
  });
}

// Blog Posts
export function useGetAllBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetBlogPost(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost | null>({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBlogPost(id);
    },
    enabled: !!actor && !isFetching && !!id,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      file,
      fileType,
      previewImage,
    }: {
      id: string;
      title: string;
      description: string;
      file: ExternalBlob | null;
      fileType: string | null;
      previewImage: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBlogPost(id, title, description, file, fileType as any, previewImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}

// Character Notes
export function useGetAllCharacterNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<CharacterNote[]>({
    queryKey: ['characterNotes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCharacterNotes();
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetCharacterNote(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<CharacterNote | null>({
    queryKey: ['characterNote', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCharacterNote(id);
    },
    enabled: !!actor && !isFetching && !!id,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddCharacterNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      bookId,
      title,
      description,
      file,
      fileType,
      previewImage,
    }: {
      id: string;
      bookId: string;
      title: string;
      description: string;
      file: ExternalBlob | null;
      fileType: string | null;
      previewImage: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCharacterNote(id, bookId, title, description, file, fileType as any, previewImage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterNotes'] });
    },
  });
}

export function useDeleteCharacterNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCharacterNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characterNotes'] });
    },
  });
}

// New Comings
export function useGetAllNewComings() {
  const { actor, isFetching } = useActor();

  return useQuery<NewComing[]>({
    queryKey: ['newComings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNewComings();
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetNewComing(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<NewComing | null>({
    queryKey: ['newComing', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNewComing(id);
    },
    enabled: !!actor && !isFetching && !!id,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddNewComing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      image,
      releaseDate,
      sortOrder,
    }: {
      id: string;
      title: string;
      description: string;
      image: ExternalBlob;
      releaseDate: string | null;
      sortOrder: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNewComing(id, title, description, image, releaseDate, sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newComings'] });
    },
  });
}

export function useUpdateNewComing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      image,
      releaseDate,
      sortOrder,
    }: {
      id: string;
      title: string;
      description: string;
      image: ExternalBlob;
      releaseDate: string | null;
      sortOrder: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNewComing(id, title, description, image, releaseDate, sortOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newComings'] });
    },
  });
}

export function useDeleteNewComing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNewComing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newComings'] });
    },
  });
}

// Book Comments
export function useGetBookComments(bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BookComment[]>({
    queryKey: ['bookComments', bookId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookComments(bookId);
    },
    enabled: !!actor && !isFetching && !!bookId,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddBookComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, comment }: { bookId: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBookComment(bookId, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookComments', variables.bookId] });
    },
  });
}

export function useLikeComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookComments'] });
    },
  });
}

// Book Ratings
export function useGetBookRatings(bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<BookRating[]>({
    queryKey: ['bookRatings', bookId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookRatings(bookId);
    },
    enabled: !!actor && !isFetching && !!bookId,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetBookAverageRating(bookId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number | null>({
    queryKey: ['bookAverageRating', bookId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBookAverageRating(bookId);
    },
    enabled: !!actor && !isFetching && !!bookId,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAddBookRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, rating }: { bookId: string; rating: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBookRating(bookId, rating);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookRatings', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['bookAverageRating', variables.bookId] });
    },
  });
}

// Forum
export function useGetAllThreads() {
  const { actor, isFetching } = useActor();

  return useQuery<ForumThread[]>({
    queryKey: ['forumThreads'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllThreadsWithReplies();
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useGetThread(threadId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ForumThread | null>({
    queryKey: ['forumThread', threadId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getThreadWithReplies(threadId);
    },
    enabled: !!actor && !isFetching && !!threadId,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('complete your profile')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createThread(title, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumThreads'] });
    },
  });
}

export function useReplyToThread() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, message }: { threadId: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.replyToThread(threadId, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumThreads'] });
      queryClient.invalidateQueries({ queryKey: ['forumThread', variables.threadId] });
    },
  });
}
