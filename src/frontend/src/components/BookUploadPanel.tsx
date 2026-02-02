import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { 
  useGetFeaturedBooks, 
  useAddBook, 
  useUpdateBook, 
  useDeleteBook,
  useUploadBookFile,
  useUploadBookCover,
} from '../hooks/useQueries';
import { ExternalBlob, BookMetadata, BookFileType } from '../backend';
import { toast } from 'sonner';
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  BookOpen,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export default function BookUploadPanel() {
  const { data: books, isLoading: booksLoading } = useGetFeaturedBooks();
  const addBookMutation = useAddBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const uploadFileMutation = useUploadBookFile();
  const uploadCoverMutation = useUploadBookCover();

  // Form state
  const [bookId, setBookId] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [genre, setGenre] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  // Drag and drop state
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle cover preview
  useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(coverFile);
    } else {
      setCoverPreview(null);
    }
  }, [coverFile]);

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
      if (accept === '.pdf,.doc,.docx') {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (validTypes.includes(file.type)) {
          setFile(file);
        } else {
          toast.error('Please drop a valid PDF or Word document');
        }
      } else if (accept === 'image/*' && file.type.startsWith('image/')) {
        setFile(file);
      } else {
        toast.error(`Please drop a valid ${accept === 'image/*' ? 'image' : 'document'} file`);
      }
    }
  };

  const getFileTypeFromFile = (file: File): BookFileType => {
    if (file.type === 'application/pdf') return BookFileType.pdf;
    if (file.type === 'application/msword') return BookFileType.wordDoc;
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return BookFileType.wordDocx;
    return BookFileType.pdf;
  };

  const resetForm = () => {
    setBookId('');
    setTitle('');
    setSummary('');
    setGenre('');
    setSortOrder('0');
    setCoverFile(null);
    setBookFile(null);
    setCoverPreview(null);
    setCoverProgress(0);
    setFileProgress(0);
    setIsEditMode(false);
    setEditingBookId(null);
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

  const handleSubmit = async () => {
    // Validation
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

      // Handle cover image
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

      // Add or update book metadata
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

      // Upload book file if provided
      if (bookFile) {
        const fileBytes = new Uint8Array(await bookFile.arrayBuffer());
        const fileBlob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
          setFileProgress(percentage);
        });
        const detectedFileType = getFileTypeFromFile(bookFile);
        await uploadFileMutation.mutateAsync({
          bookId,
          file: fileBlob,
          fileType: detectedFileType,
        });
        toast.success('Book file uploaded successfully!');
      }

      // Upload cover to assets if it's a new file
      if (coverFile) {
        const coverBytes = new Uint8Array(await coverFile.arrayBuffer());
        const coverBlobForAssets = ExternalBlob.fromBytes(coverBytes);
        await uploadCoverMutation.mutateAsync({
          bookId,
          image: coverBlobForAssets,
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book');
    }
  };

  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      await deleteBookMutation.mutateAsync(bookToDelete);
      toast.success('Book deleted successfully!');
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      if (editingBookId === bookToDelete) {
        resetForm();
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

  return (
    <div className="space-y-6">
      {/* Book Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isEditMode ? 'Edit Book' : 'Add New Book'}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update book metadata and assets. Changes will be reflected immediately.'
              : 'Create a new book with metadata and upload PDF/Word document and cover image.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Book ID */}
          <div className="space-y-2">
            <Label htmlFor="book-id">Book ID *</Label>
            <Input
              id="book-id"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              placeholder="e.g., book1, book2, my-story"
              disabled={isEditMode}
            />
            <p className="text-xs text-muted-foreground">
              {isEditMode 
                ? 'Book ID cannot be changed after creation'
                : 'Use a unique identifier (letters, numbers, hyphens)'}
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter book title"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a compelling summary that will appear on the homepage..."
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {summary.length} characters
            </p>
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre *</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Fantasy, Romance, Mystery"
            />
            <p className="text-xs text-muted-foreground">
              Enter genre tags separated by commas
            </p>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="sort-order">Sort Order *</Label>
            <Input
              id="sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the Featured Books section
            </p>
          </div>

          <Separator />

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label>Cover Image *</Label>
            {coverPreview && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-48 h-auto rounded-lg border"
                  />
                  {coverFile && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDraggingCover
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
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
              {coverFile ? (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{coverFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(coverFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">
                    {isEditMode ? 'Upload new cover or keep existing' : 'Drag and drop cover image here'}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                </div>
              )}
            </div>
            {coverProgress > 0 && coverProgress < 100 && (
              <div className="space-y-2">
                <Progress value={coverProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading cover... {coverProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Book File Upload */}
          <div className="space-y-2">
            <Label>Book File (PDF or Word) {isEditMode ? '(Optional)' : '*'}</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDraggingFile
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={(e) => handleDragOver(e, setIsDraggingFile)}
              onDragLeave={(e) => handleDragLeave(e, setIsDraggingFile)}
              onDrop={(e) => handleDrop(e, setBookFile, setIsDraggingFile, '.pdf,.doc,.docx')}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setBookFile(e.target.files?.[0] || null)}
              />
              {bookFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-medium">{bookFile.name}</p>
                  <p className="text-sm text-muted-foreground">
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
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">
                    {isEditMode ? 'Upload new file or keep existing' : 'Drag and drop book file here'}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX</p>
                </div>
              )}
            </div>
            {fileProgress > 0 && fileProgress < 100 && (
              <div className="space-y-2">
                <Progress value={fileProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading file... {fileProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={addBookMutation.isPending || updateBookMutation.isPending || uploadFileMutation.isPending}
              className="flex-1"
              size="lg"
            >
              {(addBookMutation.isPending || updateBookMutation.isPending || uploadFileMutation.isPending) ? (
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
              <Button
                onClick={resetForm}
                variant="outline"
                size="lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      {(title || summary || coverPreview) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <CardDescription>
              How this book will appear in the Featured Books section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm mx-auto">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt={title || 'Book cover'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="font-serif">
                    {title || 'Book Title'}
                  </CardTitle>
                  <CardDescription>
                    {summary || 'Book summary will appear here...'}
                  </CardDescription>
                  {genre && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {genre.split(',').map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Books List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Manage Books
          </CardTitle>
          <CardDescription>
            Edit, reorder, or delete existing books
          </CardDescription>
        </CardHeader>
        <CardContent>
          {booksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : books && books.length > 0 ? (
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={book.coverImage.getDirectURL()}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Order: {book.sortOrder.toString()}
                      </Badge>
                      {book.genre && (
                        <Badge variant="secondary" className="text-xs">
                          {book.genre}
                        </Badge>
                      )}
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
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No books yet. Add your first book above!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book metadata. The files will remain in storage but won't be displayed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
