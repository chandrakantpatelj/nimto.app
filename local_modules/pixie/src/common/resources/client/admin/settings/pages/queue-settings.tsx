import {useFormContext} from 'react-hook-form';
import {ComponentType, Fragment} from 'react';
import {SettingsPanel} from '../settings-panel';
import {SettingsErrorGroup} from '../settings-error-group';
import {AdminSettings} from '../admin-settings';
import {FormSelect, Option} from '@ui/forms/select/select';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {useQueueStats} from '@common/admin/settings/requests/use-queue-stats';
import clsx from 'clsx';
import {useSettings} from '@ui/settings/use-settings';
import {Button} from '@ui/buttons/button';
import {LearnMoreLink} from '@common/admin/settings/learn-more-link';
import {OpenInNewIcon} from '@ui/icons/material/OpenInNew';

export function QueueSettings() {
  return (
    <SettingsPanel
      title={<Trans message="Queue" />}
      description={
        <Fragment>
          <Trans message="Queues allow to defer time consuming tasks, such as sending an email, until a later time. They are fully optional and do not provide any additional functionality." />
          <LearnMoreLink
            className="mt-6 text-sm"
            link="https://support.vebto.com/hc/articles/224/queues"
          />
        </Fragment>
      }
    >
      <StatusWidget />
      <DriverSection />
    </SettingsPanel>
  );
}

function StatusWidget() {
  const {base_url} = useSettings();
  const {watch} = useFormContext<AdminSettings>();
  const {data} = useQueueStats();
  const selectedDriver = watch('server.queue_driver');
  const status = data?.status;

  if (selectedDriver === 'sync') {
    return null;
  }

  return (
    <div className="mb-30 flex h-32 items-center justify-between gap-14">
      {status && (
        <Fragment>
          <div
            className={clsx(
              'min-w-108 flex w-max items-center gap-8 rounded-button px-10 py-4 text-sm capitalize',
              status === 'running' && 'bg-positive-lighter',
              status === 'inactive' && 'bg-danger-lighter',
              status === 'paused' && 'bg-chip',
            )}
          >
            <div
              className={clsx(
                'h-10 w-10 rounded-full',
                status === 'running' && 'bg-positive',
                status === 'inactive' && 'bg-danger',
                status === 'paused' && 'bg-chip',
              )}
            />
            <Trans message={`Worker ${status}`} />
          </div>
          <Button
            variant="outline"
            size="xs"
            elementType="a"
            href={`${base_url}/horizon`}
            target="_blank"
            endIcon={<OpenInNewIcon />}
          >
            <Trans message="Monitor" />
          </Button>
        </Fragment>
      )}
    </div>
  );
}

function DriverSection() {
  const {watch, clearErrors} = useFormContext<AdminSettings>();
  const queueDriver = watch('server.queue_driver');

  let CredentialSection: ComponentType<CredentialProps> | null = null;
  if (queueDriver === 'sqs') {
    CredentialSection = SqsCredentials;
  }
  return (
    <SettingsErrorGroup
      separatorTop={false}
      separatorBottom={false}
      name="queue_group"
    >
      {isInvalid => {
        return (
          <>
            <FormSelect
              invalid={isInvalid}
              onSelectionChange={() => {
                clearErrors();
              }}
              selectionMode="single"
              name="server.queue_driver"
              label={<Trans message="Queue method" />}
              required
            >
              <Option value="sync">
                <Trans message="None (Default)" />
              </Option>
              <Option value="beanstalkd">Beanstalkd</Option>
              <Option value="database">
                <Trans message="Database" />
              </Option>
              <Option value="sqs">
                <Trans message="SQS (Amazon simple queue service)" />
              </Option>
              <Option value="redis">Redis</Option>
            </FormSelect>
            {CredentialSection && (
              <div className="mt-30">
                <CredentialSection isInvalid={isInvalid} />
              </div>
            )}
          </>
        );
      }}
    </SettingsErrorGroup>
  );
}

interface CredentialProps {
  isInvalid: boolean;
}
function SqsCredentials({isInvalid}: CredentialProps) {
  return (
    <>
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.sqs_queue_key"
        label={<Trans message="SQS queue key" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.sqs_queue_secret"
        label={<Trans message="SQS queue secret" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.sqs_queue_prefix"
        label={<Trans message="SQS queue prefix" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.sqs_queue_name"
        label={<Trans message="SQS queue name" />}
        required
      />
      <FormTextField
        invalid={isInvalid}
        className="mb-30"
        name="server.sqs_queue_region"
        label={<Trans message="SQS queue region" />}
        required
      />
    </>
  );
}
