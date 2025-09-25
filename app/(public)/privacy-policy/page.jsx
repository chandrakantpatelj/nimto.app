'use client';

import { useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, Users, Database, Mail, Phone, MapPin } from 'lucide-react';
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
    { id: 'rights', title: 'Your Rights', icon: Shield },
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
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                  At Nimto, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                  event management and invitation platform.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Key Principles</h4>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• We only collect information necessary to provide our services</li>
                    <li>• We never sell your personal information to third parties</li>
                    <li>• We use industry-standard security measures to protect your data</li>
                    <li>• You have control over your personal information</li>
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
                        <li>• Name and email address</li>
                        <li>• Profile picture (optional)</li>
                        <li>• Account preferences</li>
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
                  <h4 className="font-semibold mb-3">Technical Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Usage Data</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Pages visited and features used</li>
                        <li>• Time spent on our platform</li>
                        <li>• Device and browser information</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Cookies & Analytics</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Session cookies for functionality</li>
                        <li>• Analytics data for improvements</li>
                        <li>• Preference cookies</li>
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
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Platform Improvement</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Analyze usage patterns</li>
                        <li>• Improve user experience</li>
                        <li>• Develop new features</li>
                        <li>• Ensure platform security</li>
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
                        We may share information with trusted third-party service providers who help us operate our platform 
                        (e.g., email delivery, payment processing, analytics).
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium">Legal Requirements</h5>
                      <p className="text-sm text-muted-foreground">
                        We may disclose information when required by law, court order, or to protect our rights and safety.
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium">Business Transfers</h5>
                      <p className="text-sm text-muted-foreground">
                        In the event of a merger or acquisition, user information may be transferred as part of the business assets.
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
                        Regular security audits
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
                  You have several rights regarding your personal information. You can exercise these rights at any time.
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
                  If you have any questions about this Privacy Policy or want to exercise your rights, please contact us.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">privacy@nimto.app</p>
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
                          123 Innovation Drive<br />
                          Tech City, TC 12345
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
