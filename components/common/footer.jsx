'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/container';

export function CommonFooter() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className="footer border-t bg-background mt-auto">
      <Container>
        {/* Main Footer Content */}
        <div className="py-8 md:py-12">
          {/* Links Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-conditions"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact-us"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/templates"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about-us"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-border pt-6 md:pt-8">
            {/* Bottom Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
                <span>{currentYear} &copy; Nimto. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span>Made with ❤️ for event creators</span>
              </div>
              
              {/* Social Links (Optional - can be added later) */}
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy-policy"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms-conditions"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/contact-us"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
