'use client';

import { useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, Users, Database, Mail, Phone, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/app/components/layouts/demo1/components/header';

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: 'Overview', icon: Eye },
        { id: 'collection', title: 'Data Collection', icon: Database },
        { id: 'usage', title: 'Data Usage', icon: Users },
        { id: 'sharing', title: 'Data Sharing', icon: Users },
    { id: 'security', title: 'Security', icon: Lock },
        { id: 'retention', title: 'Data Retention', icon: Database },
        { id: 'rights', title: 'Your Rights', icon: Shield },
        { id: 'children', title: "Children's Privacy", icon: Users },
        { id: 'intl', title: 'International Users', icon: Globe },
        { id: 'changes', title: 'Changes to Policy', icon: Shield },
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
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
                            This Privacy Policy describes how Nimto, a product of Velstos LLC ("Velstos", "we", "us", or "our"), collects, uses, discloses, and safeguards your information when you use our event management and invitation platform. By using Nimto, you consent to the practices described in this policy.
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
                                                className="w-full justify-start"
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
                                        <Eye className="w-5 h-5 mr-2" />
                                        Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Velstos LLC ("Velstos") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Nimto. If you do not agree with our policies and practices, please do not use Nimto.
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Principles</h4>
                                        <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                                            <li>• We only collect information necessary to provide and improve our services</li>
                                            <li>• We never sell your personal information to third parties</li>
                                            <li>• We use industry-standard security measures to protect your data</li>
                                            <li>• You have rights and choices regarding your personal information</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Collection Section */}
                            <Card id="collection">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Database className="w-5 h-5 mr-2" />
                                        Information We Collect
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-3">Personal Information</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">Account Information</h5>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Name, email address, and contact details</li>
                                                    <li>• Profile picture (optional)</li>
                                                    <li>• Account preferences and settings</li>
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">Event Information</h5>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Event details and descriptions</li>
                                                    <li>• Guest lists and RSVP data</li>
                                                    <li>• Event images and designs</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-3">Technical & Usage Information</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">Usage Data</h5>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Pages visited and features used</li>
                                                    <li>• Time spent on our platform</li>
                                                    <li>• Device, browser, and operating system information</li>
                                                    <li>• IP address and log data</li>
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">Cookies & Analytics</h5>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    <li>• Session cookies for functionality</li>
                                                    <li>• Analytics and tracking data for improvements</li>
                                                    <li>• Preference and authentication cookies</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Usage Section */}
                            <Card id="usage">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        How We Use Your Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Service Provision</h4>
                                                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                                    <li>• Create and manage your events</li>
                                                    <li>• Send invitations and track RSVPs</li>
                                                    <li>• Provide customer support</li>
                                                    <li>• Process payments securely</li>
                                                    <li>• Communicate with you about your account or services</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Platform Improvement & Compliance</h4>
                                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                    <li>• Analyze usage patterns and improve user experience</li>
                                                    <li>• Develop new features and services</li>
                                                    <li>• Ensure platform security and prevent fraud</li>
                                                    <li>• Comply with legal obligations and enforce our Terms</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Sharing Section */}
                            <Card id="sharing">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Information Sharing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">We DO NOT sell your personal information</h4>
                                        <p className="text-red-800 dark:text-red-200 text-sm">
                                            We never sell, rent, or trade your personal information to third parties for marketing purposes.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-3">Limited Sharing Scenarios</h4>
                                        <div className="space-y-4">
                                            <div className="border-l-4 border-blue-500 pl-4">
                                                <h5 className="font-medium">Service Providers</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    We may share information with trusted third-party service providers who help us operate our platform (e.g., email delivery, payment processing, analytics). These providers are contractually obligated to protect your information and use it only for the services we request.
                                                </p>
                                            </div>
                                            <div className="border-l-4 border-green-500 pl-4">
                                                <h5 className="font-medium">Legal Requirements</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    We may disclose information when required by law, court order, or to protect our rights, property, or safety, or that of our users or others.
                                                </p>
                                            </div>
                                            <div className="border-l-4 border-purple-500 pl-4">
                                                <h5 className="font-medium">Business Transfers</h5>
                                                <p className="text-sm text-muted-foreground">
                                                    In the event of a merger, acquisition, or sale of all or a portion of our assets, user information may be transferred as part of the business assets, subject to the promises made in this Privacy Policy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Section */}
                            <Card id="security">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Lock className="w-5 h-5 mr-2" />
                                        Data Security
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Technical Safeguards</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    SSL/TLS encryption for data transmission
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Encrypted data storage
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Regular security audits and vulnerability assessments
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                    Access controls and monitoring
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Operational Safeguards</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Employee training on data protection
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Incident response procedures
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Regular backup and recovery testing
                                                </li>
                                                <li className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    Vendor security assessments
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 mt-4">
                                        <h5 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">No Guarantee</h5>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            While we take reasonable measures to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Retention Section */}
                            <Card id="retention">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Database className="w-5 h-5 mr-2" />
                                        Data Retention
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        We retain your personal information only as long as necessary to fulfill the purposes described in this Privacy Policy, comply with our legal obligations, resolve disputes, and enforce our agreements. When your information is no longer needed, we will securely delete or anonymize it.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Your Rights Section */}
                            <Card id="rights">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Your Rights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground">
                                        Depending on your location, you may have certain rights regarding your personal information, including:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Access Your Data</h5>
                                                <p className="text-sm text-muted-foreground">Request a copy of your personal information</p>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Update Information</h5>
                                                <p className="text-sm text-muted-foreground">Correct or update your personal details</p>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Delete Account</h5>
                                                <p className="text-sm text-muted-foreground">Request deletion of your account and data</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Data Portability</h5>
                                                <p className="text-sm text-muted-foreground">Export your data in a common format</p>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Opt-out</h5>
                                                <p className="text-sm text-muted-foreground">Unsubscribe from marketing communications</p>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <h5 className="font-medium mb-1">Restrict Processing</h5>
                                                <p className="text-sm text-muted-foreground">Limit how we use your information</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        To exercise your rights, please contact us using the information below. We may need to verify your identity before processing your request.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Children's Privacy Section */}
                            <Card id="children">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Children's Privacy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Nimto is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly. If you believe a child has provided us with personal information, please contact us immediately.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* International Users Section */}
                            <Card id="intl">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Globe className="w-5 h-5 mr-2" />
                                        International Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        If you access Nimto from outside the United States, you understand and agree that your information may be transferred to, stored, and processed in the United States or other countries where Velstos LLC or its service providers operate. Data protection laws in these countries may differ from those in your jurisdiction.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Changes to Policy Section */}
                            <Card id="changes">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Changes to This Privacy Policy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        Velstos LLC may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date. Your continued use of Nimto after any changes constitutes your acceptance of the revised policy.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Contact Section */}
                            <Card id="contact">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Mail className="w-5 h-5 mr-2" />
                                        Contact Us
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-muted-foreground">
                                        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact Velstos LLC:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Email</p>
                                                    <p className="text-sm text-muted-foreground">privacy@velstos.com</p>
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
                                                <Link href="/terms-conditions">Terms & Conditions</Link>
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