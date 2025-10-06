import { useState } from 'react';
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
import { useToast } from '@/providers/toast-provider';

function DeleteEvent({
  show,
  setShow,
  eventId,
  eventTitle,
  onEventDeleted,
  onDeleteStart,
  onDeleteFailed,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const handleDelete = async () => {
    if (!eventId) {
      toastError('Event ID is required');
      return;
    }

    try {
      setIsDeleting(true);

      // Close popup immediately
      setShow(false);

      // Notify parent that delete has started
      if (onDeleteStart) {
        onDeleteStart(eventId);
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess('Event deleted successfully');

        // Call the callback to refresh the events list
        if (onEventDeleted) {
          onEventDeleted();
        }
      } else {
        toastError(data.error || 'Failed to delete event');

        // Notify parent that delete failed so it can stop the loading state
        if (onDeleteFailed) {
          onDeleteFailed(eventId);
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toastError('An error occurred while deleting the event');

      // Notify parent that delete failed so it can stop the loading state
      if (onDeleteFailed) {
        onDeleteFailed(eventId);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
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
              Are you sure you want to delete this event?
            </AlertTitle>
            {eventTitle && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>"{eventTitle}"</strong>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All associated guests will also be
              deleted.
            </p>
          </AlertContent>
        </Alert>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteEvent;
