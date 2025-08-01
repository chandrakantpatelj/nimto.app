'use client';

import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Users = ({ title, items }) => {
  const renderItem = (item, index) => {
    return (
      <img
        src={toAbsoluteUrl(`/media/avatars/${item.image}`)}
        className="rounded-full h-[36px]"
        alt="image"
        key={index}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2.5 xl:me-16">
          {items.map((item, index) => {
            return renderItem(item, index);
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link href="/account/members/teams">Join Our Team</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Users };
