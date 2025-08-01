'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input, InputWrapper } from '@/components/ui/input';

const ApiCredentials = () => {
  const [keyInput, setKeyInput] = useState('hwewe4654fdd5sdfh');

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground leading-5.5 pb-5">
          The granted credentials serve a twofold function, enabling{' '}
          <Button mode="link" asChild>
            <Link href="#">API authentication</Link>
          </Button>{' '}
          and governing JavaScript customization
        </div>
        <div className="flex flex-col flex-wrap gap-4">
          <InputWrapper>
            <Input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />

            <Button variant="dim" mode="icon" className="-me-2">
              <Copy size={16} />
            </Button>
          </InputWrapper>
          <div>
            <Button>
              <KeyRound /> Access Tokens
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Button mode="link" underlined="dashed" asChild>
          <Link href="/account/api-keys">Check API’s</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ApiCredentials };
