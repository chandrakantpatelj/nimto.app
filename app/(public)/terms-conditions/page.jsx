'use client';

import { useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Scale, Users, Shield, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react';
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
            Please read these terms carefully before using our platform. By using Nimto, you agree to be bound by these terms.
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
                  Welcome to Nimto! These Terms and Conditions ("Terms") govern your use of our event management and invitation platform. 
                  By accessing or using our services, you agree to be bound by these Terms.
                </p>
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Important Notice</h4>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    These terms constitute a legally binding agreement between you and Nimto. Please read them carefully and 
                    contact us if you have any questions.
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
                  By accessing and using Nimto, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Agreement to Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Updates to Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      We may update these Terms from time to time. Continued use of our services constitutes acceptance of updated Terms.
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
                  Nimto provides a comprehensive platform for creating, managing, and sharing event invitations and related services.
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
                  <h4 className="font-semibold">Account Creation</h4>
                  <p className="text-muted-foreground text-sm">
                    To access certain features of our platform, you may need to create an account. You are responsible for 
                    maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Responsibilities</h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Provide accurate and complete information</li>
                      <li>• Keep your password secure</li>
                      <li>• Notify us of any unauthorized access</li>
                      <li>• Comply with all applicable laws</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Account Security</h5>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• Use strong, unique passwords</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Log out from shared devices</li>
                      <li>• Report suspicious activity</li>
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
                    You retain ownership of content you create and upload to our platform. By using our services, you grant us 
                    a license to use, display, and distribute your content as necessary to provide our services.
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
                        You can delete your content anytime
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Our Rights</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        We own our platform and technology
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        We provide templates and designs
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        We may use aggregated data for improvements
                      </li>
                    </ul>
                  </div>
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
                    Some features of our platform may require payment. All fees are clearly displayed before purchase, 
                    and payments are processed securely through our payment partners.
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
                      <li>• 30-day money-back guarantee</li>
                      <li>• Refunds processed within 5-7 business days</li>
                      <li>• Contact support for refund requests</li>
                      <li>• Some restrictions may apply</li>
                    </ul>
                  </div>
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
                  Your privacy is important to us. Our collection and use of personal information is governed by our 
                  Privacy Policy, which is incorporated into these Terms by reference.
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
                  <h4 className="font-semibold">Service Availability</h4>
                  <p className="text-muted-foreground text-sm">
                    While we strive to provide reliable service, we cannot guarantee uninterrupted access. Our platform 
                    is provided "as is" without warranties of any kind.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-semibold mb-2">Our Limitations</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• No guarantee of service availability</li>
                      <li>• Limited liability for indirect damages</li>
                      <li>• No responsibility for third-party content</li>
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
                    Either party may terminate this agreement at any time. Upon termination, your access to our services 
                    will cease, and we may delete your account and data.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">We May Terminate If</h5>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• You violate these Terms</li>
                      <li>• You engage in fraudulent activity</li>
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
                      <li>• Simply stopping use of our services</li>
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
                  If you have any questions about these Terms and Conditions, please contact us using the information below.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">legal@nimto.io</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
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
