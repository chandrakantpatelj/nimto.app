'use client';

import { useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Scale, Users, Shield, AlertTriangle, Mail, Phone, MapPin, Gavel } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/app/components/layouts/demo1/components/header';

export default function TermsConditionsPage() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: 'Overview', icon: FileText },
        { id: 'acceptance', title: 'Acceptance', icon: Scale },
        { id: 'services', title: 'Services', icon: Users },
        { id: 'user-accounts', title: 'User Accounts', icon: Users },
        { id: 'content', title: 'Content & IP', icon: Shield },
        { id: 'payments', title: 'Payments', icon: Scale },
        { id: 'privacy', title: 'Privacy', icon: Shield },
        { id: 'liability', title: 'Liability', icon: AlertTriangle },
        { id: 'indemnification', title: 'Indemnification', icon: Shield },
        { id: 'governing-law', title: 'Governing Law', icon: Gavel },
        { id: 'termination', title: 'Termination', icon: AlertTriangle },
        { id: 'contact', title: 'Contact', icon: Mail },
    ];

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex flex-col">
            <Header />
            <Container>
                <div className="py-12 pt-24">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                            Please read these Terms and Conditions ("Terms") carefully before using the Nimto platform. By accessing or using Nimto, you agree to be legally bound by these Terms, our Privacy Policy, and any other policies referenced herein. Nimto is a product and service provided by Velstos LLC ("Velstos", "we", "us", or "our").
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Badge variant="secondary" className="px-4 py-2">
                                Last updated: {new Date().toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="px-4 py-2">
                                Effective immediately
                            </Badge>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Navigation Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Navigation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {sections.map((section) => {
                                        const Icon = section.icon;
                                        return (
                                            <Button
                                                key={section.id}
                                                variant={activeSection === section.id ? "default" : "ghost"}
                                                className="w-full justify-start text-sm"
                                                onClick={() => scrollToSection(section.id)}
                                            >
                                                <Icon className="w-4 h-4 mr-2" />
                                                {section.title}
                                            </Button>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Overview Section */}
                            <Card id="overview">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Welcome to Nimto, a digital event management and invitation platform developed and operated by Velstos LLC, a North Carolina limited liability company. These Terms and Conditions ("Terms") govern your use of Nimto. If you do not agree to these Terms, you must not use our services.
                                    </p>
                                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Relationship to Velstos LLC</h4>
                                        <p className="text-green-800 dark:text-green-200 text-sm">
                                            Nimto is owned and operated by Velstos LLC. All references to "Nimto" in these Terms refer to the service provided by Velstos LLC. All rights, obligations, and liabilities under these Terms are those of Velstos LLC.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Acceptance Section */}
                            <Card id="acceptance">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Scale className="w-5 h-5 mr-2" />
                                        Acceptance of Terms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        By accessing or using Nimto, you represent and warrant that you are at least 18 years old or have the legal capacity to enter into these Terms. If you are using Nimto on behalf of an organization, you represent that you have authority to bind that organization to these Terms. These Terms constitute a binding agreement between you and Velstos LLC.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">Agreement to Terms</h4>
                                            <p className="text-sm text-muted-foreground">
                                                By using Nimto, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as any additional terms and policies referenced herein, including those of Velstos LLC.
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold mb-2">Modifications to Terms</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Velstos LLC reserves the right to update or modify these Terms at any time. We will notify users of material changes. Continued use of Nimto after changes become effective constitutes acceptance of the revised Terms.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Services Section */}
                            <Card id="services">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Our Services
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground">
                                        Nimto, provided by Velstos LLC, offers a platform for creating, managing, and sharing event invitations, as well as related services and features. Velstos LLC reserves the right to modify, suspend, or discontinue any part of Nimto at any time, with or without notice.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Core Services</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Event invitation creation and management
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    RSVP tracking and guest management
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Template library and customization tools
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Digital invitation delivery
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Additional Features</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Event analytics and reporting
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Integration with calendar systems
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Mobile-responsive design
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Customer support services
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Accounts Section */}
                            <Card id="user-accounts">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        User Accounts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Account Creation & Security</h4>
                                        <p className="text-muted-foreground text-sm">
                                            To access certain features, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Velstos LLC is not liable for any loss or damage arising from your failure to comply with these requirements.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Responsibilities</h5>
                                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                <li>• Provide accurate and complete information</li>
                                                <li>• Keep your password secure</li>
                                                <li>• Notify Velstos LLC immediately of any unauthorized access or security breach</li>
                                                <li>• Comply with all applicable laws and regulations</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                            <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Account Security</h5>
                                            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                                <li>• Use strong, unique passwords</li>
                                                <li>• Enable two-factor authentication where available</li>
                                                <li>• Log out from shared devices</li>
                                                <li>• Report suspicious activity promptly</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content & IP Section */}
                            <Card id="content">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Content & Intellectual Property
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Your Content</h4>
                                        <p className="text-muted-foreground text-sm">
                                            You retain ownership of content you create and upload to Nimto. By using Nimto, you grant Velstos LLC a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content as necessary to provide our services.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Your Rights</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    You own your original content
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    You control how your content is used
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    You can delete your content at any time
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Our Rights</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Velstos LLC owns Nimto, its platform, technology, and all related intellectual property
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    We provide templates and designs for your use
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    We may use aggregated, anonymized data to improve our services
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                        <h5 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Prohibited Content</h5>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            You may not upload, post, or share any content that is unlawful, infringing, defamatory, obscene, or otherwise violates any law or the rights of others. Velstos LLC reserves the right to remove any content that violates these Terms or is otherwise objectionable, at our sole discretion.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                        <h5 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Prohibited Content</h5>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            You may not upload, post, or share any content that is unlawful, infringing, defamatory, obscene, or otherwise violates any law or the rights of others. Velstos LLC reserves the right to remove any content that violates these Terms or is otherwise objectionable, at our sole discretion.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 mt-4">
                                        <h5 className="font-semibold mb-2 text-red-900 dark:text-red-100">Prohibition on Selling Templates</h5>
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            The sale, resale, distribution, or reproduction of any template provided by Nimto, whether in digital or physical form, is strictly prohibited unless you have received explicit written permission from Velstos LLC through a valid buyout license agreement. This includes, but is not limited to, making digital copies, printed copies, or otherwise transferring templates to third parties for commercial purposes. Any unauthorized sale, copying, or distribution of Nimto templates constitutes a violation of these Terms and may result in immediate termination of your account, as well as legal action against you. Velstos LLC reserves all rights to pursue any and all remedies available under the law for such violations.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payments Section */}
                            <Card id="payments">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Scale className="w-5 h-5 mr-2" />
                                        Payments & Billing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Payment Terms</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Some features of Nimto may require payment. All fees are clearly displayed before purchase, and payments are processed securely through our payment partners. By making a purchase, you agree to pay all applicable fees and taxes to Velstos LLC.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-semibold mb-2">Billing</h5>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Fees are charged in advance</li>
                                                <li>• All prices include applicable taxes</li>
                                                <li>• Payment methods are securely stored</li>
                                                <li>• Receipts are provided for all transactions</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-semibold mb-2">Refunds</h5>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• 30-day money-back guarantee (where applicable)</li>
                                                <li>• Refunds processed within 5-7 business days</li>
                                                <li>• Contact support for refund requests</li>
                                                <li>• Some restrictions may apply</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                        <h5 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">SMS/Text Message Charges</h5>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            By using Nimto’s services, you acknowledge and accept that your mobile carrier may charge you for any text messages (SMS) you receive from or send in reply to the phone number used by Nimto for notifications. These charges are your sole responsibility and are billed by your carrier, not by Velstos LLC. Please check with your mobile service provider for details on your messaging plan and applicable rates.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Privacy Section */}
                            <Card id="privacy">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Privacy & Data Protection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Your privacy is important to Velstos LLC. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using Nimto, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Privacy Points</h4>
                                        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                                            <li>• We never sell your personal information</li>
                                            <li>• We use industry-standard security measures</li>
                                            <li>• You control your data and can delete it anytime</li>
                                            <li>• We comply with applicable privacy laws</li>
                                        </ul>
                                    </div>
                                    <Button asChild variant="outline">
                                        <Link href="/privacy-policy">Read Full Privacy Policy</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Liability Section */}
                            <Card id="liability">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        Limitation of Liability
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Important Legal Notice</h4>
                                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                            Please read this section carefully as it limits our liability and your rights.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Service Availability & Disclaimer</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Nimto is provided "as is" and "as available" without warranties of any kind, either express or implied. Velstos LLC does not guarantee that the platform will be uninterrupted, error-free, or secure. To the fullest extent permitted by law, Velstos LLC and its affiliates, officers, employees, and agents disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-semibold mb-2">Our Limitations</h5>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• No guarantee of service availability</li>
                                                <li>• Limited liability for indirect, incidental, special, consequential, or punitive damages</li>
                                                <li>• No responsibility for third-party content or services</li>
                                                <li>• Service provided "as is"</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="font-semibold mb-2">Your Responsibilities</h5>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• Use the service responsibly</li>
                                                <li>• Comply with all applicable laws</li>
                                                <li>• Respect others' intellectual property</li>
                                                <li>• Report any issues promptly</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-700">
                                        <h5 className="font-semibold mb-2 text-red-900 dark:text-red-100">Limitation of Damages</h5>
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            To the maximum extent permitted by law, Velstos LLC’s total liability to you for any claim arising out of or relating to these Terms or your use of Nimto shall not exceed the amount you paid, if any, to Velstos LLC in the 12 months preceding the claim.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Indemnification Section */}
                            <Card id="indemnification">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Indemnification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        You agree to indemnify, defend, and hold harmless Velstos LLC and its affiliates, officers, agents, and employees from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney’s fees) arising from: (i) your use of and access to Nimto; (ii) your violation of any term of these Terms; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that your content caused damage to a third party.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Governing Law Section */}
                            <Card id="governing-law">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Gavel className="w-5 h-5 mr-2" />
                                        Dispute Resolution & Governing Law
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        These Terms and any dispute arising out of or relating to them shall be governed by and construed in accordance with the laws of the State of North Carolina, United States, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in Mecklenburg County, North Carolina, and you consent to the personal jurisdiction and venue of such courts.
                                    </p>
                                    <p className="text-muted-foreground">
                                        If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Termination Section */}
                            <Card id="termination">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        Termination
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Account Termination</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Either party may terminate this agreement at any time. Upon termination, your access to Nimto will cease, and Velstos LLC may delete your account and data, subject to our Privacy Policy and applicable law.
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                            <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">We May Terminate If</h5>
                                            <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                                                <li>• You violate these Terms</li>
                                                <li>• You engage in fraudulent or illegal activity</li>
                                                <li>• You abuse our services</li>
                                                <li>• Required by law or regulation</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                            <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">You Can Terminate By</h5>
                                            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                                <li>• Deleting your account</li>
                                                <li>• Contacting customer support</li>
                                                <li>• Canceling your subscription</li>
                                                <li>• Ceasing use of our services</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Section */}
                            <Card id="contact">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Mail className="w-5 h-5 mr-2" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground">
                                        If you have any questions about these Terms and Conditions, please contact Velstos LLC using the information below.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Email</p>
                                                    <p className="text-sm text-muted-foreground">legal@velstos.com</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Phone</p>
                                                    <p className="text-sm text-muted-foreground">+1 (704) 270-8407</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Address</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Huntersville, NC 28078<br />
                                                        USA
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Button asChild className="w-full">
                                                <Link href="/contact-us">Contact Support</Link>
                                            </Button>
                                            <Button variant="outline" asChild className="w-full">
                                                <Link href="/privacy-policy">Privacy Policy</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}