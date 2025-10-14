'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Check, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function ResetPasswordForm() {
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(null);

    const formSchema = z.object({
        email: z.string().email({ message: 'Please enter a valid email address.' }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
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
            setSuccess(null);

            const token = await executeRecaptcha('reset_password');
            const values = form.getValues();

            const response = await apiFetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-recaptcha-token': token,
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            setSuccess(data.message);
            form.reset();
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
                <div className="text-center space-y-1 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" onClose={() => setError(null)}>
                        <AlertIcon>
                            <AlertCircle />
                        </AlertIcon>
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                {success && (
                    <Alert onClose={() => setSuccess(null)}>
                        <AlertIcon>
                            <Check />
                        </AlertIcon>
                        <AlertTitle>{success}</AlertTitle>
                    </Alert>
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
                                    placeholder="Enter your email address"
                                    disabled={!!success || isProcessing}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={!!success || isProcessing}
                    className="w-full"
                >
                    {isProcessing ? (
                        <LoaderCircleIcon className="animate-spin" />
                    ) : null}
                    Submit
                </Button>

                <div className="space-y-3">
                    <Button type="button" variant="outline" className="w-full" asChild>
                        <Link href="/signin">
                            <ArrowLeft className="size-3.5" /> Back
                        </Link>
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function Page() {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_V3_RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
        >
            <Suspense>
                <ResetPasswordForm />
            </Suspense>
        </GoogleReCaptchaProvider>
    );
}