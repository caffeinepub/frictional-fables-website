import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useIsAdmin,
  useAdminLogout,
  useUploadBookFile,
  useUploadBookCover,
  useUploadLogo,
  useGetSiteAssets,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob, BookFileType } from '../backend';
import { toast } from 'sonner';
import { Loader2, Upload, Image as ImageIcon, Settings, FileText, X, AlertCircle, BookPlus, LogOut } from 'lucide-react';
import BookUploadPanel from '../components/BookUploadPanel';
import AdminSignInPanel from '../components/AdminSignInPanel';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const adminLogoutMutation = useAdminLogout();
  const { data: siteAssets } = useGetSiteAssets();

  const uploadFileMutation = useUploadBookFile();
  const uploadBookCoverMutation = useUploadBookCover();
  const uploadLogoMutation = useUploadLogo();

  const isAuthenticated = !!identity;

  // Asset upload state
  const [bookIdForFile, setBookIdForFile] = useState('');
  const [bookIdForCover, setBookIdForCover] = useState('');
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [assetCoverFile, setAssetCoverFile] = useState<File | null>(null);
  const [assetFileProgress, setAssetFileProgress] = useState(0);
  const [assetCoverProgress, setAssetCoverProgress] = useState(0);
  const [assetCoverPreview, setAssetCoverPreview] = useState<string | null>(null);

  // Site assets state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Drag and drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Handle file preview
  const handleFilePreview = (file: File | null, setPreview: (url: string | null) => void) => {
    if (file) {
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
    handleFilePreview(assetCoverFile, setAssetCoverPreview);
  }, [assetCoverFile]);

  useEffect(() => {
    handleFilePreview(logoFile, setLogoPreview);
  }, [logoFile]);

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

  const handleAdminLogout = async () => {
    try {
      await adminLogoutMutation.mutateAsync();
      toast.success('Admin session ended');
    } catch (error: any) {
      console.error('Admin logout error:', error);
      toast.error(error?.message || 'Failed to sign out');
    }
  };

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show admin sign-in panel if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <AdminSignInPanel />;
  }

  const handleUploadBookFile = async () => {
    if (!bookIdForFile || !assetFile) {
      toast.error('Please enter a book ID and select a file');
      return;
    }

    try {
      const fileBytes = new Uint8Array(await assetFile.arrayBuffer());
      const fileBlob = ExternalBlob.fromBytes(fileBytes).withUploadProgress((percentage) => {
        setAssetFileProgress(percentage);
      });
      const detectedFileType = getFileTypeFromFile(assetFile);

      await uploadFileMutation.mutateAsync({
        bookId: bookIdForFile,
        file: fileBlob,
        fileType: detectedFileType,
      });

      toast.success('Book file uploaded successfully!');
      setAssetFile(null);
      setAssetFileProgress(0);
      setBookIdForFile('');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleUploadBookCover = async () => {
    if (!bookIdForCover || !assetCoverFile) {
      toast.error('Please enter a book ID and select a cover image');
      return;
    }

    try {
      const coverBytes = new Uint8Array(await assetCoverFile.arrayBuffer());
      const coverBlob = ExternalBlob.fromBytes(coverBytes).withUploadProgress((percentage) => {
        setAssetCoverProgress(percentage);
      });

      await uploadBookCoverMutation.mutateAsync({
        bookId: bookIdForCover,
        image: coverBlob,
      });

      toast.success('Book cover uploaded successfully! The site will update automatically.');
      setAssetCoverFile(null);
      setAssetCoverProgress(0);
      setAssetCoverPreview(null);
      setBookIdForCover('');
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error('Failed to upload cover');
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

      toast.success('Logo uploaded successfully! The header will update automatically.');
      setLogoFile(null);
      setLogoProgress(0);
      setLogoPreview(null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  return (
    <div className="min-h-screen py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your content, assets, and site settings</p>
          </div>
          <Button
            onClick={handleAdminLogout}
            variant="outline"
            disabled={adminLogoutMutation.isPending}
          >
            {adminLogoutMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Admin Sign Out
              </>
            )}
          </Button>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have full admin access. All changes will be reflected across the site immediately after upload.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="books">
              <BookPlus className="h-4 w-4 mr-2" />
              Books
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Upload className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-2" />
              Site Images
            </TabsTrigger>
          </TabsList>

          {/* Book Upload & Customization Tab */}
          <TabsContent value="books">
            <BookUploadPanel />
          </TabsContent>

          {/* Upload Book Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Book File
                </CardTitle>
                <CardDescription>
                  Upload or replace a book's file (PDF or Word document). Drag and drop or click to browse.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-id-file">Book ID *</Label>
                  <Input
                    id="book-id-file"
                    value={bookIdForFile}
                    onChange={(e) => setBookIdForFile(e.target.value)}
                    placeholder="e.g., book1, book2, book3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a unique identifier for each book (e.g., book1, book2, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Book File (PDF or Word) *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDraggingFile
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, setIsDraggingFile)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingFile)}
                    onDrop={(e) => handleDrop(e, setAssetFile, setIsDraggingFile, '.pdf,.doc,.docx')}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                    />
                    {assetFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-primary" />
                        <p className="font-medium">{assetFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(assetFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetFile(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Drag and drop your file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX</p>
                      </div>
                    )}
                  </div>

                  {assetFileProgress > 0 && assetFileProgress < 100 && (
                    <div className="space-y-2">
                      <Progress value={assetFileProgress} />
                      <p className="text-sm text-muted-foreground text-center">
                        Uploading... {assetFileProgress}%
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadBookFile}
                  disabled={uploadFileMutation.isPending || !bookIdForFile || !assetFile}
                  className="w-full"
                  size="lg"
                >
                  {uploadFileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Upload Book Cover
                </CardTitle>
                <CardDescription>
                  Upload or replace a book's cover image. Drag and drop or click to browse.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-id-cover">Book ID *</Label>
                  <Input
                    id="book-id-cover"
                    value={bookIdForCover}
                    onChange={(e) => setBookIdForCover(e.target.value)}
                    placeholder="e.g., book1, book2, book3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the Book ID used for the file
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDraggingCover
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, setIsDraggingCover)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingCover)}
                    onDrop={(e) => handleDrop(e, setAssetCoverFile, setIsDraggingCover, 'image/*')}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAssetCoverFile(e.target.files?.[0] || null)}
                    />
                    {assetCoverPreview ? (
                      <div className="space-y-4">
                        <img
                          src={assetCoverPreview}
                          alt="Cover preview"
                          className="max-w-xs mx-auto h-auto rounded-lg border"
                        />
                        <p className="font-medium">{assetCoverFile?.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetCoverFile(null);
                            setAssetCoverPreview(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Drag and drop your cover image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                      </div>
                    )}
                  </div>

                  {assetCoverProgress > 0 && assetCoverProgress < 100 && (
                    <div className="space-y-2">
                      <Progress value={assetCoverProgress} />
                      <p className="text-sm text-muted-foreground text-center">
                        Uploading... {assetCoverProgress}%
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadBookCover}
                  disabled={uploadBookCoverMutation.isPending || !bookIdForCover || !assetCoverFile}
                  className="w-full"
                  size="lg"
                >
                  {uploadBookCoverMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Cover
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Site Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Site Logo
                </CardTitle>
                <CardDescription>
                  Manage the site logo displayed in the header. Drag and drop or click to browse.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteAssets?.logo && !logoPreview && (
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium mb-3">Current Logo:</p>
                    <img
                      src={siteAssets.logo.getDirectURL()}
                      alt="Current logo"
                      className="w-48 h-auto object-contain border rounded-lg p-4 bg-background"
                    />
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDraggingLogo
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
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
                        className="w-48 h-auto object-contain border rounded-lg p-4 bg-background mx-auto"
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
                      <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="font-medium">Drag and drop site logo here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                      <p className="text-xs text-muted-foreground">Transparent PNG recommended</p>
                    </div>
                  )}
                </div>

                {logoProgress > 0 && logoProgress < 100 && (
                  <div className="space-y-2">
                    <Progress value={logoProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      Uploading... {logoProgress}%
                    </p>
                  </div>
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
    </div>
  );
}
