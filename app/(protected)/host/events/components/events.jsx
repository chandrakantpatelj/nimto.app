'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Earth,
  Pencil,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Events = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const renderData = (template, index) => {
    return (
      <Card className={`rounded-xl relative `}>
        <div className="flex flex-col gap-2 justify-between h-100">
          <div className=" min-h-32 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl">
            <img
              src={toAbsoluteUrl('/media/products/1.jpg')}
              className="w-full "
              alt={'test sdbajd'}
            />
          </div>
          <div className="p-4 relative">
            <span className="text-lg text-dark font-media/brand text-mono hover:text-primary-active mb-px">
              Sijans birthday
            </span>
            <div className="absolute top-4 right-4 flex gap-1">
              <Button variant="softPrimary" mode="icon">
                <Pencil className="text-primary" />
              </Button>

              <Button variant="softDanger" mode="icon">
                <Trash2 className="text-red-500" />
              </Button>
            </div>

            <div className="flex items-center  mt-3">
              <CalendarCheck className="w-5 h-5 mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                26/10/2025
              </span>
            </div>

            <div className="flex items-center  mt-1">
              <Users className="w-5 h-5  mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                0 Accepted / 1 Invited
              </span>
            </div>
            <div className="flex gap-2 items-center justify-between mt-3">
              <Button
                variant="secondary"
                mode="default"
                size="md"
                onClick={() => router.push('/host/events/45566/guest')}
                className="mx-auto w-full max-w-50"
              >
                <Users />
                Manage Guests
              </Button>

              <Button
                variant="outline"
                mode="primary"
                size="md"
                onClick={() => router.push(`/host/events`)}
                className="mx-auto w-full max-w-50"
              >
                <Earth />
                Public Page
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search your events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 w-95"
          />
        </div>

        <div id="projects_cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
            {renderData()}
          </div>
          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Button mode="link" underlined="dashed" asChild>
              <Link href="#">Show more events</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;
