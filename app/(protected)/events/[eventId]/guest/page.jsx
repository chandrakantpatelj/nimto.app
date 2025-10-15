'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/common/toolbar';
import { PageNavbar } from '@/app/(protected)/account/page-navbar';
import { ToolbarPageTitle } from '@/app/components/partials/common/toolbar';
import { ManageGuestContent } from './content';

function EventManagementPage() {
  const params = useParams();
  const eventId = params.eventId;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/events/${eventId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched event data:', data);
      setEvent(data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <PageNavbar />
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="Loading..." />
            </ToolbarHeading>
            <ToolbarActions>
              {/* Mobile Layout: Button with label below */}
              <div className="flex sm:hidden flex-col gap-2 w-full">
                <Button
                  variant="secondary"
                  appearance="ghost"
                  asChild
                  className="w-full"
                >
                  <Link href="/events">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Back
                </div>
              </div>

              {/* Desktop Layout: Button with inline label */}
              <div className="hidden sm:flex">
                <Button
                  variant="secondary"
                  appearance="ghost"
                  asChild
                  className="w-auto"
                >
                  <Link href="/events">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                </Button>
              </div>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-600 text-lg">Loading event details...</p>
          </div>
        </Container>
      </Fragment>
    );
  }

  if (!event) {
    return (
      <Fragment>
        <PageNavbar />
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="Event Not Found" />
            </ToolbarHeading>
            <ToolbarActions>
              {/* Mobile Layout: Button with label below */}
              <div className="flex sm:hidden flex-col gap-2 w-full">
                <Button
                  variant="secondary"
                  appearance="ghost"
                  asChild
                  className="w-full"
                >
                  <Link href="/events">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Back
                </div>
              </div>

              {/* Desktop Layout: Button with inline label */}
              <div className="hidden sm:flex">
                <Button
                  variant="secondary"
                  appearance="ghost"
                  asChild
                  className="w-auto"
                >
                  <Link href="/events">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                </Button>
              </div>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Event Not Found
              </h3>
              <p className="text-gray-600 max-w-md">
                The event you're looking for doesn't exist or you don't have
                access to it.
              </p>
            </div>
            <Button variant="primary" asChild className="w-full sm:w-auto">
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={`Manage Invitations: ${event.title}`} />
          </ToolbarHeading>
          <ToolbarActions>
            {/* Mobile Layout: Buttons side by side with labels below */}
            <div className="flex sm:hidden flex-col gap-2 w-full">
              <div className="flex justify-between gap-2">
                <Button
                  variant="secondary"
                  appearance="ghost"
                  asChild
                  className="flex-1"
                >
                  <Link href="/events">
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="primary" asChild className="flex-1">
                  <Link href={`/events/${eventId}`}>
                    <Edit className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-between gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex-1 text-center">Back</span>
                <span className="flex-1 text-center">Edit Event</span>
              </div>
            </div>

            {/* Desktop Layout: Buttons with inline labels */}
            <div className="hidden sm:flex flex-row gap-3 w-auto">
              <Button variant="primary" asChild className="w-auto">
                <Link href={`/events/${eventId}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </Link>
              </Button>
              <Button
                variant="secondary"
                appearance="ghost"
                asChild
                className="w-auto"
              >
                <Link href="/events">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ManageGuestContent event={event} />
      </Container>
    </Fragment>
  );
}

export default EventManagementPage;
