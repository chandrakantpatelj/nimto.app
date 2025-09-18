import {useFieldArray, useFormContext} from 'react-hook-form';
import {Fragment, useEffect} from 'react';
import {
  appearanceState,
  AppearanceValues,
} from '@common/admin/appearance/appearance-store';
import {Button} from '@ui/buttons/button';
import {DeleteIcon} from '@ui/icons/material/Delete';
import {ConfirmationDialog} from '@ui/overlays/dialog/confirmation-dialog';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Trans} from '@ui/i18n/trans';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {MenuItemForm} from '@common/admin/menus/menu-item-form';
import {useParams} from 'react-router-dom';
import {MenuItemConfig} from '@common/menus/menu-config';

export function MenuItemEditor() {
  const {menuIndex, menuItemIndex} = useParams();
  const navigate = useNavigate();

  const {getValues} = useFormContext<AppearanceValues>();

  const formPath = `settings.menus.${menuIndex}.items.${menuItemIndex}`;
  const item = getValues(formPath as any);

  // go to menu editor, if menu item can't be found
  useEffect(() => {
    if (!item) {
      //navigate(`../`);
    } else {
      appearanceState().preview.setHighlight(
        `[data-menu-item-id="${item.id}"]`,
      );
    }
  }, [navigate, item]);

  // only render form when menu and item are available to avoid issues with hook form default values
  if (!item || menuItemIndex == null) {
    return null;
  }

  return <MenuItemEditorSection formPath={formPath} />;
}

interface MenuItemEditorSectionProps {
  formPath: string;
}
function MenuItemEditorSection({formPath}: MenuItemEditorSectionProps) {
  return (
    <Fragment>
      <MenuItemForm formPathPrefix={formPath} />
      <div className="mt-40 text-right">
        <DeleteItemTrigger />
      </div>
    </Fragment>
  );
}

function DeleteItemTrigger() {
  const navigate = useNavigate();
  const {menuIndex, menuItemIndex} = useParams();
  const {fields, remove} = useFieldArray<AppearanceValues>({
    name: `settings.menus.${+menuIndex!}.items`,
  });

  if (!menuItemIndex) return null;

  const item = fields[+menuItemIndex] as MenuItemConfig;

  return (
    <DialogTrigger
      type="modal"
      onClose={isConfirmed => {
        if (isConfirmed) {
          if (menuItemIndex) {
            remove(+menuItemIndex);
            navigate(`/admin/appearance/menus/${menuIndex}`);
          }
        }
      }}
    >
      <Button
        variant="outline"
        color="danger"
        size="xs"
        startIcon={<DeleteIcon />}
      >
        <Trans message="Delete this item" />
      </Button>
      <ConfirmationDialog
        isDanger
        title={<Trans message="Delete menu item" />}
        body={
          <Trans
            message="Are you sure you want to delete “:name“?"
            values={{name: item.label}}
          />
        }
        confirm={<Trans message="Delete" />}
      />
    </DialogTrigger>
  );
}
