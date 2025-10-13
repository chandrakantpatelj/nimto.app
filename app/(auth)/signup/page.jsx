'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    AlertCircle,
    Check,
    Eye,
    EyeOff,
    LoaderCircleIcon,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '@/lib/api';
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
import { getSignupSchema } from '../forms/signup-schema';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function SignupForm({ callbackUrl }) {
    const router = useRouter();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const form = useForm({
        resolver: zodResolver(getSignupSchema()),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
            accept: false,
            isHost: true,
        },
    });

    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await form.trigger();
        if (!result) return;

        if (!executeRecaptcha) {
            setError('reCAPTCHA is not ready. Please try again.');
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);

            const token = await executeRecaptcha('signup_form');
            const values = form.getValues();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const response = await apiFetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-recaptcha-token': token,
                },
                body: JSON.stringify({
                    ...values,
                    callbackUrl: callbackUrl,
                    timezone,
                }),
            });

            if (!response.ok) {
                const { message } = await response.json();
                setError(message);
            } else {
                await response.json();
                const signinUrl = `/signin?email=${encodeURIComponent(values.email)}&verification=true&callbackUrl=${encodeURIComponent(callbackUrl)}`;
                router.push(signinUrl);
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

    if (success) {
        return (
            <Alert onClose={() => setSuccess(false)}>
                <AlertIcon>
                    <Check />
                </AlertIcon>
                <AlertTitle>
                    You have successfully signed up! Please check your email to verify
                    your account and then{' '}
                    <Link
                        href={
                            callbackUrl !== '/templates'
                                ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
                                : '/signin'
                        }
                        className="text-primary hover:text-primary-darker"
                    >
                        Log in
                    </Link>
                    .
                </AlertTitle>
            </Alert>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="block w-full space-y-5">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-center">
                        Create an Account with Nimto
                    </h1>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: callbackUrl })}
                    >
                        <Icons.googleColorful className="size-4!" /> Sign up with Google
                    </Button>
                </div>

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

                {error && (
                    <Alert variant="destructive" onClose={() => setError(null)}>
                        <AlertIcon>
                            <AlertCircle />
                        </AlertIcon>
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="gap-0">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="gap-0">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="gap-0">
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
                                    className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
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

                <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                        <FormItem className="gap-0">
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
                                    onClick={() =>
                                        setPasswordConfirmationVisible(
                                            !passwordConfirmationVisible,
                                        )
                                    }
                                    className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                    aria-label={
                                        passwordConfirmationVisible
                                            ? 'Hide password confirmation'
                                            : 'Show password confirmation'
                                    }
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

                <FormField
                    control={form.control}
                    name="accept"
                    render={({ field }) => (
                        <FormItem className="gap-0">
                            <FormControl>
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="accept"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(!!checked)}
                                    />

                                    <label htmlFor="accept" className="text-sm text-black">
                                        I agree to the
                                    </label>
                                    <Link
                                        href="/privacy-policy"
                                        target="_blank"
                                        className="-ms-0.5 text-sm font-semibold text-orange-500 hover:text-primary"
                                    >
                                        Privacy Policy
                                    </Link>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-2.5">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? (
                            <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : null}
                        Continue
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground text-center">
                    Already have an account?{' '}
                    <Link
                        href={
                            callbackUrl !== '/templates'
                                ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
                                : '/signin'
                        }
                        className="text-sm text-sm font-semibold text-foreground hover:text-primary"
                    >
                        Sign In
                    </Link>
                </div>
            </form>
        </Form>
    );
}

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawCallbackUrl = searchParams.get('callbackUrl');
    const callbackUrl = rawCallbackUrl
        ? decodeURIComponent(rawCallbackUrl)
        : '/templates';

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_V3_RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
        >
            <Suspense>
                <SignupForm callbackUrl={callbackUrl} />
            </Suspense>
        </GoogleReCaptchaProvider>
    );
}