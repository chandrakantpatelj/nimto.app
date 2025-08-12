import {useForm} from 'react-hook-form';
import {Accordion, AccordionItem} from '@ui/accordion/accordion';
import {Form} from '@ui/forms/form';
import {FormTextField} from '@ui/forms/input-field/text-field/text-field';
import {AddIcon} from '@ui/icons/material/Add';
import {Button} from '@ui/buttons/button';
import {useAvailableRoutes} from '@common/admin/appearance/sections/menus/hooks/available-routes';
import {List, ListItem} from '@ui/list/list';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {Trans} from '@ui/i18n/trans';
import {useValueLists} from '@common/http/value-lists';
import {ReactNode} from 'react';
import {nanoid} from 'nanoid';
import {MenuItemConfig} from '@common/menus/menu-config';
import {ucFirst} from '@ui/utils/string/uc-first';

interface AddMenuItemDialogProps {
  title?: ReactNode;
}
export function AddMenuItemDialog({
  title = <Trans message="Add menu item" />,
}: AddMenuItemDialogProps) {
  const {data} = useValueLists(['menuItemCategories']);
  const categories = data?.menuItemCategories || [];
  const routeItems = useAvailableRoutes();

  return (
    <Dialog size="sm">
      <DialogHeader>{title}</DialogHeader>
      <DialogBody>
        <Accordion variant="outline">
          <AccordionItem
            label={<Trans message="Link" />}
            bodyClassName="max-h-240 overflow-y-auto"
          >
            <AddCustomLink />
          </AccordionItem>
          <AccordionItem
            label={<Trans message="Route" />}
            bodyClassName="max-h-240 overflow-y-auto"
          >
            <AddRoute items={routeItems} />
          </AccordionItem>
          {categories.map(category => (
            <AccordionItem
              key={category.name}
              label={<Trans message={category.name} />}
            >
              <AddRoute items={category.items} />
            </AccordionItem>
          ))}
        </Accordion>
      </DialogBody>
    </Dialog>
  );
}

function AddCustomLink() {
  const form = useForm<MenuItemConfig>({
    defaultValues: {
      id: nanoid(6),
      type: 'link',
      target: '_blank',
    },
  });
  const {close} = useDialogContext();

  return (
    <Form
      form={form}
      onSubmit={value => {
        close(value);
      }}
    >
      <FormTextField
        required
        name="label"
        label={<Trans message="Label" />}
        className="mb-20"
      />
      <FormTextField
        required
        type="url"
        name="action"
        placeholder="https://"
        label={<Trans message="Url" />}
        className="mb-20"
      />
      <div className="text-right">
        <Button type="submit" variant="flat" color="primary" size="xs">
          <Trans message="Add to menu" />
        </Button>
      </div>
    </Form>
  );
}

interface AddRouteProps {
  items: Partial<MenuItemConfig>[];
}
function AddRoute({items}: AddRouteProps) {
  const {close} = useDialogContext();

  return (
    <List>
      {items.map(item => {
        return (
          <ListItem
            key={item.id}
            startIcon={<AddIcon size="sm" />}
            onSelected={() => {
              if (item.label) {
                const last = item.label.split('/').pop();
                item.label = last ? ucFirst(last) : item.label;
                item.id = nanoid(6);
              }
              close(item);
            }}
          >
            {item.label}
          </ListItem>
        );
      })}
    </List>
  );
}
