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
    <footer className="footer border-t bg-background">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1 gap-2 font-normal text-sm">
            <span className="text-muted-foreground">{currentYear} &copy;</span>
            <span className="text-secondary-foreground">Nimto</span>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            <Link
              href="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-conditions"
              className="hover:text-primary transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/contact-us"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/about-us"
              className="hover:text-primary transition-colors"
            >
              About Us
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
