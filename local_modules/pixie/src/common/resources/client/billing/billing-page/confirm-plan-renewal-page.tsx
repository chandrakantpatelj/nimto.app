import {Breadcrumb} from '@ui/breadcrumbs/breadcrumb';
import {BreadcrumbItem} from '@ui/breadcrumbs/breadcrumb-item';
import {Trans} from '@ui/i18n/trans';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {BillingPlanPanel} from './billing-plan-panel';
import {Fragment} from 'react';
import {useProducts} from '../pricing-table/use-products';
import {Link} from 'react-router-dom';
import {Button} from '@ui/buttons/button';
import {FormattedPrice} from '../formatted-price';
import {invalidateBillingUserQuery, useBillingUser} from './use-billing-user';
import {FormattedDate} from '@ui/i18n/formatted-date';
import {useResumeSubscription} from './requests/use-resume-subscription';

const previousUrl = '/billing';

export function ConfirmPlanRenewalPage() {
  const navigate = useNavigate();
  const query = useProducts();
  const {subscription} = useBillingUser();
  const resumeSubscription = useResumeSubscription();

  const product = subscription?.product;
  const price = subscription?.price;

  if (!query.data) {
    return null;
  }

  if (!subscription || !product || !price) {
    navigate(previousUrl);
    return null;
  }

  const endDate = (
    <span className="whitespace-nowrap">
      <FormattedDate date={subscription.ends_at} preset="long" />;
    </span>
  );

  const handleResumeSubscription = () => {
    resumeSubscription.mutate(
      {
        subscriptionId: subscription.id,
      },
      {
        onSuccess: () => {
          invalidateBillingUserQuery();
          navigate('/billing');
        },
      },
    );
  };

  return (
    <Fragment>
      <Breadcrumb>
        <BreadcrumbItem isLink onSelected={() => navigate(previousUrl)}>
          <Trans message="Billing" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Trans message="Renew" />
        </BreadcrumbItem>
      </Breadcrumb>
      <h1 className="my-32 text-3xl font-bold md:my-64">
        <Trans message="Renew your plan" />
      </h1>
      <BillingPlanPanel title={<Trans message="Current plan" />}>
        <div className="max-w-[464px]">
          <div className="text-xl font-bold">{product.name}</div>
          <FormattedPrice price={price} className="text-lg" />
          <div className="mb-48 mt-12 border-b pb-24 text-base">
            <Trans
              message="This plan will no longer be canceled. It will renew on :date"
              values={{date: endDate}}
            />
          </div>
          <Button
            variant="flat"
            color="primary"
            size="md"
            className="mb-16 w-full"
            onClick={handleResumeSubscription}
            disabled={resumeSubscription.isPending}
          >
            <Trans message="Renew plan" />
          </Button>
          <Button
            variant="outline"
            className="w-full"
            to={previousUrl}
            elementType={Link}
          >
            <Trans message="Go back" />
          </Button>
          <div className="mt-12 text-xs text-muted">
            <Trans message="By renewing your plan, you agree to our terms of service and privacy policy." />
          </div>
        </div>
      </BillingPlanPanel>
    </Fragment>
  );
}
