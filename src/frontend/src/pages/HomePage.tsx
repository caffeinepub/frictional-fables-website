import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, Tag, FileText, Calendar, Sparkles } from 'lucide-react';
import { useGetFeaturedBooks, useGetAllCharacterNotes, useGetAllBlogPosts, useGetAllNewComings, useGetSiteAssets } from '../hooks/useQueries';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: books, isLoading: booksLoading } = useGetFeaturedBooks();
  const { data: characterNotes, isLoading: notesLoading } = useGetAllCharacterNotes();
  const { data: blogPosts, isLoading: blogsLoading } = useGetAllBlogPosts();
  const { data: newComings, isLoading: comingsLoading } = useGetAllNewComings();
  const { data: siteAssets } = useGetSiteAssets();

  // Get logo URL from uploaded assets or fallback to default
  const getLogoUrl = () => {
    if (siteAssets?.logo) {
      const url = siteAssets.logo.getDirectURL();
      if (url && url !== '') return url;
    }
    return '/assets/_FRICTIONAL_FABLES__20241114_192858_0000.jpg';
  };

  const logoUrl = getLogoUrl();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 bg-cover bg-center"
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
            Discover More
          </Button>
        </div>
      </section>

      {/* Reading Quote */}
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

      {/* Featured Books Section */}
      <section
        className="py-16 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/featured-books-bg.dim_800x600.jpg)`,
        }}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-foreground">
            Featured Books
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
                      onClick={() => navigate({ to: '/book/$bookId', params: { bookId: book.id } })}
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

      {/* Character Notes Preview Section */}
      {characterNotes && characterNotes.length > 0 && (
        <section
          className="py-16 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/character-notes-preview.dim_600x300.jpg)`,
          }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 text-foreground">
              Character Notes
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Dive deeper into the characters and worlds of our stories
            </p>

            {notesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {characterNotes.slice(0, 3).map((note) => (
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
                        onClick={() => navigate({ to: '/character-note/$noteId', params: { noteId: note.id } })}
                      >
                        View More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {characterNotes.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  View All Character Notes
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Blogs Preview Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 text-foreground">
              From the Blog
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Writing tips, reading recommendations, and literary insights
            </p>

            {blogsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {blogPosts.slice(0, 3).map((blog) => (
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
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate({ to: '/blog' })}
                      >
                        Read More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {blogPosts.length > 3 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate({ to: '/blog' })}
                >
                  View All Blog Posts
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Comings Section */}
      {newComings && newComings.length > 0 && (
        <section
          className="py-16 bg-cover bg-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/generated/new-comings-preview-bg.dim_800x400.jpg)`,
          }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4 text-foreground flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Coming Soon
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Exciting new stories and content on the horizon
            </p>

            {comingsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {newComings.map((coming) => (
                  <Card key={coming.id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={coming.image.getDirectURL()}
                        alt={coming.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="font-serif">{coming.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {coming.description}
                      </CardDescription>
                      {coming.releaseDate && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{coming.releaseDate}</span>
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className="py-16 bg-muted/30">
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
    </div>
  );
}
