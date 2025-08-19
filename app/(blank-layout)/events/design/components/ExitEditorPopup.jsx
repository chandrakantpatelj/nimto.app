import Link from 'next/link';
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
          <Button variant="destructive" onClick={() => setShow(false)} asChild>
            <Link href="/host/events"> Yes, Exit</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExitEditorPopup;
