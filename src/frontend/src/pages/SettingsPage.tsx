import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useIsCallerAdmin, 
  useUploadBookFile,
  useUploadBookCover,
  useUploadLogo,
  useGetSiteAssets,
  useGetFeaturedBooks,
  useAddBook,
  useUpdateBook,
  useDeleteBook,
  useGetAllBlogPosts,
  useAddBlogPost,
  useDeleteBlogPost,
  useGetAllCharacterNotes,
  useAddCharacterNote,
  useDeleteCharacterNote,
  useGetAllNewComings,
  useAddNewComing,
  useUpdateNewComing,
  useDeleteNewComing,
} from '../hooks/useQueries';
import { ExternalBlob, BookMetadata, BlogPost, CharacterNote, NewComing, BookFileType } from '../backend';
import { toast } from 'sonner';
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  X, 
  BookOpen,
  Settings as SettingsIcon,
  AlertCircle,
  Save,
  Edit,
  Trash2,
  Tag,
  Video,
  File,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: siteAssets } = useGetSiteAssets();
  const { data: books, isLoading: booksLoading } = useGetFeaturedBooks();
  const { data: blogPosts, isLoading: blogsLoading } = useGetAllBlogPosts();
  const { data: characterNotes, isLoading: notesLoading } = useGetAllCharacterNotes();
  const { data: newComings, isLoading: comingsLoading } = useGetAllNewComings();

  const uploadBookFileMutation = useUploadBookFile();
  const uploadBookCoverMutation = useUploadBookCover();
  const uploadLogoMutation = useUploadLogo();
  const addBookMutation = useAddBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const addBlogMutation = useAddBlogPost();
  const deleteBlogMutation = useDeleteBlogPost();
  const addCharacterNoteMutation = useAddCharacterNote();
  const deleteCharacterNoteMutation = useDeleteCharacterNote();
  const addNewComingMutation = useAddNewComing();
  const updateNewComingMutation = useUpdateNewComing();
  const deleteNewComingMutation = useDeleteNewComing();

  // Books panel state
  const [bookId, setBookId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [genre, setGenre] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState(0);
  const [bookFileProgress, setBookFileProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  // Blog panel state
  const [blogId, setBlogId] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogDescription, setBlogDescription] = useState('');
  const [blogFile, setBlogFile] = useState<File | null>(null);
  const [blogPreviewImage, setBlogPreviewImage] = useState<File | null>(null);
  const [blogPreview, setBlogPreview] = useState<string | null>(null);
  const [blogProgress, setBlogProgress] = useState(0);
  const [deleteBlogDialogOpen, setDeleteBlogDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  // Character Notes panel state
  const [noteId, setNoteId] = useState('');
  const [noteBookId, setNoteBookId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [notePreviewImage, setNotePreviewImage] = useState<File | null>(null);
  const [notePreview, setNotePreview] = useState<string | null>(null);
  const [noteProgress, setNoteProgress] = useState(0);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // New Comings panel state
  const [comingId, setComingId] = useState('');
  const [comingTitle, setComingTitle] = useState('');
  const [comingDescription, setComingDescription] = useState('');
  const [comingReleaseDate, setComingReleaseDate] = useState('');
  const [comingSortOrder, setComingSortOrder] = useState('0');
  const [comingImage, setComingImage] = useState<File | null>(null);
  const [comingPreview, setComingPreview] = useState<string | null>(null);
  const [comingProgress, setComingProgress] = useState(0);
  const [isEditComingMode, setIsEditComingMode] = useState(false);
  const [editingComingId, setEditingComingId] = useState<string | null>(null);
  const [deleteComingDialogOpen, setDeleteComingDialogOpen] = useState(false);
  const [comingToDelete, setComingToDelete] = useState<string | null>(null);

  // Site assets state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Drag and drop state
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingBookFile, setIsDraggingBookFile] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBlogFile, setIsDraggingBlogFile] = useState(false);
  const [isDraggingNoteFile, setIsDraggingNoteFile] = useState(false);
  const [isDraggingComingImage, setIsDraggingComingImage] = useState(false);

  // Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const blogFileInputRef = useRef<HTMLInputElement>(null);
  const blogPreviewInputRef = useRef<HTMLInputElement>(null);
  const noteFileInputRef = useRef<HTMLInputElement>(null);
  const notePreviewInputRef = useRef<HTMLInputElement>(null);
  const comingImageInputRef = useRef<HTMLInputElement>(null);

  // Handle file preview
  const handleFilePreview = (file: File | null, setPreview: (url: string | null) => void) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  useEffect(() => {
    handleFilePreview(coverFile, setCoverPreview);
  }, [coverFile]);

  useEffect(() => {
    handleFilePreview(logoFile, setLogoPreview);
  }, [logoFile]);

  useEffect(() => {
    handleFilePreview(blogPreviewImage || blogFile, setBlogPreview);
  }, [blogPreviewImage, blogFile]);

  useEffect(() => {
    handleFilePreview(notePreviewImage || noteFile, setNotePreview);
  }, [notePreviewImage, noteFile]);

  useEffect(() => {
    handleFilePreview(comingImage, setComingPreview);
  }, [comingImage]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, setDragging: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragging: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    setFile: (file: File | null) => void,
    setDragging: (val: boolean) => void,
    accept: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const isValid = validateFileType(file, accept);
      if (isValid) {
        setFile(file);
      } else {
        toast.error(`Please drop a valid file (${accept})`);
      }
    }
  };

  const validateFileType = (file: File, accept: string): boolean => {
    if (accept === 'image/*') return file.type.startsWith('image/');
    if (accept === 'video/*') return file.type.startsWith('video/');
    if (accept === '.pdf') return file.type === 'application/pdf';
    if (accept === '.doc,.docx') {
      return file.type === 'application/msword' || 
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (accept === '.pdf,.doc,.docx') {
      return file.type === 'application/pdf' ||
             file.type === 'application/msword' ||
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    return true;
  };

  const getFileTypeFromFile = (file: File): BookFileType => {
    if (file.type === 'application/pdf') return BookFileType.pdf;
    if (file.type === 'application/msword') return BookFileType.wordDoc;
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return BookFileType.wordDocx;
    return BookFileType.pdf;
  };

  const getBlogFileTypeFromFile = (file: File): string | null => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return null;
  };

  const getNoteFileTypeFromFile = (file: File): string | null => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return null;
  };

  const resetBookForm = () => {
    setBookId('');
    setTitle('');
    setSummary('');
    setGenre('');
    setSortOrder('0');
    setCoverFile(null);
    setBookFile(null);
    setCoverPreview(null);
    setCoverProgress(0);
    setBookFileProgress(0);
    setIsEditMode(false);
    setEditingBookId(null);
  };

  const resetBlogForm = () => {
    setBlogId('');
    setBlogTitle('');
    setBlogDescription('');
    setBlogFile(null);
    setBlogPreviewImage(null);
    setBlogPreview(null);
    setBlogProgress(0);
  };

  const resetNoteForm = () => {
    setNoteId('');
    setNoteBookId('');
    setNoteTitle('');
    setNoteDescription('');
    setNoteFile(null);
    setNotePreviewImage(null);
    setNotePreview(null);
    setNoteProgress(0);
  };

  const resetComingForm = () => {
    setComingId('');
    setComingTitle('');
    setComingDescription('');
    setComingReleaseDate('');
    setComingSortOrder('0');
    setComingImage(null);
    setComingPreview(null);
    setComingProgress(0);
    setIsEditComingMode(false);
    setEditingComingId(null);
  };

  const loadBookForEdit = (book: BookMetadata) => {
    setBookId(book.id);
    setTitle(book.title);
    setSummary(book.summary);
    setGenre(book.genre);
    setSortOrder(book.sortOrder.toString());
    setCoverPreview(book.coverImage.getDirectURL());
    setIsEditMode(true);
    setEditingBookId(book.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadComingForEdit = (coming: NewComing) => {
    setComingId(coming.id);
    setComingTitle(coming.title);
    setComingDescription(coming.description);
    setComingReleaseDate(coming.releaseDate || '');
    setComingSortOrder(coming.sortOrder.toString());
    setComingPreview(coming.image.getDirectURL());
    setIsEditComingMode(true);
    setEditingComingId(coming.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitBook = async () => {
    if (!bookId.trim()) {
      toast.error('Please enter a book ID');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a book title');
      return;
    }
    if (!summary.trim()) {
      toast.error('Please enter a book summary');
      return;
    }
    if (!genre.trim()) {
      toast.error('Please enter a genre');
      return;
    }

    try {
      let coverBlob: ExternalBlob;

      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        coverBlob = ExternalBlob.fromBytes(coverBytes).withUploadProgress((percentage) => {
          setCoverProgress(percentage);
        });
      } else if (isEditMode && editingBookId) {
        const existingBook = books?.find(b => b.id === editingBookId);
        if (existingBook) {
          coverBlob = existingBook.coverImage;
        } else {
          toast.error('Please upload a cover image');
          return;
        }
      } else {
        toast.error('Please upload a cover image');
        return;
      }

      const sortOrderBigInt = BigInt(parseInt(sortOrder) || 0);
      
      if (isEditMode) {
        await updateBookMutation.mutateAsync({
          id: bookId,
          title,
          summary,
          genre,
          sortOrder: sortOrderBigInt,
          coverImage: coverBlob,
        });
        toast.success('Book updated successfully!');
      } else {
        await addBookMutation.mutateAsync({
          id: bookId,
          title,
          summary,
          genre,
          sortOrder: sortOrderBigInt,
          coverImage: coverBlob,
        });
        toast.success('Book added successfully!');
      }

      if (bookFile) {
        const fileBytes = new Uint8Array(await bookFile.arrayBuffer());
        const fileBlob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
          setBookFileProgress(percentage);
        });
        const detectedFileType = getFileTypeFromFile(bookFile);
        await uploadBookFileMutation.mutateAsync({
          bookId,
          file: fileBlob,
          fileType: detectedFileType,
        });
        toast.success('Book file uploaded successfully!');
      }

      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        const coverBlobForAssets = ExternalBlob.fromBytes(coverBytes);
        await uploadBookCoverMutation.mutateAsync({
          bookId,
          image: coverBlobForAssets,
        });
      }

      resetBookForm();
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book');
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      await deleteBookMutation.mutateAsync(bookToDelete);
      toast.success('Book deleted successfully!');
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      if (editingBookId === bookToDelete) {
        resetBookForm();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const openDeleteDialog = (bookId: string) => {
    setBookToDelete(bookId);
    setDeleteDialogOpen(true);
  };

  const handleSubmitBlog = async () => {
    if (!blogId.trim()) {
      toast.error('Please enter a blog ID');
      return;
    }
    if (!blogTitle.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    if (!blogDescription.trim()) {
      toast.error('Please enter a blog description');
      return;
    }

    try {
      let fileBlob: ExternalBlob | null = null;
      let detectedFileType: string | null = null;
      let previewBlob: ExternalBlob | null = null;

      if (blogFile) {
        const fileBytes = new Uint8Array(await blogFile.arrayBuffer());
        fileBlob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
          setBlogProgress(percentage);
        });
        detectedFileType = getBlogFileTypeFromFile(blogFile);
      }

      if (blogPreviewImage) {
        const previewBytes = new Uint8Array(await blogPreviewImage.arrayBuffer());
        previewBlob = ExternalBlob.fromBytes(previewBytes);
      }

      await addBlogMutation.mutateAsync({
        id: blogId,
        title: blogTitle,
        description: blogDescription,
        file: fileBlob,
        fileType: detectedFileType,
        previewImage: previewBlob,
      });

      toast.success('Blog post added successfully!');
      resetBlogForm();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog post');
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;

    try {
      await deleteBlogMutation.mutateAsync(blogToDelete);
      toast.success('Blog post deleted successfully!');
      setDeleteBlogDialogOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleSubmitNote = async () => {
    if (!noteId.trim()) {
      toast.error('Please enter a note ID');
      return;
    }
    if (!noteBookId.trim()) {
      toast.error('Please select a book');
      return;
    }
    if (!noteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }
    if (!noteDescription.trim()) {
      toast.error('Please enter a note description');
      return;
    }

    try {
      let fileBlob: ExternalBlob | null = null;
      let detectedFileType: string | null = null;
      let previewBlob: ExternalBlob | null = null;

      if (noteFile) {
        const fileBytes = new Uint8Array(await noteFile.arrayBuffer());
        fileBlob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
          setNoteProgress(percentage);
        });
        detectedFileType = getNoteFileTypeFromFile(noteFile);
      }

      if (notePreviewImage) {
        const previewBytes = new Uint8Array(await notePreviewImage.arrayBuffer());
        previewBlob = ExternalBlob.fromBytes(previewBytes);
      }

      await addCharacterNoteMutation.mutateAsync({
        id: noteId,
        bookId: noteBookId,
        title: noteTitle,
        description: noteDescription,
        file: fileBlob,
        fileType: detectedFileType,
        previewImage: previewBlob,
      });

      toast.success('Character note added successfully!');
      resetNoteForm();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save character note');
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteCharacterNoteMutation.mutateAsync(noteToDelete);
      toast.success('Character note deleted successfully!');
      setDeleteNoteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete character note');
    }
  };

  const handleSubmitComing = async () => {
    if (!comingId.trim()) {
      toast.error('Please enter a coming ID');
      return;
    }
    if (!comingTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!comingDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      let imageBlob: ExternalBlob;

      if (comingImage) {
        const imageBytes = new Uint8Array(await comingImage.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(imageBytes).withUploadProgress((percentage) => {
          setComingProgress(percentage);
        });
      } else if (isEditComingMode && editingComingId) {
        const existingComing = newComings?.find(c => c.id === editingComingId);
        if (existingComing) {
          imageBlob = existingComing.image;
        } else {
          toast.error('Please upload an image');
          return;
        }
      } else {
        toast.error('Please upload an image');
        return;
      }

      const sortOrderBigInt = BigInt(parseInt(comingSortOrder) || 0);
      const releaseDate = comingReleaseDate.trim() || null;

      if (isEditComingMode) {
        await updateNewComingMutation.mutateAsync({
          id: comingId,
          title: comingTitle,
          description: comingDescription,
          image: imageBlob,
          releaseDate,
          sortOrder: sortOrderBigInt,
        });
        toast.success('New coming updated successfully!');
      } else {
        await addNewComingMutation.mutateAsync({
          id: comingId,
          title: comingTitle,
          description: comingDescription,
          image: imageBlob,
          releaseDate,
          sortOrder: sortOrderBigInt,
        });
        toast.success('New coming added successfully!');
      }

      resetComingForm();
    } catch (error) {
      console.error('Error saving new coming:', error);
      toast.error('Failed to save new coming');
    }
  };

  const handleDeleteComing = async () => {
    if (!comingToDelete) return;

    try {
      await deleteNewComingMutation.mutateAsync(comingToDelete);
      toast.success('New coming deleted successfully!');
      setDeleteComingDialogOpen(false);
      setComingToDelete(null);
      if (editingComingId === comingToDelete) {
        resetComingForm();
      }
    } catch (error) {
      console.error('Error deleting new coming:', error);
      toast.error('Failed to delete new coming');
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo');
      return;
    }

    try {
      const logoBytes = new Uint8Array(await logoFile.arrayBuffer());
      const logoBlob = ExternalBlob.fromBytes(logoBytes).withUploadProgress((percentage) => {
        setLogoProgress(percentage);
      });

      await uploadLogoMutation.mutateAsync(logoBlob);

      toast.success('Logo uploaded successfully!');
      setLogoFile(null);
      setLogoProgress(0);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
        <Button onClick={() => navigate({ to: '/' })}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2 text-primary">Settings</h1>
          <p className="text-muted-foreground">Manage your content and site configuration</p>
        </div>

        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground/80">
            All changes will be published immediately and reflected across the site.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="books" className="data-[state=active]:bg-background">
              <BookOpen className="h-4 w-4 mr-2" />
              Books
            </TabsTrigger>
            <TabsTrigger value="blogs" className="data-[state=active]:bg-background">
              <FileText className="h-4 w-4 mr-2" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="character-notes" className="data-[state=active]:bg-background">
              <Tag className="h-4 w-4 mr-2" />
              Character Notes
            </TabsTrigger>
            <TabsTrigger value="new-comings" className="data-[state=active]:bg-background">
              <Sparkles className="h-4 w-4 mr-2" />
              New Comings
            </TabsTrigger>
            <TabsTrigger value="site-assets" className="data-[state=active]:bg-background">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Site Assets
            </TabsTrigger>
          </TabsList>

          {/* Books Panel */}
          <TabsContent value="books" className="space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BookOpen className="h-5 w-5" />
                  {isEditMode ? 'Edit Book' : 'Add New Book'}
                </CardTitle>
                <CardDescription>
                  Upload book files (PDF or Word documents), cover images, and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="book-id">Book ID *</Label>
                    <Input
                      id="book-id"
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      placeholder="e.g., book1, my-story"
                      disabled={isEditMode}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isEditMode ? 'Cannot be changed' : 'Unique identifier'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter book title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary *</Label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write a compelling summary..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{summary.length} characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Fantasy, Romance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Display Order *</Label>
                    <Input
                      id="sort-order"
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <Label>Cover Image *</Label>
                    {coverPreview && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-32 h-48 object-cover rounded-lg border-2 border-primary/20"
                        />
                        {coverFile && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => {
                              setCoverFile(null);
                              setCoverPreview(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDraggingCover
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingCover)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingCover)}
                      onDrop={(e) => handleDrop(e, setCoverFile, setIsDraggingCover, 'image/*')}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      />
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {coverFile ? coverFile.name : 'Drop cover or click'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                    </div>
                    {coverProgress > 0 && coverProgress < 100 && (
                      <Progress value={coverProgress} className="h-2" />
                    )}
                  </div>

                  {/* Book File Upload */}
                  <div className="space-y-2">
                    <Label>Book File (PDF or Word) {isEditMode ? '(Optional)' : '*'}</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDraggingBookFile
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingBookFile)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingBookFile)}
                      onDrop={(e) => handleDrop(e, setBookFile, setIsDraggingBookFile, '.pdf,.doc,.docx')}
                      onClick={() => bookFileInputRef.current?.click()}
                    >
                      <input
                        ref={bookFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                      />
                      {bookFile ? (
                        <div className="space-y-2">
                          <FileText className="h-8 w-8 mx-auto text-primary" />
                          <p className="text-sm font-medium">{bookFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(bookFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookFile(null);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Drop file or click</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX</p>
                        </>
                      )}
                    </div>
                    {bookFileProgress > 0 && bookFileProgress < 100 && (
                      <Progress value={bookFileProgress} className="h-2" />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitBook}
                    disabled={addBookMutation.isPending || updateBookMutation.isPending || uploadBookFileMutation.isPending}
                    className="flex-1"
                    size="lg"
                  >
                    {(addBookMutation.isPending || updateBookMutation.isPending || uploadBookFileMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update Book' : 'Add Book'}
                      </>
                    )}
                  </Button>
                  {isEditMode && (
                    <Button onClick={resetBookForm} variant="outline" size="lg">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Books List */}
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-primary">Manage Books</CardTitle>
                <CardDescription>Edit or delete existing books</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {booksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : books && books.length > 0 ? (
                  <div className="space-y-3">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={book.coverImage.getDirectURL()}
                          alt={book.title}
                          className="w-12 h-18 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{book.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {book.summary}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Order: {book.sortOrder.toString()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {book.genre}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => loadBookForEdit(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteDialog(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No books yet. Add your first book above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs Panel */}
          <TabsContent value="blogs" className="space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileText className="h-5 w-5" />
                  Add New Blog Post
                </CardTitle>
                <CardDescription>
                  Upload blog content with PDFs, images, videos, and text descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="blog-id">Blog ID *</Label>
                    <Input
                      id="blog-id"
                      value={blogId}
                      onChange={(e) => setBlogId(e.target.value)}
                      placeholder="e.g., blog1, writing-tips"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title *</Label>
                    <Input
                      id="blog-title"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="Enter blog title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-description">Description *</Label>
                  <Textarea
                    id="blog-description"
                    value={blogDescription}
                    onChange={(e) => setBlogDescription(e.target.value)}
                    placeholder="Write blog content and description..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{blogDescription.length} characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Media File (Optional)</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDraggingBlogFile
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingBlogFile)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingBlogFile)}
                      onDrop={(e) => handleDrop(e, setBlogFile, setIsDraggingBlogFile, 'image/*,video/*,.pdf')}
                      onClick={() => blogFileInputRef.current?.click()}
                    >
                      <input
                        ref={blogFileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        onChange={(e) => setBlogFile(e.target.files?.[0] || null)}
                      />
                      {blogFile ? (
                        <div className="space-y-2">
                          {blogFile.type.startsWith('image/') && <ImageIcon className="h-8 w-8 mx-auto text-primary" />}
                          {blogFile.type.startsWith('video/') && <Video className="h-8 w-8 mx-auto text-primary" />}
                          {blogFile.type === 'application/pdf' && <FileText className="h-8 w-8 mx-auto text-primary" />}
                          <p className="text-sm font-medium">{blogFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(blogFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBlogFile(null);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Drop media or click</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, Image, or Video</p>
                        </>
                      )}
                    </div>
                    {blogProgress > 0 && blogProgress < 100 && (
                      <Progress value={blogProgress} className="h-2" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Image (Optional)</Label>
                    {blogPreview && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={blogPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setBlogPreviewImage(null);
                            setBlogPreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                      onClick={() => blogPreviewInputRef.current?.click()}
                    >
                      <input
                        ref={blogPreviewInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setBlogPreviewImage(e.target.files?.[0] || null)}
                      />
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {blogPreviewImage ? blogPreviewImage.name : 'Click to add preview'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">For non-image files</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitBlog}
                  disabled={addBlogMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {addBlogMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Blog Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Blogs List */}
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-primary">Manage Blog Posts</CardTitle>
                <CardDescription>View and delete existing blog posts</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {blogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : blogPosts && blogPosts.length > 0 ? (
                  <div className="space-y-3">
                    {blogPosts.map((blog) => (
                      <div
                        key={blog.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {blog.previewImage && (
                          <img
                            src={blog.previewImage.getDirectURL()}
                            alt={blog.title}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {blog.description}
                          </p>
                          {blog.fileType && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {blog.fileType}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setBlogToDelete(blog.id);
                            setDeleteBlogDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No blog posts yet. Add your first post above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Character Notes Panel */}
          <TabsContent value="character-notes" className="space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Tag className="h-5 w-5" />
                  Add Character Note
                </CardTitle>
                <CardDescription>
                  Add multimedia notes tied to specific books with PDFs, images, videos, and descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="note-id">Note ID *</Label>
                    <Input
                      id="note-id"
                      value={noteId}
                      onChange={(e) => setNoteId(e.target.value)}
                      placeholder="e.g., note1, character-sketch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note-book-id">Book *</Label>
                    <Select value={noteBookId} onValueChange={setNoteBookId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books?.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-title">Title *</Label>
                  <Input
                    id="note-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-description">Description *</Label>
                  <Textarea
                    id="note-description"
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Write character note description..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{noteDescription.length} characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Media File (Optional)</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDraggingNoteFile
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingNoteFile)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingNoteFile)}
                      onDrop={(e) => handleDrop(e, setNoteFile, setIsDraggingNoteFile, 'image/*,video/*,.pdf')}
                      onClick={() => noteFileInputRef.current?.click()}
                    >
                      <input
                        ref={noteFileInputRef}
                        type="file"
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                      />
                      {noteFile ? (
                        <div className="space-y-2">
                          {noteFile.type.startsWith('image/') && <ImageIcon className="h-8 w-8 mx-auto text-primary" />}
                          {noteFile.type.startsWith('video/') && <Video className="h-8 w-8 mx-auto text-primary" />}
                          {noteFile.type === 'application/pdf' && <FileText className="h-8 w-8 mx-auto text-primary" />}
                          <p className="text-sm font-medium">{noteFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(noteFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNoteFile(null);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Drop media or click</p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, Image, or Video</p>
                        </>
                      )}
                    </div>
                    {noteProgress > 0 && noteProgress < 100 && (
                      <Progress value={noteProgress} className="h-2" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Preview Image (Optional)</Label>
                    {notePreview && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={notePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setNotePreviewImage(null);
                            setNotePreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                      onClick={() => notePreviewInputRef.current?.click()}
                    >
                      <input
                        ref={notePreviewInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setNotePreviewImage(e.target.files?.[0] || null)}
                      />
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {notePreviewImage ? notePreviewImage.name : 'Click to add preview'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">For non-image files</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitNote}
                  disabled={addCharacterNoteMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {addCharacterNoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Character Note
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Notes List */}
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-primary">Manage Character Notes</CardTitle>
                <CardDescription>View and delete existing character notes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {notesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : characterNotes && characterNotes.length > 0 ? (
                  <div className="space-y-3">
                    {characterNotes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {note.previewImage && (
                          <img
                            src={note.previewImage.getDirectURL()}
                            alt={note.title}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{note.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {note.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Book: {note.bookId}
                            </Badge>
                            {note.fileType && (
                              <Badge variant="secondary" className="text-xs">
                                {note.fileType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setNoteToDelete(note.id);
                            setDeleteNoteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No character notes yet. Add your first note above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Comings Panel */}
          <TabsContent value="new-comings" className="space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  {isEditComingMode ? 'Edit New Coming' : 'Add New Coming'}
                </CardTitle>
                <CardDescription>
                  Upload upcoming release images and add text descriptions for future books and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="coming-id">Coming ID *</Label>
                    <Input
                      id="coming-id"
                      value={comingId}
                      onChange={(e) => setComingId(e.target.value)}
                      placeholder="e.g., coming1, new-book"
                      disabled={isEditComingMode}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isEditComingMode ? 'Cannot be changed' : 'Unique identifier'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coming-title">Title *</Label>
                    <Input
                      id="coming-title"
                      value={comingTitle}
                      onChange={(e) => setComingTitle(e.target.value)}
                      placeholder="Enter upcoming release title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coming-description">Description *</Label>
                  <Textarea
                    id="coming-description"
                    value={comingDescription}
                    onChange={(e) => setComingDescription(e.target.value)}
                    placeholder="Describe the upcoming release..."
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">{comingDescription.length} characters</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="coming-release-date">Release Date (Optional)</Label>
                    <Input
                      id="coming-release-date"
                      value={comingReleaseDate}
                      onChange={(e) => setComingReleaseDate(e.target.value)}
                      placeholder="e.g., Coming Spring 2026"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coming-sort-order">Display Order *</Label>
                    <Input
                      id="coming-sort-order"
                      type="number"
                      value={comingSortOrder}
                      onChange={(e) => setComingSortOrder(e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preview Image *</Label>
                  {comingPreview && (
                    <div className="mb-3 relative inline-block">
                      <img
                        src={comingPreview}
                        alt="Coming preview"
                        className="w-48 h-32 object-cover rounded-lg border-2 border-primary/20"
                      />
                      {comingImage && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setComingImage(null);
                            setComingPreview(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                      isDraggingComingImage
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onDragOver={(e) => handleDragOver(e, setIsDraggingComingImage)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingComingImage)}
                    onDrop={(e) => handleDrop(e, setComingImage, setIsDraggingComingImage, 'image/*')}
                    onClick={() => comingImageInputRef.current?.click()}
                  >
                    <input
                      ref={comingImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setComingImage(e.target.files?.[0] || null)}
                    />
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {comingImage ? comingImage.name : 'Drop image or click'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                  </div>
                  {comingProgress > 0 && comingProgress < 100 && (
                    <Progress value={comingProgress} className="h-2" />
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitComing}
                    disabled={addNewComingMutation.isPending || updateNewComingMutation.isPending}
                    className="flex-1"
                    size="lg"
                  >
                    {(addNewComingMutation.isPending || updateNewComingMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditComingMode ? 'Update Coming' : 'Add Coming'}
                      </>
                    )}
                  </Button>
                  {isEditComingMode && (
                    <Button onClick={resetComingForm} variant="outline" size="lg">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing New Comings List */}
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-primary">Manage New Comings</CardTitle>
                <CardDescription>Edit or delete upcoming releases</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {comingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : newComings && newComings.length > 0 ? (
                  <div className="space-y-3">
                    {newComings.map((coming) => (
                      <div
                        key={coming.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={coming.image.getDirectURL()}
                          alt={coming.title}
                          className="w-20 h-14 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{coming.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {coming.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Order: {coming.sortOrder.toString()}
                            </Badge>
                            {coming.releaseDate && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {coming.releaseDate}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => loadComingForEdit(coming)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setComingToDelete(coming.id);
                              setDeleteComingDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No upcoming releases yet. Add your first coming above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Assets Panel */}
          <TabsContent value="site-assets" className="space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <SettingsIcon className="h-5 w-5" />
                  Site Logo
                </CardTitle>
                <CardDescription>
                  Manage the site logo displayed in the header
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {siteAssets?.logo && !logoPreview && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium mb-3">Current Logo:</p>
                    <img
                      src={siteAssets.logo.getDirectURL()}
                      alt="Current logo"
                      className="w-32 h-auto object-contain border rounded-lg p-2 bg-background"
                    />
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDraggingLogo
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onDragOver={(e) => handleDragOver(e, setIsDraggingLogo)}
                  onDragLeave={(e) => handleDragLeave(e, setIsDraggingLogo)}
                  onDrop={(e) => handleDrop(e, setLogoFile, setIsDraggingLogo, 'image/*')}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoPreview ? (
                    <div className="space-y-4">
                      <img
                        src={logoPreview}
                        alt="New logo preview"
                        className="w-32 h-auto object-contain border rounded-lg p-2 bg-background mx-auto"
                      />
                      <p className="font-medium">{logoFile?.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">Drop site logo or click to browse</p>
                      <p className="text-sm text-muted-foreground">PNG recommended (transparent background)</p>
                    </div>
                  )}
                </div>

                {logoProgress > 0 && logoProgress < 100 && (
                  <Progress value={logoProgress} className="h-2" />
                )}

                <Button
                  onClick={handleUploadLogo}
                  disabled={uploadLogoMutation.isPending || !logoFile}
                  className="w-full"
                  size="lg"
                >
                  {uploadLogoMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {siteAssets?.logo ? 'Replace Logo' : 'Upload Logo'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book metadata. The files will remain in storage but won't be displayed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteBlogDialogOpen} onOpenChange={setDeleteBlogDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the blog post and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the character note and all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteComingDialogOpen} onOpenChange={setDeleteComingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete New Coming?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the upcoming release announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
