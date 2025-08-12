import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {useForm} from 'react-hook-form';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {Trans} from '@ui/i18n/trans';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {Button} from '@ui/buttons/button';
import {
  CreateCategoryPayload,
  useCreateCategory,
} from '@common/help-desk/help-center/admin/requests/use-create-category';
import {CrupdateCategoryForm} from '@common/help-desk/help-center/admin/crupdate-category-dialog/crupdate-category-form';

interface Props {
  parentId?: number | string;
}
export function CreateCategoryDialog({parentId}: Props) {
  const {close, formId} = useDialogContext();
  const form = useForm<CreateCategoryPayload>({
    defaultValues: {
      parent_id: parentId ? parseInt(parentId as string) : undefined,
    },
  });
  const createCategory = useCreateCategory(form);

  return (
    <Dialog>
      <DialogHeader>
        {parentId ? (
          <Trans message="Add new section" />
        ) : (
          <Trans message="Add new category" />
        )}
      </DialogHeader>
      <DialogBody>
        <CrupdateCategoryForm
          hideParentId={!!parentId}
          formId={formId}
          form={form}
          onSubmit={values => {
            createCategory.mutate(values, {
              onSuccess: () => close(),
            });
          }}
        />
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          form={formId}
          disabled={createCategory.isPending}
          variant="flat"
          color="primary"
          type="submit"
        >
          <Trans message="Create" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
