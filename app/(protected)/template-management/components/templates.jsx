'use client';

import Link from 'next/link';
import { Search, Trash2 } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const Templates = () => {
  const projects = [
    {
      logo: 'template-img.png',
      name: 'Birthday Bash',
      description: 'Birthday',
    },
    {
      logo: 'template-img.png',
      name: 'Conference Announcement',
      description: 'Conference',
    },
    {
      logo: 'template-img.png',
      name: 'Elegant Night Gala',
      description: 'Gala',
    },
    {
      logo: 'template-img.png',
      name: 'Fun Family Day Out',
      description: 'Community',
    },
    {
      logo: 'template-img.png',
      name: 'Modern Corporate Event',
      description: 'Corporate',
    },
    {
      logo: 'template-img.png',
      name: 'Oh Baby!',
      description: 'Baby Shower',
    },
  ];

  const renderProject = (project, index) => {
    return (
      <Card className="rounded-xl">
        <div className="mb-2 overflow-hidden">
          <img
            src={toAbsoluteUrl(`/media/${project?.logo}`)}
            className="w-full"
            alt="image"
          />
        </div>
        <div className="p-3 ">
          <div className="flex items-center justify-between ">
            <div className="flex flex-col mb-1">
              <span className="text-lg text-dark font-media/brand text-mono hover:text-primary-active mb-px">
                {project?.name}
              </span>
              <span className="text-sm text-secondary-foreground">
                {project?.description}
              </span>
            </div>

            <Button variant="ghost" mode="icon">
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </div>

          <div className="text-sm font-medium text-purple-600 ">
            Premium ($20)
          </div>

          <div className="text-sm text-primary">(System Template)</div>

          <div className="flex gap-2 items-center justify-between mt-3">
            <Button variant="outline" className="mx-auto w-full max-w-50">
              Preview
            </Button>
            <Button variant="primary" className="mx-auto w-full max-w-50">
              Design
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
      <div className="relative">
        <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by name or category..."
          //  value={searchQuery}
          //  onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-9 w-95"
        />

        {/* {searchQuery.length > 0 && (
                       <Button
                         mode="icon"
                         variant="ghost"
                         className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                         onClick={() => setSearchQuery('')}
                       >
                         <X />
                       </Button>
                     )} */}
      </div>

      <div id="projects_cards">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-7.5">
          {projects.map((project, index) => {
            return renderProject(project, index);
          })}
        </div>
        <div className="flex grow justify-center pt-5 lg:pt-7.5">
          <Button mode="link" underlined="dashed" asChild>
            <Link href="#">Show more projects</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Templates };
