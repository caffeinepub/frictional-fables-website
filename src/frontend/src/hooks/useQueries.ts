import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole, BookAsset, SiteAssets, BookMetadata, BlogPost, CharacterNote, NewComing, BookFileType } from '../backend';
import { ExternalBlob } from '../backend';

// User Role
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return 'guest' as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['bookAssets', variables.bookId] });
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
      queryClient.invalidateQueries({ queryKey: ['bookAssets', variables.bookId] });
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
