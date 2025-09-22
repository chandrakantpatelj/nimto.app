'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon, Check } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { getSigninSchema } from '../forms/signin-schema';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Get callback URL from search params, default to templates
  const callbackUrl = searchParams.get('callbackUrl') || '/templates';
  const prefilledEmail = searchParams.get('email') || '';
  const showVerificationMessage = searchParams.get('verification') === 'true';

  const form = useForm({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: prefilledEmail,
      password: '',
      rememberMe: false,
    },
  });

  // Update form when email parameter changes
  useEffect(() => {
    if (prefilledEmail) {
      form.setValue('email', prefilledEmail);
    }
  }, [prefilledEmail, form]);

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
        callbackUrl: callbackUrl, // redirect to callback URL after login
      });

      console.log('SignIn Response:', response);

      if (response?.error) {
        // Handle both plain string and JSON error formats safely
        try {
          const errorData = JSON.parse(response.error);
          setError(errorData.message || 'Authentication failed');
        } catch {
          setError(response.error);
        }
      } else if (response?.ok && response.url) {
        // Successful login: redirect and refresh session
        router.push(response.url);
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="block w-full space-y-5">
        {/* Header */}
        <div className="space-y-1.5 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Sign in to Nimto
          </h1>
          <p className="mt-2 text-sm text-slate-600 text-center">
            Manage your events seamlessly.
          </p>
        </div>

        {/* Verification Message */}
        {showVerificationMessage && (
          <Alert className="mb-4">
            <AlertIcon>
              <Check className="h-4 w-4" />
            </AlertIcon>
            <AlertTitle>
              Please verify your account! We sent a verification email to{' '}
              <span className="font-semibold">{prefilledEmail}</span>. 
              Please check your email and click the verification link before signing in.
            </AlertTitle>
          </Alert>
        )}

        {/* Social Login */}
        <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={() => signIn('google', { callbackUrl: callbackUrl })}
          >
            <Icons.googleColorful className="size-5 opacity-100" /> Sign in with
            Google
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
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
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

        {/* Remember Me */}
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
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing && (
              <LoaderCircleIcon className="size-4 animate-spin mr-2" />
            )}
            Continue
          </Button>
        </div>

        {/* Signup link */}
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link
            href={callbackUrl !== '/templates' ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/signup'}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
}
