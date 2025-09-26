'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
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
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/common/icons';
import { RecaptchaPopover } from '@/components/common/recaptcha-popover';
import { getSigninSchema } from '@/app/(auth)/forms/signin-schema';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';

export function AuthModal({ isOpen, onClose, mode = 'signin' }) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  const isSignin = currentMode === 'signin';

  // Cleanup effect to handle component unmounting
  useEffect(() => {
    return () => {
      // Reset processing state when component unmounts
      setIsProcessing(false);
      setError(null);
      setShowRecaptcha(false);
    };
  }, []);
  const schema = isSignin ? getSigninSchema() : getSignupSchema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      passwordConfirmation: '',
      rememberMe: false,
      accept: false,
      isHost: true,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await form.trigger();
    if (!result) return;

    if (isSignin) {
      // Handle signin directly
      setIsProcessing(true);
      setError(null);

      try {
        const values = form.getValues();
        
        // Add timeout to signIn call
        const signInPromise = signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout. Please try again.')), 30000)
        );

        const response = await Promise.race([signInPromise, timeoutPromise]);

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
      } catch (err) {
        console.error('SignIn error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.',
        );
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For signup, show reCAPTCHA
      setShowRecaptcha(true);
    }
  };

  const handleVerifiedSubmit = async (token) => {
    try {
      const values = form.getValues();

      setIsProcessing(true);
      setError(null);
      setShowRecaptcha(false);

      // Add timeout to apiFetch call
      const fetchPromise = apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-recaptcha-token': token,
        },
        body: JSON.stringify(values),
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 30000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        const { message } = await response.json();
        setError(message);
      } else {
        // Account created successfully, show success message and switch to signin
        setError(null);
        setCurrentMode('signin');
        form.setValue('email', values.email);
        form.setValue('password', '');
        form.setValue('passwordConfirmation', '');
        form.setValue('name', '');
        form.setValue('accept', false);
        form.setValue('isHost', false);
      }
    } catch (err) {
      console.error('SignUp error:', err);
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
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">
          {isSignin ? 'Sign in to Nimto' : 'Create an Account with Nimto'}
        </DialogTitle>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="block w-full space-y-5">
            {/* Header */}
            <div className="space-y-1.5 pb-3">
              <h1 className="text-2xl font-semibold tracking-tight text-center">
                {isSignin ? 'Sign in to Nimto' : 'Create an Account with Nimto'}
              </h1>
              <p className="mt-2 text-sm text-slate-600 text-center">
                {isSignin 
                  ? 'Manage your events seamlessly.' 
                  : 'Join us to start planning and attending amazing events!'
                }
              </p>
            </div>

            {/* Social Login */}
            <div className="flex flex-col gap-3.5">
              <Button
                variant="outline"
                type="button"
                onClick={async () => {
                  try {
                    await signIn('google', { callbackUrl: window.location.pathname });
                  } catch (err) {
                    console.error('Google SignIn error:', err);
                    setError('Google sign-in failed. Please try again.');
                  }
                }}
              >
                <Icons.googleColorful className="size-5 opacity-100" /> 
                {isSignin ? 'Sign in with Google' : 'Sign up with Google'}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative py-1.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" onClose={() => setError(null)}>
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* Name field for signup */}
            {!isSignin && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="Your password"
                      type={passwordVisible ? 'text' : 'password'}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      size="sm"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5"
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    >
                      {passwordVisible ? (
                        <EyeOff className="text-muted-foreground" />
                      ) : (
                        <Eye className="text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Confirmation for signup */}
            {!isSignin && (
              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <Input
                        type={passwordConfirmationVisible ? 'text' : 'password'}
                        {...field}
                        placeholder="Confirm your password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                        className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                        aria-label={passwordConfirmationVisible ? 'Hide password confirmation' : 'Show password confirmation'}
                      >
                        {passwordConfirmationVisible ? (
                          <EyeOff className="text-muted-foreground" />
                        ) : (
                          <Eye className="text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Host checkbox for signup */}
            {!isSignin && (
              <FormField
                control={form.control}
                name="isHost"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-start gap-2.5">
                        <Checkbox
                          id="isHost"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                        <div className="flex flex-col gap-1">
                          <label htmlFor="isHost" className="text-sm">
                            I'm interested in hosting events.
                          </label>
                          <label htmlFor="isHost" className="text-xs text-muted-foreground">
                            Sign up as a host to create and manage your own events.
                          </label>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Terms acceptance for signup */}
            {!isSignin && (
              <FormField
                control={form.control}
                name="accept"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id="accept"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                        <label htmlFor="accept" className="text-sm text-black">
                          I agree to the{' '}
                          <a href="/privacy-policy" target="_blank" className="text-sm font-semibold text-orange-500 hover:text-primary">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Remember Me for signin */}
            {isSignin && (
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <>
                      <Checkbox
                        id="remember-me"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                      <label htmlFor="remember-me" className="text-sm leading-none text-muted-foreground">
                        Remember me
                      </label>
                    </>
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col gap-2.5">
              {isSignin ? (
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing && (
                    <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                  )}
                  Continue
                </Button>
              ) : (
                <RecaptchaPopover
                  open={showRecaptcha}
                  onOpenChange={(open) => {
                    if (!open) {
                      setShowRecaptcha(false);
                    }
                  }}
                  onVerify={handleVerifiedSubmit}
                  trigger={
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? (
                        <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                      ) : null}
                      Continue
                    </Button>
                  }
                />
              )}
            </div>

            {/* Switch Mode Link */}
            <div className="text-sm text-muted-foreground text-center">
              {isSignin ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm font-semibold text-foreground hover:text-primary"
                    onClick={switchMode}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm font-semibold text-foreground hover:text-primary"
                    onClick={switchMode}
                  >
                    Sign In
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
