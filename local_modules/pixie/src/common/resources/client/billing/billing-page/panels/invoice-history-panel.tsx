import {useBillingUser} from '../use-billing-user';
import {BillingPlanPanel} from '../billing-plan-panel';
import {Trans} from '@ui/i18n/trans';
import {useInvoices} from '../requests/use-invoices';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {Chip} from '@ui/forms/input-field/chip-field/chip';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';
import {Skeleton} from '@ui/skeleton/skeleton';
import {AnimatePresence, m} from 'framer-motion';
import {Invoice} from '../../invoice';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {useSettings} from '@ui/settings/use-settings';
import {FormattedCurrency} from '@ui/i18n/formatted-currency';

export function InvoiceHistoryPanel() {
  const {user} = useBillingUser();
  const query = useInvoices(user?.id!);
  if (!user) return null;

  const invoices = query.data?.invoices;

  return (
    <BillingPlanPanel title={<Trans message="Payment history" />}>
      <div className="max-w-[464px]">
        <AnimatePresence initial={false} mode="wait">
          {query.isLoading ? (
            <LoadingSkeleton key="loading-skeleton" />
          ) : (
            <InvoiceList key="invoices" invoices={invoices} />
          )}
        </AnimatePresence>
      </div>
    </BillingPlanPanel>
  );
}

interface InvoiceListProps {
  invoices?: Invoice[];
}
function InvoiceList({invoices}: InvoiceListProps) {
  const {base_url} = useSettings();
  return (
    <m.div {...opacityAnimation}>
      {!invoices?.length ? (
        <div className="italic text-muted">
          <Trans message="No invoices yet" />
        </div>
      ) : undefined}
      {invoices?.map(invoice => (
        <div
          className="mb-14 flex items-center justify-between gap-10 whitespace-nowrap text-base"
          key={invoice.id}
        >
          <a
            href={`${base_url}/billing/invoices/${invoice.uuid}`}
            target="_blank"
            className="flex items-center gap-8 hover:underline"
            rel="noreferrer"
          >
            <FormattedDate date={invoice.created_at} />
            <OpenInNewIcon size="xs" />
          </a>
          {invoice.subscription.price && (
            <div>
              <FormattedCurrency
                value={invoice.subscription.price.amount}
                currency={invoice.subscription.price.currency}
              />
            </div>
          )}
          <Chip
            size="xs"
            color={invoice.paid ? 'positive' : 'danger'}
            radius="rounded"
          >
            {invoice.paid ? (
              <Trans message="Paid" />
            ) : (
              <Trans message="Unpaid" />
            )}
          </Chip>
          <div>{invoice.subscription.product?.name}</div>
        </div>
      ))}
    </m.div>
  );
}

function LoadingSkeleton() {
  return (
    <m.div {...opacityAnimation}>
      <Skeleton className="mb-14" />
      <Skeleton className="mb-14" />
      <Skeleton className="mb-14" />
      <Skeleton className="mb-14" />
      <Skeleton />
    </m.div>
  );
}
