import {Trans} from '@ui/i18n/trans';
import {FormattedPrice} from '@common/billing/formatted-price';
import {useCheckoutProduct} from '@common/billing/requests/use-checkout-product';
import {m} from 'framer-motion';
import {Skeleton} from '@ui/skeleton/skeleton';
import {Product} from '@common/billing/product';
import {Price} from '@common/billing/price';
import {ProductFeatureList} from '../pricing-table/product-feature-list';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {FormattedCurrency} from '@ui/i18n/formatted-currency';

interface CheckoutProductSummaryProps {
  showBillingLine?: boolean;
}
export function CheckoutProductSummary({
  showBillingLine = true,
}: CheckoutProductSummaryProps) {
  const {status, product, price} = useCheckoutProduct();

  if (status === 'error' || (status !== 'pending' && (!product || !price))) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-30 text-2xl">
        <Trans message="Summary" />
      </h2>
      {status === 'pending' ? (
        <LoadingSkeleton key="loading-skeleton" />
      ) : (
        <ProductSummary
          product={product!}
          price={price!}
          showBillingLine={showBillingLine}
        />
      )}
    </div>
  );
}

interface ProductSummaryProps {
  product: Product;
  price: Price;
  showBillingLine: boolean;
}
function ProductSummary({
  product,
  price,
  showBillingLine,
}: ProductSummaryProps) {
  return (
    <m.div>
      <div className="mb-6 text-xl font-semibold">{product.name}</div>
      {product.description && (
        <div className="text-sm text-muted">{product.description}</div>
      )}
      <FormattedPrice
        priceClassName="font-bold text-4xl"
        periodClassName="text-muted text-xs"
        variant="separateLine"
        price={price}
        className="mt-32"
      />
      <ProductFeatureList product={product} />
      {showBillingLine && (
        <div className="mt-32 flex items-center justify-between gap-24 border-t pt-24 font-medium">
          <div>
            <Trans message="Billed today" />
          </div>
          <div>
            <FormattedCurrency value={price.amount} currency={price.currency} />
          </div>
        </div>
      )}
    </m.div>
  );
}

function LoadingSkeleton() {
  return (
    <m.div {...opacityAnimation} className="max-w-180">
      <Skeleton className="mb-6 text-xl" />
      <Skeleton className="text-sm" />
      <Skeleton className="mt-32 text-4xl" />
    </m.div>
  );
}
