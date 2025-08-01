'use client';

import { useSettings } from '@/providers/settings-provider';
import { Demo1LightSidebarPage } from './components/demo1';
import { Demo2Page } from './components/demo2';
import { Demo3Page } from './components/demo3';
import { Demo4Page } from './components/demo4';
import { Demo5Page } from './components/demo5';

export default function Page() {
  const { settings } = useSettings();

  if (settings?.layout === 'demo1') {
    return <Demo1LightSidebarPage />;
  } else if (settings?.layout === 'demo2') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo3') {
    return <Demo3Page />;
  } else if (settings?.layout === 'demo4') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo5') {
    return <Demo5Page />;
  } else if (settings?.layout === 'demo6') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo7') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo8') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo9') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo10') {
    return <Demo3Page />;
  }
}
