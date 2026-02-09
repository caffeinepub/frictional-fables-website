import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart } from 'lucide-react';

interface WelcomeMessageModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeMessageModal({ open, onClose }: WelcomeMessageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">
            Welcome to Frictional Fables🤗
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <DialogDescription className="text-base text-center leading-relaxed">
            You can read books, read character notes and blogs which will make you dive deeper into the books.
          </DialogDescription>
          <DialogDescription className="text-base text-center leading-relaxed">
            Thank you for visiting the website.
          </DialogDescription>
          <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
            <span>Love from Kriti</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <Button onClick={onClose} size="lg" className="px-8">
            Start Reading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
