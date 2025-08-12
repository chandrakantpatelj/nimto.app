import {Trans} from '@ui/i18n/trans';
import {EditIcon} from '@ui/icons/material/Edit';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogHeader} from '@ui/overlays/dialog/dialog-header';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {DialogFooter} from '@ui/overlays/dialog/dialog-footer';
import {Button} from '@ui/buttons/button';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {useCategories} from '@common/help-desk/help-center/admin/requests/use-categories';
import {Accordion, AccordionItem} from '@ui/accordion/accordion';
import {Checkbox} from '@ui/forms/toggle/checkbox';
import {useDialogContext} from '@ui/overlays/dialog/dialog-context';
import {useFormContext} from 'react-hook-form';
import {ChangeEvent, Fragment, useState} from 'react';
import {CreateArticlePayload} from '@common/help-desk/help-center/admin/requests/use-create-article';
import {Section} from '@common/help-desk/help-center/front/categories/category';
import {getInputFieldClassNames} from '@ui/forms/input-field/get-input-field-class-names';

interface Props {
  onSave: (sections: number[]) => void;
}
export function ArticleSectionSelector({onSave}: Props) {
  const {data} = useCategories({
    type: 'category',
    compact: true,
    load: ['sections'],
  });
  const categories = data?.pagination.data || [];
  const sections = categories.map(c => c.sections!).flat() || [];
  const {watch, clearErrors} = useFormContext<CreateArticlePayload>();
  const selectedSections = watch('sections') || [];
  const {getFieldState} = useFormContext<CreateArticlePayload>();
  const errorMessage = getFieldState('sections').error?.message;
  const classNames = getInputFieldClassNames({errorMessage});

  const firstSection = sections.find(s => s.id === selectedSections[0]);
  const firstCategory = categories.find(c => c.id === firstSection?.parent_id);
  const sectionCount = selectedSections.length;

  return (
    <div>
      <div className={classNames.label}>
        <Trans message="Publish in sections" />
      </div>
      <DialogTrigger
        type="modal"
        onClose={sections => {
          if (sections) {
            onSave(sections);
            clearErrors('sections');
          }
        }}
      >
        <div className="relative cursor-pointer rounded border bg py-12 pl-12 pr-30 text-sm">
          {!firstSection || !firstCategory ? (
            <Trans message="Select a section" />
          ) : (
            <Fragment>
              <div className="mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap font-semibold">
                {firstCategory.name}
              </div>
              <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-muted">
                {sectionCount > 1 ? (
                  <Trans
                    message=":name + :count more sections"
                    values={{name: firstSection.name, count: sectionCount - 1}}
                  />
                ) : (
                  firstSection.name
                )}
              </div>
            </Fragment>
          )}

          <EditIcon className="absolute right-8 top-8 text-muted" size="sm" />
        </div>
        <SectionSelectorDialog />
      </DialogTrigger>
      {errorMessage && <div className={classNames.error}>{errorMessage}</div>}
    </div>
  );
}

function SectionSelectorDialog() {
  const {data} = useCategories({type: 'category', load: ['sections']});
  const {close} = useDialogContext();
  const {getValues} = useFormContext<CreateArticlePayload>();

  const [selectedSections, setSelectedSections] = useState<number[]>(
    () => getValues('sections') || [],
  );

  const handleToggle = (e: ChangeEvent<HTMLInputElement>, section: Section) => {
    if (e.target.checked) {
      setSelectedSections([...selectedSections, section.id]);
    } else {
      setSelectedSections(selectedSections.filter(id => id !== section.id));
    }
  };

  return (
    <Dialog size="lg">
      <DialogHeader>
        <Trans message="Select sections" />
      </DialogHeader>
      <DialogBody>
        <Accordion>
          {data?.pagination.data.map(category => {
            const sectionIds = category.sections?.map(s => s.id) || [];
            const selectedCount = sectionIds.filter(id =>
              selectedSections.includes(id),
            ).length;
            return (
              <AccordionItem
                disabled={!category.sections?.length}
                description={
                  selectedCount ? (
                    <Trans
                      message="[one 1 section|other :count sections] selected"
                      values={{count: selectedCount}}
                    />
                  ) : null
                }
                label={category.name}
                key={category.id}
              >
                <div className="space-y-8">
                  {category.sections?.map(section => (
                    <Checkbox
                      className="block"
                      key={section.id}
                      checked={selectedSections.includes(section.id)}
                      onChange={e => handleToggle(e, section)}
                    >
                      {section.name}
                    </Checkbox>
                  ))}
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => close()}>
          <Trans message="Cancel" />
        </Button>
        <Button
          variant="flat"
          color="primary"
          onClick={() => close(selectedSections)}
        >
          <Trans message="Select" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
