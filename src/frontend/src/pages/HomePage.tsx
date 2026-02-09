import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, Tag, FileText, ChevronLeft } from 'lucide-react';
import { useGetFeaturedBooks, useGetAllCharacterNotes, useGetAllBlogPosts, useGetSiteAssets, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginRequiredModal from '../components/LoginRequiredModal';

type ActiveSection = 'home' | 'books' | 'characterNotes' | 'blogs';

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: books, isLoading: booksLoading } = useGetFeaturedBooks();
  const { data: characterNotes, isLoading: notesLoading } = useGetAllCharacterNotes();
  const { data: blogPosts, isLoading: blogsLoading } = useGetAllBlogPosts();
  const { data: siteAssets } = useGetSiteAssets();

  const isAuthenticated = !!identity;
  const hasCompleteProfile = userProfile && userProfile.email && userProfile.email !== '';

  // Get logo URL from uploaded assets or fallback to default
  const getLogoUrl = () => {
    if (siteAssets?.logo) {
      const url = siteAssets.logo.getDirectURL();
      if (url && url !== '') return url;
    }
    return '/assets/_FRICTIONAL_FABLES__20241114_192858_0000.jpg';
  };

  const logoUrl = getLogoUrl();

  // Get unique books that have character notes
  const booksWithNotes = books?.filter(book => 
    characterNotes?.some(note => note.bookId === book.id)
  ) || [];

  // Get character notes for selected book
  const selectedBookNotes = selectedBookId 
    ? characterNotes?.filter(note => note.bookId === selectedBookId) || []
    : [];

  // Sort blogs by date (most recent first) - assuming ID contains timestamp or sequential
  const sortedBlogs = blogPosts ? [...blogPosts].reverse() : [];

  // Handle "Read Now" button click - check authentication
  const handleReadNowClick = (bookId: string) => {
    if (!isAuthenticated || !hasCompleteProfile) {
      setShowLoginModal(true);
    } else {
      navigate({ to: '/book/$bookId', params: { bookId } });
    }
  };

  // Handle character note click - check authentication
  const handleCharacterNoteClick = (noteId: string) => {
    if (!isAuthenticated || !hasCompleteProfile) {
      setShowLoginModal(true);
    } else {
      navigate({ to: '/character-note/$noteId', params: { noteId } });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-16 md:py-24 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/assets/generated/hero-background.dim_1200x800.jpg)`,
        }}
      >
        {/* Logo in top-right corner */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
          <img
            src={logoUrl}
            alt="Frictional Fables Logo"
            className="h-16 w-16 md:h-24 md:w-24 lg:h-32 lg:w-32 object-contain rounded-lg shadow-lg bg-white/10 backdrop-blur-sm p-2 border border-white/20"
          />
        </div>

        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Welcome to Frictional Fables
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Immerse yourself in captivating stories crafted with love by Kriti
          </p>
          <Button
            size="lg"
            onClick={() => navigate({ to: '/about' })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            About the Author
          </Button>
        </div>
      </section>

      {/* Main Interactive Navigation Section - Prominently Displayed */}
      {activeSection === 'home' ? (
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
                Explore Frictional Fables
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Dive into our collection of books, discover character insights, and read engaging blogs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {/* Books Option - Large and Prominent */}
              <Card 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary hover:scale-105 group"
                onClick={() => setActiveSection('books')}
              >
                <div 
                  className="aspect-[4/3] bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(/assets/generated/featured-books-bg.dim_800x600.jpg)`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <BookOpen className="h-20 w-20 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-serif font-bold">Books</h3>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-2xl text-center">Discover Stories</CardTitle>
                  <CardDescription className="text-center text-base">
                    Explore our collection of captivating stories and immerse yourself in new worlds
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button className="w-full" size="lg" variant="default">
                    View All Books
                  </Button>
                </CardFooter>
              </Card>

              {/* Character Notes Option - Large and Prominent */}
              <Card 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary hover:scale-105 group"
                onClick={() => setActiveSection('characterNotes')}
              >
                <div 
                  className="aspect-[4/3] bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(/assets/generated/character-notes-preview.dim_600x300.jpg)`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Tag className="h-20 w-20 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-serif font-bold">Character Notes</h3>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-2xl text-center">Behind the Scenes</CardTitle>
                  <CardDescription className="text-center text-base">
                    Dive deeper into the characters and discover behind-the-scenes insights
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button className="w-full" size="lg" variant="default">
                    Explore Character Notes
                  </Button>
                </CardFooter>
              </Card>

              {/* Blogs Option - Large and Prominent */}
              <Card 
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary hover:scale-105 group"
                onClick={() => setActiveSection('blogs')}
              >
                <div 
                  className="aspect-[4/3] bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(/assets/generated/blog-preview-header.dim_600x300.jpg)`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <FileText className="h-20 w-20 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-3xl font-serif font-bold">Blogs</h3>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-2xl text-center">Literary Insights</CardTitle>
                  <CardDescription className="text-center text-base">
                    Read writing tips, recommendations, and literary insights from the author
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button className="w-full" size="lg" variant="default">
                    Read Blogs
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      ) : activeSection === 'books' ? (
        /* Books Section */
        <section
          className="py-16 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/featured-books-bg.dim_800x600.jpg)`,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => setActiveSection('home')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-foreground">
              All Books
            </h2>

            {booksLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : books && books.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      <img
                        src={book.coverImage.getDirectURL()}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-serif">{book.title}</CardTitle>
                      <CardDescription>{book.summary}</CardDescription>
                      {book.genre && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {book.genre.split(',').map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() => handleReadNowClick(book.id)}
                        className="w-full"
                      >
                        Read Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-2">Books Coming Soon!</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We're preparing an amazing collection of stories for you. Check back soon to start your reading journey!
                </p>
              </div>
            )}
          </div>
        </section>
      ) : activeSection === 'characterNotes' ? (
        /* Character Notes Section */
        <section
          className="py-16 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/character-notes-preview.dim_600x300.jpg)`,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => {
                  if (selectedBookId) {
                    setSelectedBookId(null);
                  } else {
                    setActiveSection('home');
                  }
                }}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {selectedBookId ? 'Back to Books' : 'Back to Home'}
              </Button>
            </div>

            {!selectedBookId ? (
              <>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 text-foreground">
                  Character Notes
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                  Select a book to view its character notes
                </p>

                {notesLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : booksWithNotes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {booksWithNotes.map((book) => (
                      <Card 
                        key={book.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedBookId(book.id)}
                      >
                        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                          <img
                            src={book.coverImage.getDirectURL()}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="font-serif">{book.title}</CardTitle>
                          <CardDescription>
                            {characterNotes?.filter(note => note.bookId === book.id).length || 0} character note(s)
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            View Character Notes
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground mb-2">No Character Notes Yet</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Character notes will be added soon to enhance your reading experience!
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-foreground">
                  {books?.find(b => b.id === selectedBookId)?.title} - Character Notes
                </h2>

                {selectedBookNotes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {selectedBookNotes.map((note) => (
                      <Card key={note.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {note.previewImage && (
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={note.previewImage.getDirectURL()}
                              alt={note.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="font-serif flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {note.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {note.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleCharacterNoteClick(note.id)}
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">No character notes for this book yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      ) : (
        /* Blogs Section */
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => setActiveSection('home')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 text-foreground">
              All Blogs
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Writing tips, reading recommendations, and literary insights
            </p>

            {blogsLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedBlogs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {sortedBlogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {blog.previewImage ? (
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img
                          src={blog.previewImage.getDirectURL()}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-video bg-cover bg-center relative"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/assets/generated/blog-preview-header.dim_600x300.jpg)`,
                        }}
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="font-serif flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2">
                      {blog.file && blog.fileType && (
                        <div className="w-full">
                          {blog.fileType === 'pdf' && (
                            <div className="aspect-video bg-muted rounded-md overflow-hidden">
                              <iframe
                                src={blog.file.getDirectURL()}
                                className="w-full h-full"
                                title={`${blog.title} PDF`}
                              />
                            </div>
                          )}
                          {blog.fileType === 'image' && (
                            <div className="aspect-video bg-muted rounded-md overflow-hidden">
                              <img
                                src={blog.file.getDirectURL()}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {blog.fileType === 'video' && (
                            <div className="aspect-video bg-muted rounded-md overflow-hidden">
                              <video
                                src={blog.file.getDirectURL()}
                                controls
                                className="w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-2">No Blogs Yet</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Blog posts will be published soon. Stay tuned for writing tips and literary insights!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reading Quote - Only show on home view */}
      {activeSection === 'home' && (
        <section
          className="py-16 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(/assets/generated/quotes-background.dim_1200x600.jpg)`,
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground/80 max-w-3xl mx-auto">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </blockquote>
            <p className="mt-4 text-muted-foreground">— George R.R. Martin</p>
          </div>
        </section>
      )}

      {/* Community Section - Only show on home view */}
      {activeSection === 'home' && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-serif">Join the Discussion</CardTitle>
                  <CardDescription>
                    Connect with fellow readers, share your thoughts, and discuss your favorite stories
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => navigate({ to: '/forum' })} variant="outline" className="w-full">
                    Visit Forum
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-serif">Share Your Ideas</CardTitle>
                  <CardDescription>
                    Have suggestions or book requests? We'd love to hear from you!
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => navigate({ to: '/suggestions' })} variant="outline" className="w-full">
                    Submit Suggestion
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Login Required Modal */}
      <LoginRequiredModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  );
}
