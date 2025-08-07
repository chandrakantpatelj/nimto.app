'use client';

import { Card } from '@/components/ui/card';
import MessagingSystem from './components/MessagingSystem';

export function Messaging() {
  return (
    <Card className="p-4">
      <MessagingSystem />
    </Card>
  );
}
