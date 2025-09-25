import Link from 'next/link';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { CommonFooter } from '@/components/common/footer';

export function BrandedLayout({ children }) {
  return (
    <>
      <style>
        {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1.png')}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/1-dark.png')}');
          }
        `}
      </style>
      <div className="grid lg:grid-cols-1 grow min-h-screen flex flex-col">
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1 flex-1">
          <Card className="w-full max-w-[400px]">
            <CardContent className="p-6">{children}</CardContent>
          </Card>
        </div>
        {/* <CommonFooter /> */}
      </div>
    </>
  );
}
