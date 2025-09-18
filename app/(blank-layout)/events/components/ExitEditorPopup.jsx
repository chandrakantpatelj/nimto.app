import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import {
  Alert,
  AlertContent,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import DialogContent, {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function ExitEditorPopup({ show, setShow }) {
  const router = useRouter();

  const handleExit = () => {
    // Get navigation source to determine redirect destination
    const navigationSource = localStorage.getItem('navigationSource');
    
    // Clear the navigation source after using it
    localStorage.removeItem('navigationSource');
    
    // Smart redirect based on how user arrived
    switch (navigationSource) {
      case 'create-event':
        // User came from "Create Event" button -> redirect to events page
        router.push('/events');
        break;
      case 'home':
      case 'templates':
      case 'select-template':
      default:
        // User came from template selection -> redirect to previous route
        // Use browser history to go back, or fallback to home
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
        break;
    }
    
    setShow(false);
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exit Editor</DialogTitle>
        </DialogHeader>

        <Alert
          variant="destructive"
          appearance="light"
          close={false}
          className="bg-transparent border-0 dark:bg-transparent dark:border-0"
        >
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle className="font-medium">
              Are you sure you want to exit? Any unsaved changes will be lost.
            </AlertTitle>
          </AlertContent>
        </Alert>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleExit}>
            Yes, Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExitEditorPopup;
