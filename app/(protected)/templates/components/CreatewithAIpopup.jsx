import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function CreatewithAIpopup({ show, setShow }) {
  return (
    <AlertDialog open={show} onOpenChange={setShow}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Template with AI</AlertDialogTitle>
        </AlertDialogHeader>

        <span className="text-xs font-medium text-secondary-foreground">
          Describe the event template you'd like to create. For example, "A
          modern corporate event invitation with a large banner image, event
          details section, and an RSVP button." The AI will attempt to generate
          a visual template structure for you to refine.
        </span>

        <div className="w-full ">
          <Label className="text-muted-foreground">Template Description</Label>
          <Textarea />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="primary" onClick={() => setShow(false)}>
            Generate & Design
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CreatewithAIpopup;
