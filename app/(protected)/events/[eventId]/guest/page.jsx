'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
              <Button variant="secondary" appearance="ghost" asChild>
                <Link href="/events">
                  <ArrowLeft /> Back
                </Link>
              </Button>
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
              <Button variant="secondary" appearance="ghost" asChild>
                <Link href="/events">
                  <ArrowLeft /> Back
                </Link>
              </Button>
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
            <Button variant="primary" asChild>
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
            <Button variant="secondary" appearance="ghost" asChild>
              <Link href="/events">
                <ArrowLeft /> Back
              </Link>
            </Button>
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
