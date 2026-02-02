import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiInstagram } from 'react-icons/si';
import { useGetSiteAssets } from '../hooks/useQueries';

export default function AboutPage() {
  const { data: siteAssets } = useGetSiteAssets();

  // Use site assets author photo or fallback to provided image
  const getAuthorPhotoUrl = () => {
    if (siteAssets?.authorPhoto) {
      const url = siteAssets.authorPhoto.getDirectURL();
      if (url && url !== '') return url;
    }
    return '/assets/IMG_20250128_211711_164.webp';
  };

  const authorPhotoUrl = getAuthorPhotoUrl();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12">
          About Frictional Fables
        </h1>

        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-[300px,1fr] gap-8">
              <div className="bg-muted rounded-lg overflow-hidden p-6 flex items-center justify-center">
                <img
                  src={authorPhotoUrl}
                  alt="Kriti"
                  className="w-full h-auto object-cover rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold mb-4">Kriti</h2>
                <div className="prose prose-lg max-w-none mb-6">
                  <p className="text-muted-foreground">
                    Welcome to Frictional Fables, a collection of stories crafted with passion and imagination.
                    Each tale is designed to transport you to different worlds, introduce you to memorable characters,
                    and leave you with thoughts that linger long after the last page.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Writing has always been a way to explore the human experience, to ask questions, and to find
                    beauty in the everyday. Through these stories, I hope to share that journey with you.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a
                    href="https://instagram.com/frictional_fables"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <SiInstagram className="h-5 w-5" />
                    @frictional_fables
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
