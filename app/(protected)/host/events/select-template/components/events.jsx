'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SelectEvents = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 w-95"
          />
        </div>

        <div id="projects_cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
            <Card className="rounded-xl  group overflow-hidden">
              <div className="flex flex-col gap-2 justify-between h-100">
                <div className=" min-h-26 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl relative">
                  <img
                    src={toAbsoluteUrl('/media/products/1.jpg')}
                    className="w-full rounded-tr-xl rounded-tl-xl"
                    alt="test sdbajd"
                  />

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="primary" asChild>
                      <Link href="/events/design/64584">Select Template</Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4 relative">
                  <h3 className="text-lg font-semibold mt-2">
                    Tech Innovators Conference 2024
                  </h3>

                  <span className="text-sm font-medium text-secondary-foreground">
                    Conference
                  </span>

                  <div className="text-sm font-medium text-purple-600">
                    Premium
                  </div>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl  group overflow-hidden">
              <div className="flex flex-col gap-2 justify-between h-100">
                <div className=" min-h-26 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl relative">
                  <img
                    src={toAbsoluteUrl('/media/products/2.jpg')}
                    className="w-full rounded-tr-xl rounded-tl-xl"
                    alt="test sdbajd"
                  />

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="primary" asChild>
                      <Link href="/events/design/64584">Select Template</Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4 relative">
                  <h3 className="text-lg font-semibold mt-2">
                    Tech Innovators Conference 2024
                  </h3>

                  <span className="text-sm font-medium text-secondary-foreground">
                    Conference
                  </span>

                  <div className="text-sm font-medium text-purple-600">
                    Premium
                  </div>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl  group overflow-hidden">
              <div className="flex flex-col gap-2 justify-between h-100">
                <div className=" min-h-26 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl relative">
                  <img
                    src={toAbsoluteUrl('/media/products/3.jpg')}
                    className="w-full rounded-tr-xl rounded-tl-xl"
                    alt="test sdbajd"
                  />

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="primary" asChild>
                      <Link href="/events/design/64584">Select Template</Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4 relative">
                  <h3 className="text-lg font-semibold mt-2">
                    Tech Innovators Conference 2024
                  </h3>

                  <span className="text-sm font-medium text-secondary-foreground">
                    Conference
                  </span>

                  <div className="text-sm font-medium text-purple-600">
                    Premium
                  </div>
                </div>
              </div>
            </Card>
            <Card className="rounded-xl  group overflow-hidden">
              <div className="flex flex-col gap-2 justify-between h-100">
                <div className=" min-h-26 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl relative">
                  <img
                    src={toAbsoluteUrl('/media/products/4.jpg')}
                    className="w-full rounded-tr-xl rounded-tl-xl"
                    alt="test sdbajd"
                  />

                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="primary" asChild>
                      <Link href="/events/design/64584">Select Template</Link>
                    </Button>
                  </div>
                </div>

                <div className="p-4 relative">
                  <h3 className="text-lg font-semibold mt-2">
                    Tech Innovators Conference 2024
                  </h3>

                  <span className="text-sm font-medium text-secondary-foreground">
                    Conference
                  </span>

                  <div className="text-sm font-medium text-purple-600">
                    Premium
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Button mode="link" underlined="dashed" asChild>
              <Link href="#">Show more templates</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectEvents;
