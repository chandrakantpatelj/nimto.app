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
      <div className="flex flex-col items-center justify-center grow bg-center bg-no-repeat page-bg">
        <div className="m-5">
          <Link href="/">
            <img
              src={toAbsoluteUrl('/media/app/nimto-main-logo.svg')}
              className="h-[35px] max-w-none"
              alt=""
            />
          </Link>
        </div>
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </>
  );
}
