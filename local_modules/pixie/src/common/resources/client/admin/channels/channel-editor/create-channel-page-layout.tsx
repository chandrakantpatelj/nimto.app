import {useForm} from 'react-hook-form';
import React, {ReactNode} from 'react';
import {CrupdateResourceLayout} from '@common/admin/crupdate-resource-layout';
import {Trans} from '@ui/i18n/trans';
import {EMPTY_PAGINATION_RESPONSE} from '@common/http/backend-response/pagination-response';
import {UpdateChannelPayload} from '@common/admin/channels/requests/use-update-channel';
import {
  CreateChannelPayload,
  useCreateChannel,
} from '@common/admin/channels/requests/use-create-channel';

interface Props {
  defaultValues?: Partial<UpdateChannelPayload['config']>;
  children: ReactNode;
  submitButtonText?: ReactNode;
}
export function CreateChannelPageLayout({
  defaultValues,
  children,
  submitButtonText,
}: Props) {
  const form = useForm<CreateChannelPayload>({
    defaultValues: {
      content: EMPTY_PAGINATION_RESPONSE.pagination,
      config: {
        contentType: 'listAll',
        contentOrder: 'created_at:desc',
        nestedLayout: 'carousel',
        ...defaultValues,
      },
    },
  });
  const createChannel = useCreateChannel(form);

  return (
    <CrupdateResourceLayout
      submitButtonText={submitButtonText}
      form={form}
      onSubmit={values => {
        createChannel.mutate(values);
      }}
      title={<Trans message="New channel" />}
      isLoading={createChannel.isPending}
    >
      {children}
    </CrupdateResourceLayout>
  );
}
