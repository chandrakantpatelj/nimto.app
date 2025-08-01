'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const OpenToWork = ({ className, title }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-5.5">
          Seasoned UI/UX designer with a flair for user-centric interfaces.
          Let's create something amazing together!
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link href="/public-profile/works">View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { OpenToWork };
