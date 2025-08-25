'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import PreviewTemplateContent from './content';

function TemplatePreview() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`/api/template/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const result = await response.json();

      if (result.success) {
        setTemplate(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch template');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading template preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => router.push('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={`Preview: ${template?.name}`} />
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="secondary" asChild>
              <Link href={`/templates/design/${params?.id}`}>
                Design Template
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <PreviewTemplateContent template={template} />
      </Container>
    </Fragment>
  );
}

export default TemplatePreview;
