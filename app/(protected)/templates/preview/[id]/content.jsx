import React from 'react';
import { Card } from '@/components/ui/card';
import PreviewTemplate from './components/PreviewTemplate';

function PreviewTemplateContent({ template }) {
  return (
    <>
      <PreviewTemplate template={template} />
    </>
  );
}

export default PreviewTemplateContent;
