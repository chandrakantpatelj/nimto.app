'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon, X } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { apiFetch } from '@/lib/api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/common/icons';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';

// Constants
const MODAL_CONFIG = {
  title: 'Create an Account with Nimto',
  submitButtonText: 'Continue',
  submitButtonLoadingText: 'Creating Account...',
  googleButtonText: 'Sign up with Google',
  dividerText: 'OR',
};

const FORM_DEFAULTS = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  accept: false,
  isHost: true,
};

// Custom hook for form state management
const useSignupForm = (prefilledEmail = '') => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      ...FORM_DEFAULTS,
      email: prefilledEmail,
    },
  });

  return {
    form,
    passwordVisible,
    setPasswordVisible,
    passwordConfirmationVisible,
    setPasswordConfirmationVisible,
    isProcessing,
    setIsProcessing,
    error,
    setError,
  };
};

// Custom hook for signup logic
const useSignupLogic = (
  form,
  setIsProcessing,
  setError,
  onClose,
  onSuccess,
  callbackUrl,
) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleFormSubmit = async (e) => {
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
          callbackUrl,
          timezone,
        }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        setError(message);
      } else {
        const { message } = await response.json();
        // Immediately call onSuccess with the API response message
        onSuccess?.(message);
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

  const handleGoogleSignup = async () => {
    try {
      await signIn('google', { callbackUrl });
      onSuccess?.();
      onClose();
    } catch (error) {
      setError('Failed to sign up with Google');
    }
  };

  return {
    handleFormSubmit,
    handleGoogleSignup,
  };
};

// Form Field Components
const FormField = ({
  label,
  id,
  type,
  placeholder,
  register,
  error,
  children,
}) => (
  <div>
    <Label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </Label>
    <div className="mt-1">
      {children || (
        <Input id={id} type={type} {...register} placeholder={placeholder} />
      )}
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
  </div>
);

const PasswordField = ({
  id,
  register,
  error,
  isVisible,
  onToggleVisibility,
  placeholder,
}) => (
  <div className="relative">
    <Input
      id={id}
      type={isVisible ? 'text' : 'password'}
      {...register}
      className="pr-10"
      placeholder={placeholder}
    />
    <button
      type="button"
      onClick={onToggleVisibility}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

const TermsCheckbox = ({ form }) => (
  <div className="flex items-start gap-3">
    <Checkbox
      id="accept"
      checked={form.watch('accept')}
      onCheckedChange={(checked) => form.setValue('accept', !!checked)}
      className="mt-1"
    />
    <label
      htmlFor="accept"
      className="text-sm text-gray-700 dark:text-gray-300"
    >
      I agree to the{' '}
      <a
        href="/privacy-policy"
        target="_blank"
        className="text-orange-500 hover:text-orange-600 font-medium"
      >
        Privacy Policy
      </a>
    </label>
  </div>
);

// Main Component
export default function SignupModal({
  isOpen,
  onClose,
  prefilledEmail = '',
  callbackUrl = '/',
  onSuccess,
}) {
  const {
    form,
    passwordVisible,
    setPasswordVisible,
    passwordConfirmationVisible,
    setPasswordConfirmationVisible,
    isProcessing,
    setIsProcessing,
    error,
    setError,
  } = useSignupForm(prefilledEmail);

  const { handleFormSubmit, handleGoogleSignup } = useSignupLogic(
    form,
    setIsProcessing,
    setError,
    onClose,
    onSuccess,
    callbackUrl,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="relative bg-white px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {MODAL_CONFIG.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Google Sign Up Button */}
            <Button
              type="button"
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full h-12 border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50 font-medium"
            >
              <Icons.googleColorful className="size-4 mr-3" />
              {MODAL_CONFIG.googleButtonText}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  {MODAL_CONFIG.dividerText}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" onClose={() => setError(null)}>
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {/* Form Fields */}
            <FormField
              label="Name"
              id="name"
              type="text"
              placeholder="Your Name"
              register={form.register('name')}
              error={form.formState.errors.name}
            />

            <FormField
              label="Email"
              id="email"
              type="email"
              placeholder="Your email"
              register={form.register('email')}
              error={form.formState.errors.email}
            />

            <FormField
              label="Password"
              id="password"
              register={form.register('password')}
              error={form.formState.errors.password}
            >
              <PasswordField
                id="password"
                register={form.register('password')}
                isVisible={passwordVisible}
                onToggleVisibility={() => setPasswordVisible(!passwordVisible)}
                placeholder="Your password"
              />
            </FormField>

            <FormField
              label="Confirm Password"
              id="passwordConfirmation"
              register={form.register('passwordConfirmation')}
              error={form.formState.errors.passwordConfirmation}
            >
              <PasswordField
                id="passwordConfirmation"
                register={form.register('passwordConfirmation')}
                isVisible={passwordConfirmationVisible}
                onToggleVisibility={() =>
                  setPasswordConfirmationVisible(!passwordConfirmationVisible)
                }
                placeholder="Confirm your password"
              />
            </FormField>

            {/* Terms Checkbox */}
            <TermsCheckbox form={form} />
            {form.formState.errors.accept && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.accept.message}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isProcessing ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                  {MODAL_CONFIG.submitButtonLoadingText}
                </>
              ) : (
                MODAL_CONFIG.submitButtonText
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onClose}
              className=" font-bold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
