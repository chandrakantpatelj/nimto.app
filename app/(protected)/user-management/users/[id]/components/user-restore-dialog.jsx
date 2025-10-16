'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Validation schema for email confirmation
const EmailConfirmationSchema = (userEmail) =>
  z.object({
    confirmEmail: z
      .string()
      .nonempty({ message: 'Email is required.' })
      .email({ message: 'Please enter a valid email address.' })
      .refine((value) => value === userEmail, {
        message: 'Email confirmation does not match.',
      }),
  });

const UserRestoreDialog = ({ open, closeDialog, user }) => {
  const queryClient = useQueryClient();
  const { toastSuccess, toastError } = useToast();

  // Set up the form using react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(EmailConfirmationSchema(user.email)),
    defaultValues: {
      confirmEmail: '',
    },
    mode: 'onChange',
  });

  // Define the mutation for restoring the user
  const mutation = useMutation({
    mutationFn: async () => {
      // Call the restore endpoint (adjust the endpoint/method as needed)
      const response = await apiFetch(
        `/api/user-management/users/${user.id}/restore`,
        {
          method: 'PATCH',
        },
      );

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      return response.json();
    },
    onSuccess: () => {
      const message = 'User restored successfully.';
      toastSuccess(message);

      // Update user data and refresh the page
      queryClient.invalidateQueries({ queryKey: ['user-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-users'] });

      closeDialog();

      // Refresh the page to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toastError(error.message);
    },
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent close={false}>
        <DialogHeader>
          <DialogTitle>Confirm Restore</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm text-accent-foreground mb-2.5">
            Restoring user{' '}
            <strong className="text-foreground">{user.email}</strong> will
            reactivate the account and all related data.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-2.5 pt-2.5"
            >
              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Confirm the user&apos;s email address to proceed
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={
                    !form.formState.isValid || mutation.status === 'pending'
                  }
                >
                  {mutation.status === 'pending' && (
                    <LoaderCircleIcon className="animate-spin" />
                  )}
                  Restore user account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRestoreDialog;
