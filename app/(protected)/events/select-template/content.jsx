'use client';

import { Card } from '@/components/ui/card';
import SelectEvents from './components/events';

export function SelectEventContent() {
  return (
    <Card className="p-4">
      <SelectEvents />
    </Card>
  );
}
