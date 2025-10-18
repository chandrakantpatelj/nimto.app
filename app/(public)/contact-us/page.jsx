'use client';

import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useToast } from '@/providers/toast-provider';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageSquare,
    Send,
    CheckCircle,
    AlertCircle,
    Headphones,
    HelpCircle,
    Bug,
    Lightbulb
} from 'lucide-react';
import { Header } from '@/app/components/layouts/demo1/components/header';

const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'support', label: 'Technical Support', icon: Headphones },
    { value: 'billing', label: 'Billing Question', icon: HelpCircle },
    { value: 'bug', label: 'Report a Bug', icon: Bug },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb },
];

function ContactForm({ onSubmit, isSubmitting, submitStatus, formData, setFormData }) {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Basic client-side validation
    const validateForm = () => {
        if (!formData.name.trim()) return 'Name is required.';
        if (!formData.email.trim()) return 'Email is required.';
        if (!formData.subject.trim()) return 'Subject is required.';
        if (!formData.message.trim()) return 'Message is required.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMsg = validateForm();
        if (errorMsg) {
            onSubmit(null, errorMsg);
            return;
        }

        if (!executeRecaptcha) {
            onSubmit(null, 'reCAPTCHA is not ready. Please try again.');
            return;
        }

        try {
            const token = await executeRecaptcha('contact_form');
            await onSubmit(token);
        } catch (error) {
            onSubmit(null, 'Failed to verify reCAPTCHA.');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                </p>
            </CardHeader>
            <CardContent>
                {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <p className="text-green-800 dark:text-green-200 font-medium">
                                Message sent successfully! We'll get back to you within 24 hours.
                            </p>
                        </div>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800 dark:text-red-200 font-medium">
                                There was an error sending your message. Please try again.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="inquiryType">Type of Inquiry</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {inquiryTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <label
                                        key={type.value}
                                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${formData.inquiryType === type.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="inquiryType"
                                            value={type.value}
                                            checked={formData.inquiryType === type.value}
                                            onChange={handleInputChange}
                                            className="sr-only"
                                        />
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm">{type.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Brief description of your inquiry"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Please provide as much detail as possible..."
                            rows={6}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sending Message...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const { toastSuccess, toastWarning, toastError } = useToast();

    // Handles form submission and toast notifications
    const handleFormSubmit = async (recaptchaToken, clientError) => {
        if (clientError) {
            setSubmitStatus('error');
            toastError(clientError);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, recaptchaToken }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    inquiryType: 'general'
                });
                toastSuccess('Message sent successfully!');
            } else {
                setSubmitStatus('error');
                toastError(data.error || 'There was an error sending your message.');
            }
        } catch (error) {
            setSubmitStatus('error');
            toastError('There was an error sending your message.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_V3_RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
        >
            <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex flex-col">
                <Header />
                <Container>
                    <div className="py-6">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <Badge variant="secondary" className="px-4 py-2">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Response within 24 hours
                                </Badge>
                                <Badge variant="outline" className="px-4 py-2">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Available 7 days a week
                                </Badge>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Contact Information */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* ...contact info cards unchanged... */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Mail className="w-5 h-5 mr-2" />
                                            Get in Touch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                                                <div>
                                                    <p className="font-medium">Email</p>
                                                    <p className="text-sm text-muted-foreground">contact@nimto.io</p>
                                                    <p className="text-xs text-muted-foreground">For general inquiries</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                                                <div>
                                                    <p className="font-medium">Phone</p>
                                                    <p className="text-sm text-muted-foreground">+1 (704) 270-8407</p>
                                                    <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                                                <div>
                                                    <p className="font-medium">Address</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Huntersville, NC 28078 <br />
                                                        USA
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Clock className="w-5 h-5 mr-2" />
                                            Business Hours
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Monday - Friday</span>
                                            <span className="text-sm font-medium">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Saturday</span>
                                            <span className="text-sm font-medium">10:00 AM - 4:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">Sunday</span>
                                            <span className="text-sm font-medium">Closed</span>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <p className="text-xs text-muted-foreground">
                                                All times are in Eastern Standard Time (EST)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* FAQ Section */}
                                <Card className="mt-8">
                                    <CardHeader>
                                        <CardTitle>Frequently Asked Questions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="border-l-4 border-blue-500 pl-4">
                                                <h4 className="font-medium">How quickly do you respond?</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    We typically respond to all inquiries within 24 hours during business days.
                                                </p>
                                            </div>
                                            <div className="border-l-4 border-green-500 pl-4">
                                                <h4 className="font-medium">Do you offer phone support?</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Yes, we offer phone support Monday through Friday, 9 AM to 6 PM EST.
                                                </p>
                                            </div>
                                            <div className="border-l-4 border-purple-500 pl-4">
                                                <h4 className="font-medium">Can I schedule a demo?</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Absolutely! Contact us to schedule a personalized demo of our platform.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <ContactForm
                                    onSubmit={handleFormSubmit}
                                    isSubmitting={isSubmitting}
                                    submitStatus={submitStatus}
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </GoogleReCaptchaProvider>
    );
}