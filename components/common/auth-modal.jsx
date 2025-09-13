'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSigninSchema } from '@/app/(auth)/forms/signin-schema';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';

export function AuthModal({ isOpen, onClose, mode = 'signin' }) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const isSignin = currentMode === 'signin';
  const schema = isSignin ? getSigninSchema() : getSignupSchema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      rememberMe: false,
      agreeToTerms: false,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await form.trigger();
    if (!result) return;

    setIsProcessing(true);
    setError(null);

    try {
      const values = form.getValues();

      if (isSignin) {
        // Handle signin
        const response = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        });

        if (response?.error) {
          try {
            const errorData = JSON.parse(response.error);
            setError(errorData.message || 'Authentication failed');
          } catch {
            setError(response.error);
          }
        } else if (response?.ok) {
          // Successful signin
          onClose();
          router.refresh();
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else {
        // Handle signup
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
            agreeToTerms: values.agreeToTerms,
          }),
        });

        const signupData = await signupResponse.json();

        if (signupResponse.ok && signupData.success) {
          // Auto signin after successful signup
          const signinResponse = await signIn('credentials', {
            redirect: false,
            email: values.email,
            password: values.password,
          });

          if (signinResponse?.ok) {
            onClose();
            router.refresh();
          } else {
            setError('Account created successfully! Please sign in.');
            setCurrentMode('signin');
          }
        } else {
          setError(signupData.error || 'Failed to create account. Please try again.');
        }
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

  const switchMode = () => {
    setCurrentMode(isSignin ? 'signup' : 'signin');
    setError(null);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSignin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignin
              ? 'Sign in to continue with your design'
              : 'Create an account to save your design'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isSignin && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isSignin && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isSignin && (
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {!isSignin && (
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the{' '}
                        <a href="/terms" className="underline hover:text-primary">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="underline hover:text-primary">
                          Privacy Policy
                        </a>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                  {isSignin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isSignin ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <div className="text-center text-sm">
              {isSignin ? (
                <>
                  Don't have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={switchMode}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={switchMode}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
