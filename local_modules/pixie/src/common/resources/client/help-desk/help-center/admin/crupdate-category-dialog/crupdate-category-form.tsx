import {UseFormReturn} from 'react-hook-form';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {Trans} from '@ui/i18n/trans';
import {FormSelect} from '@ui/forms/select/select';
import {Item} from '@ui/forms/listbox/item';
import {CreateCategoryPayload} from '@common/help-desk/help-center/admin/requests/use-create-category';
import {FormImageSelector} from '@common/uploads/components/image-selector';
import {useCategories} from '@common/help-desk/help-center/admin/requests/use-categories';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {VisibleToField} from '@common/help-desk/help-center/admin/visible-to-field';
import React from 'react';
import {ManagedByField} from '@common/help-desk/help-center/admin/managed-by-field';

interface CrupdateTagFormProps {
  onSubmit: (values: CreateCategoryPayload) => void;
  formId: string;
  form: UseFormReturn<CreateCategoryPayload>;
  hideParentId?: boolean;
}
export function CrupdateCategoryForm({
  form,
  onSubmit,
  formId,
  hideParentId,
}: CrupdateTagFormProps) {
  const {data} = useCategories({type: 'category', compact: true});
  return (
    <Form id={formId} form={form} onSubmit={onSubmit}>
      <FormTextField
        name="name"
        label={<Trans message="Name" />}
        className="mb-24"
        required
        autoFocus
      />
      <FileUploadProvider>
        <FormImageSelector
          label={<Trans message="Image" />}
          name="image"
          diskPrefix="category_images"
          className="mb-24"
        />
      </FileUploadProvider>
      <FormTextField
        name="description"
        label={<Trans message="Description" />}
        inputElementType="textarea"
        rows={4}
        className="mb-24"
      />
      {hideParentId && (
        <FormSelect
          name="parent_id"
          selectionMode="single"
          label="Parent category"
          className="mb-24"
        >
          {data?.pagination.data.map(category => (
            <Item key={category.id} value={category.id}>
              <Trans message={category.name} />
            </Item>
          ))}
        </FormSelect>
      )}
      <VisibleToField
        className="mb-24"
        description={
          <Trans message="Control who can see this category in help center" />
        }
      />
      <ManagedByField
        description={<Trans message="Control who can edit this category" />}
      />
    </Form>
  );
}
