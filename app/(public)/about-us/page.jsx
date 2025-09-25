'use client';

import { useState } from 'react';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Globe, 
  Lightbulb, 
  Shield, 
  Zap,
  Mail,
  Linkedin,
  Twitter,
  Github,
  Calendar,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/app/components/layouts/demo1/components/header';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const tabs = [
    { id: 'mission', label: 'Our Mission', icon: Target },
    { id: 'story', label: 'Our Story', icon: Heart },
    { id: 'team', label: 'Our Team', icon: Users },
    { id: 'values', label: 'Our Values', icon: Award },
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/300/300',
      bio: 'Passionate about connecting people through technology. 10+ years in event management.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: '/api/placeholder/300/300',
      bio: 'Full-stack developer with expertise in scalable web applications and user experience.',
      linkedin: '#',
      github: '#'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      image: '/api/placeholder/300/300',
      bio: 'Creative director focused on making beautiful, intuitive user experiences.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'David Kim',
      role: 'Head of Marketing',
      image: '/api/placeholder/300/300',
      bio: 'Growth expert with a passion for building communities and brand awareness.',
      linkedin: '#',
      twitter: '#'
    }
  ];

  const values = [
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Everything we do is designed with our users in mind. We listen, learn, and iterate based on your feedback.',
      color: 'blue'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push boundaries to create cutting-edge solutions that make event management effortless.',
      color: 'yellow'
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Your data and privacy are our top priorities. We implement industry-leading security measures.',
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'We believe technology should be accessible to everyone, regardless of their technical background.',
      color: 'purple'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Events Created', icon: Calendar },
    { number: '1M+', label: 'Invitations Sent', icon: Mail },
    { number: '99.9%', label: 'Uptime', icon: Zap },
    { number: '24/7', label: 'Support', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex flex-col">
      <Header />
      <Container>
        <div className="py-12 pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Nimto</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            We're on a mission to make every event memorable by providing the tools and technology 
            that bring people together in meaningful ways.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              Founded in 2023
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Remote-First Company
            </Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabbed Content */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'mission' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Our Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      To democratize event management by providing intuitive, powerful tools that make it easy 
                      for anyone to create, manage, and share beautiful events that bring people together.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What We Believe</h4>
                      <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                        <li>• Every event deserves to be special and memorable</li>
                        <li>• Technology should enhance, not complicate, human connections</li>
                        <li>• Beautiful design and powerful functionality can coexist</li>
                        <li>• Everyone should have access to professional-quality event tools</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Our Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      To become the world's leading platform for event management, empowering millions of people 
                      to create meaningful connections and unforgettable experiences.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Global reach with local understanding</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Innovation that serves real human needs</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm">Sustainable growth and positive impact</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'story' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Our Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground mb-4">
                        Nimto was born from a simple frustration: why was it so hard to create beautiful, 
                        professional event invitations that actually worked well?
                      </p>
                      <p className="text-muted-foreground mb-4">
                        Our founder, Sarah, was planning her wedding and found herself juggling multiple 
                        tools, dealing with clunky interfaces, and spending more time fighting with 
                        technology than enjoying the planning process.
                      </p>
                      <p className="text-muted-foreground mb-4">
                        That's when the idea for Nimto was born. We set out to create a platform that 
                        would make event management not just easier, but actually enjoyable.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">2023</h3>
                      <p className="text-sm text-muted-foreground">Company founded with a vision to revolutionize event management</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">2024</h3>
                      <p className="text-sm text-muted-foreground">Launched beta platform with 1,000+ early adopters</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">2025</h3>
                      <p className="text-sm text-muted-foreground">Public launch with 50,000+ events created</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Meet Our Team
                    </CardTitle>
                    <p className="text-muted-foreground">
                      We're a diverse group of passionate individuals united by our mission to make events better.
                    </p>
                  </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((member) => (
                    <Card key={member.name} className="text-center">
                      <CardContent className="pt-6">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="font-semibold mb-1">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                        <p className="text-xs text-muted-foreground mb-4">{member.bio}</p>
                        <div className="flex justify-center space-x-2">
                          {member.linkedin && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={member.linkedin}>
                                <Linkedin className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                          {member.twitter && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={member.twitter}>
                                <Twitter className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                          {member.github && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={member.github}>
                                <Github className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Our Values
                    </CardTitle>
                    <p className="text-muted-foreground">
                      These core values guide everything we do, from product development to customer service.
                    </p>
                  </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  {values.map((value) => {
                    const Icon = value.icon;
                    return (
                      <Card key={value.title}>
                        <CardContent className="pt-6">
                          <div className={`w-12 h-12 bg-${value.color}-100 dark:bg-${value.color}-900/30 rounded-lg flex items-center justify-center mb-4`}>
                            <Icon className={`w-6 h-6 text-${value.color}-600`} />
                          </div>
                          <h3 className="font-semibold mb-2">{value.title}</h3>
                          <p className="text-sm text-muted-foreground">{value.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Get in Touch</CardTitle>
            <p className="text-center text-muted-foreground">
              Want to learn more about Nimto or join our team? We'd love to hear from you.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">General Inquiries</h3>
                <p className="text-sm text-muted-foreground mb-4">info@nimto.app</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact-us">Contact Us</Link>
                </Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Careers</h3>
                <p className="text-sm text-muted-foreground mb-4">Join our growing team</p>
                <Button variant="outline" size="sm">
                  View Openings
                </Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Partnerships</h3>
                <p className="text-sm text-muted-foreground mb-4">Let's work together</p>
                <Button variant="outline" size="sm">
                  Partner With Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Amazing Events?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of users who trust Nimto to make their events unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                  <Link href="/contact-us">Schedule Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </Container>
    </div>
  );
}
