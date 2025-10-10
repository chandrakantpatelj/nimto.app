'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { LoaderCircleIcon, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { getChangePasswordSchema } from '@/app/(auth)/forms/change-password-schema';

export function ChangePassword() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);

    const form = useForm({
        resolver: zodResolver(getChangePasswordSchema()),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values) => {
        setIsProcessing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Use the correct API endpoint for password change
            const response = await fetch('/api/user-management/users/[id]/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                    confirmPassword: values.confirmPassword,
                }),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setSuccessMessage(result.message || 'Password updated successfully!');
                form.reset();
            } else {
                setError(result.error || result.message || 'Password update failed.');
            }
        } catch {
            setError('An error occurred while updating the password.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardHeader>
                <CardTitle className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Change Your Password
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertIcon>
                                <AlertCircle />
                            </AlertIcon>
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert>
                            <AlertIcon>
                                <Check />
                            </AlertIcon>
                            <AlertTitle>{successMessage}</AlertTitle>
                        </Alert>
                    )}

                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Current Password
                        </Label>
                        <div className="relative">
                            <Input
                                type={passwordVisible ? 'text' : 'password'}
                                {...form.register('currentPassword')}
                                placeholder="Enter your current password"
                                className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                mode="icon"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                            >
                                {passwordVisible ? (
                                    <EyeOff className="text-muted-foreground" />
                                ) : (
                                    <Eye className="text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            New Password
                        </Label>
                        <div className="relative">
                            <Input
                                type={passwordConfirmationVisible ? 'text' : 'password'}
                                {...form.register('newPassword')}
                                placeholder="Enter your new password"
                                className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                mode="icon"
                                onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                                className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                aria-label={passwordConfirmationVisible ? 'Hide password' : 'Show password'}
                            >
                                {passwordConfirmationVisible ? (
                                    <EyeOff className="text-muted-foreground" />
                                ) : (
                                    <Eye className="text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Must be at least 8 characters long and meet complexity requirements.
                        </p>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                        <Label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Confirm New Password
                        </Label>
                        <Input
                            type={passwordConfirmationVisible ? 'text' : 'password'}
                            {...form.register('confirmPassword')}
                            placeholder="Confirm your new password"
                            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button variant="primary" type="submit" disabled={isProcessing}>
                            {isProcessing && <LoaderCircleIcon className="size-4 animate-spin" />}
                            Update Password
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}