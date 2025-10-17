'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  LoaderCircleIcon,
  X,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Icons } from '@/components/common/icons';
import { getSigninSchema } from '@/app/(auth)/forms/signin-schema';

export default function LoginModal({
  isOpen,
  onClose,
  prefilledEmail = '',
  callbackUrl = '/templates',
  onSuccess,
}) {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: prefilledEmail,
      password: '',
      rememberMe: false,
    },
  });

  // Update form when prefilledEmail changes
  useEffect(() => {
    if (prefilledEmail) {
      form.setValue('email', prefilledEmail);
    }
  }, [prefilledEmail, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setError(null);
      setPasswordVisible(false);
    }
  }, [isOpen, form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await form.trigger();
    if (!result) return;

    setIsProcessing(true);
    setError(null);

    try {
      const values = form.getValues();
      const response = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackUrl: callbackUrl,
      });

      if (response?.error) {
        try {
          const errorData = JSON.parse(response.error);
          setError(errorData.message || 'Authentication failed');
        } catch {
          setError(response.error);
        }
      } else if (response?.ok) {
        // Successful login
        if (onSuccess) {
          onSuccess();
        }
        onClose();

        // Redirect to callback URL
        const redirectUrl = response.url || callbackUrl || '/templates';
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: callbackUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Sign in to Update RSVP
          </DialogTitle>
          <DialogDescription className="text-center">
            Please sign in to update your RSVP response for this event.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Social Login */}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <Icons.googleColorful className="size-5 opacity-100 mr-2" />
                Sign in with Google
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your email"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm font-semibold"
                      onClick={() => router.push('/reset-password')}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Your password"
                      type={passwordVisible ? 'text' : 'password'}
                      {...field}
                      className="h-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 top-0 h-10 w-10 px-0"
                      aria-label={
                        passwordVisible ? 'Hide password' : 'Show password'
                      }
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <>
                    <Checkbox
                      id="remember-me-modal"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                    <label
                      htmlFor="remember-me-modal"
                      className="text-sm leading-none text-muted-foreground"
                    >
                      Remember me
                    </label>
                  </>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-10"
            >
              {isProcessing && (
                <LoaderCircleIcon className="size-4 animate-spin mr-2" />
              )}
              Sign In
            </Button>
          </form>
        </Form>

        <DialogFooter className="flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-semibold"
              onClick={() => {
                onClose();
                router.push('/signup');
              }}
            >
              Sign Up
            </Button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
