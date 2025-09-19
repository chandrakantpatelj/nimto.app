'use client';

import { useState } from 'react';
import {
  Baby,
  CheckCircle,
  HelpCircle,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  User,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function RSVPForm({ event, userGuest, onRSVPUpdate, session }) {
  const [formData, setFormData] = useState({
    name: userGuest?.name || session?.user?.name || '',
    email: userGuest?.email || session?.user?.email || '',
    phone: userGuest?.phone || '',
    status: userGuest?.status || 'PENDING',
    response: userGuest?.response || '',
    plusOnes: userGuest?.plusOnes || 0,
    adults: userGuest?.adults || 1,
    children: userGuest?.children || 0,
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isUpdatingResponse, setIsUpdatingResponse] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null);
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({
      ...prev,
      status,
      response:
        status === 'CONFIRMED' ? 'YES' : status === 'DECLINED' ? 'NO' : 'MAYBE',
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setSubmitError('Email is required');
      return false;
    }
    if (!formData.status || formData.status === 'PENDING') {
      setSubmitError('Please select your response (Accept/Decline/Maybe)');
      return false;
    }

    // Validate plus ones
    if (event?.allowPlusOnes && formData.plusOnes > (event?.maxPlusOnes || 0)) {
      setSubmitError(`Plus ones cannot exceed ${event.maxPlusOnes}`);
      return false;
    }

    // Validate family headcount
    if (event?.allowFamilyHeadcount) {
      if (formData.adults < 1) {
        setSubmitError('At least 1 adult is required');
        return false;
      }
      if (formData.children < 0) {
        setSubmitError('Children count cannot be negative');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the request body
      const requestBody = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        status: formData.status,
        response: formData.response,
        plusOnes: formData.plusOnes || 0,
        adults: formData.adults || 1,
        children: formData.children || 0,
        additionalNotes: formData.additionalNotes.trim() || null,
      };

      // Build query parameters
      const params = new URLSearchParams();
      params.append('eventId', event.id);
      if (session?.user?.email) {
        params.append('email', session.user.email);
      }

      const queryString = params.toString();
      const url = `/api/attendee/guests?${queryString}`;

      const response = await apiFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API request failed: ${response.status}`,
        );
      }

      const result = await response.json();

      setSubmitSuccess(true);
      setIsUpdatingResponse(false); // Reset update mode

      // Update form data with the response from server
      setFormData(prev => ({
        ...prev,
        status: result.data.status,
        response: result.data.response,
      }));

      // Call the callback to update parent component
      if (onRSVPUpdate) {
        onRSVPUpdate(result.data);
      }

      // Reset form after successful submission
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setSubmitError(
        error.message || 'Failed to submit RSVP. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MAYBE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'DECLINED':
        return <XCircle className="h-4 w-4" />;
      case 'MAYBE':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Show form for PENDING, INVITED, or when user wants to update
  const shouldShowForm =
    !userGuest?.status ||
    userGuest.status === 'PENDING' ||
    userGuest.status === 'INVITED' ||
    formData.status === 'PENDING' ||
    isUpdatingResponse;


  // If user has already responded and doesn't want to update, show response summary
  if (
    userGuest?.status &&
    userGuest.status !== 'PENDING' &&
    userGuest.status !== 'INVITED' &&
    !shouldShowForm
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your RSVP Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(userGuest.status)}>
                {getStatusIcon(userGuest.status)}
                <span className="ml-1">{userGuest.status}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Responded on{' '}
                {new Date(userGuest.respondedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Show guest count information */}
            {(userGuest.plusOnes > 0 ||
              userGuest.adults > 1 ||
              userGuest.children > 0) && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Guest Count
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {userGuest.adults > 1 && (
                    <div>Adults: {userGuest.adults}</div>
                  )}
                  {userGuest.children > 0 && (
                    <div>Children: {userGuest.children}</div>
                  )}
                  {userGuest.plusOnes > 0 && (
                    <div>Plus Ones: {userGuest.plusOnes}</div>
                  )}
                </div>
              </div>
            )}

            {userGuest.response && (
              <div>
                <Label className="text-sm font-medium">Response</Label>
                <p className="text-sm mt-1">{userGuest.response}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsUpdatingResponse(true);
                setFormData((prev) => ({
                  ...prev,
                  status: userGuest.status, // Keep current status but allow form to show
                }));
              }}
            >
              Update Response
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get available response options based on event settings
  const getResponseOptions = () => {
    const options = [
      {
        value: 'CONFIRMED',
        label: 'Accept',
        icon: CheckCircle,
        color: 'green',
      },
      { value: 'DECLINED', label: 'Decline', icon: XCircle, color: 'red' },
    ];

    // Add Maybe option if allowed by event settings
    if (event?.allowMaybeRsvp) {
      options.push({
        value: 'MAYBE',
        label: 'Maybe',
        icon: HelpCircle,
        color: 'yellow',
      });
    }

    return options;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-slate-800/50 dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-t-lg pb-6">
        <CardTitle className="text-xl font-bold flex items-center gap-3 mb-3 pt-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageSquare className="h-5 w-5" />
          </div>
          {isUpdatingResponse ? 'Update RSVP Response' : 'RSVP Response'}
        </CardTitle>
        <p className="text-green-100 text-base font-medium">
          {isUpdatingResponse 
            ? 'Update your response below if your plans have changed.'
            : 'Please fill out the form below to respond to this invitation.'
          }
        </p>

        {/* Event Settings Info */}
        {(event?.privateGuestList ||
          event?.allowPlusOnes ||
          event?.allowFamilyHeadcount ||
          event?.limitEventCapacity) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {event?.privateGuestList && (
              <Badge className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                <Lock className="h-3 w-3 mr-1" />
                Private Guest List
              </Badge>
            )}
            {event?.allowPlusOnes && (
              <Badge className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                <UserPlus className="h-3 w-3 mr-1" />
                Plus Ones Allowed
              </Badge>
            )}
            {event?.allowFamilyHeadcount && (
              <Badge className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                <Users className="h-3 w-3 mr-1" />
                Family Headcount
              </Badge>
            )}
            {event?.limitEventCapacity && (
              <Badge className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                <Shield className="h-3 w-3 mr-1" />
                Capacity Limited
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="dark:text-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Response Selection */}
          <div>
            <Label className="text-sm font-semibold mb-4 block text-gray-800 dark:text-gray-200">
              Will you attend this event? *
            </Label>
            <div
              className={`grid gap-3 ${getResponseOptions().length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}
            >
              {getResponseOptions().map((option) => {
                const isSelected = formData.status === option.value;
                let buttonClasses =
                  'flex items-center gap-2 font-semibold transition-all duration-300 ';

                if (isSelected) {
                  if (option.value === 'CONFIRMED') {
                    buttonClasses +=
                      'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transform scale-105 border-green-600';
                  } else if (option.value === 'DECLINED') {
                    buttonClasses +=
                      'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transform scale-105 border-red-600';
                  } else if (option.value === 'MAYBE') {
                    buttonClasses +=
                      'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg transform scale-105 border-yellow-500';
                  }
                } else {
                  if (option.value === 'CONFIRMED') {
                    buttonClasses +=
                      'border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-green-700 hover:text-green-800';
                  } else if (option.value === 'DECLINED') {
                    buttonClasses +=
                      'border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 hover:text-red-800';
                  } else if (option.value === 'MAYBE') {
                    buttonClasses +=
                      'border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800';
                  }
                }

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    className={buttonClasses}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            {/* Email - Read Only */}
            <div>
              <Label className="text-sm font-medium dark:text-gray-200">
                Email Address *
                <span className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
                  (Invited to: {userGuest?.email || session?.user?.email})
                </span>
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  type="email"
                  value={userGuest?.email || session?.user?.email || ''}
                  disabled={true}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 dark:border-gray-600"
                  placeholder="Email address"
                />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                Email cannot be changed. Contact the host if this is incorrect.
              </p>
            </div>

            {/* Name - Editable */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
                Full Name *
                <span className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
                  (Invited as: {userGuest?.name || 'Not specified'})
                </span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                You can update your name if needed (e.g., preferred name,
                marriage name change).
              </p>
            </div>

            {/* Phone - Editable */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium dark:text-gray-200">
                Phone Number
                <span className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
                  (Optional - for event updates)
                </span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Enter your phone number"
                />
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                Provide your phone number for event updates and reminders.
              </p>
            </div>
          </div>

          {/* Plus Ones Section */}
          {event?.allowPlusOnes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Plus Ones
                </Label>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                You can bring up to {event.maxPlusOnes} additional guests
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleInputChange(
                      'plusOnes',
                      Math.max(0, formData.plusOnes - 1),
                    )
                  }
                  disabled={formData.plusOnes <= 0}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={formData.plusOnes}
                  onChange={(e) =>
                    handleInputChange('plusOnes', parseInt(e.target.value) || 0)
                  }
                  className="w-20 text-center dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  min="0"
                  max={event.maxPlusOnes}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleInputChange(
                      'plusOnes',
                      Math.min(event.maxPlusOnes, formData.plusOnes + 1),
                    )
                  }
                  disabled={formData.plusOnes >= event.maxPlusOnes}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  additional guests
                </span>
              </div>
            </div>
          )}

          {/* Family Headcount Section */}
          {event?.allowFamilyHeadcount && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <Label className="text-sm font-medium text-green-900 dark:text-green-300">
                  Family Headcount
                </Label>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                Please specify the number of adults and children attending
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-green-800 dark:text-green-300 mb-2 block">
                    Adults
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleInputChange(
                          'adults',
                          Math.max(1, formData.adults - 1),
                        )
                      }
                      disabled={formData.adults <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={formData.adults}
                      onChange={(e) =>
                        handleInputChange(
                          'adults',
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-20 text-center dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      min="1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleInputChange('adults', formData.adults + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-800 dark:text-green-300 mb-2 block">
                    Children
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleInputChange(
                          'children',
                          Math.max(0, formData.children - 1),
                        )
                      }
                      disabled={formData.children <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={formData.children}
                      onChange={(e) =>
                        handleInputChange(
                          'children',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-20 text-center dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      min="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleInputChange('children', formData.children + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Capacity Warning */}
          {event?.limitEventCapacity && event?.maxEventCapacity && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  This event has a capacity limit of {event.maxEventCapacity}{' '}
                  guests.
                </p>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <Label htmlFor="additionalNotes" className="text-sm font-medium dark:text-gray-200">
              Additional Notes
            </Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) =>
                handleInputChange('additionalNotes', e.target.value)
              }
              className="mt-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              placeholder="Any additional information, dietary requirements, or special requests..."
              rows={3}
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ RSVP submitted successfully! Thank you for your response.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            {isUpdatingResponse && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUpdatingResponse(false);
                  setFormData(prev => ({
                    ...prev,
                    status: userGuest.status,
                    response: userGuest.response,
                  }));
                }}
                className="flex-1"
              >
                Cancel Update
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.status || formData.status === 'PENDING'
              }
              className={isUpdatingResponse ? "flex-1" : "w-full"}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isUpdatingResponse ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                isUpdatingResponse ? 'Update RSVP' : 'Submit RSVP'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
