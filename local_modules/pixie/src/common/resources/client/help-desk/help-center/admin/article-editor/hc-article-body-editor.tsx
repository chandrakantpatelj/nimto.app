import React, {cloneElement, ReactElement, Suspense} from 'react';
import {FileUploadProvider} from '@common/uploads/uploader/file-upload-provider';
import {ArticleEditorTitle} from '@common/article-editor/article-editor-title';
import {Editor} from '@tiptap/react';
import {ArticleEditorStickyHeader} from '@common/article-editor/article-editor-sticky-header';
import {useArticleEditorBackLink} from '@common/help-desk/help-center/admin/article-editor/use-article-editor-back-link';
import {DialogTrigger} from '@ui/overlays/dialog/dialog-trigger';
import {Button} from '@ui/buttons/button';
import {Dialog} from '@ui/overlays/dialog/dialog';
import {DialogBody} from '@ui/overlays/dialog/dialog-body';
import {Trans} from '@ui/i18n/trans';
import {useMediaQuery} from '@ui/utils/hooks/use-media-query';

const ArticleBodyEditor = React.lazy(
  () => import('@common/article-editor/article-body-editor'),
);

interface Props {
  initialContent?: string;
  onLoad: (editor: Editor) => void;
  mobileSaveButton?: ReactElement;
}
export function HcArticleBodyEditor({
  initialContent,
  onLoad,
  mobileSaveButton,
}: Props) {
  const backLink = useArticleEditorBackLink();
  return (
    <Suspense>
      <ArticleBodyEditor initialContent={initialContent} onLoad={onLoad}>
        {(content, editor) => (
          <FileUploadProvider>
            <ArticleEditorStickyHeader
              allowSlugEditing={false}
              editor={editor}
              backLink={backLink}
              isLoading={false}
              saveButton={mobileSaveButton}
              imageDiskPrefix="article_images"
            />
            <div className="mx-20">
              <div className="prose mx-auto flex-auto dark:prose-invert">
                <ArticleEditorTitle />
                {content}
              </div>
            </div>
          </FileUploadProvider>
        )}
      </ArticleBodyEditor>
    </Suspense>
  );
}

interface ArticleEditorLayoutProps {
  children?: ReactElement<Props>;
  aside: ReactElement;
}
export function ArticleEditorLayout({
  children,
  aside,
}: ArticleEditorLayoutProps) {
  const isCompactMode = useMediaQuery('(max-width: 1024px)');
  const mobileSaveButton = isCompactMode ? (
    <MobileSaveButton aside={aside} />
  ) : undefined;
  return (
    <div className="min-h-full items-stretch lg:flex">
      <div className="flex-auto">
        {children &&
          cloneElement(children, {
            mobileSaveButton,
          })}
      </div>
      {!isCompactMode && (
        <div className="w-320 border-l bg-alt xl:w-400">
          <aside className="sticky top-0 px-24 py-14 xl:px-48 xl:py-28">
            {aside}
          </aside>
        </div>
      )}
    </div>
  );
}

interface MobileSaveButtonProps {
  aside: ReactElement;
}
function MobileSaveButton({aside}: MobileSaveButtonProps) {
  return (
    <DialogTrigger type="modal">
      <Button variant="outline" color="primary" size="xs">
        <Trans message="Save" />
      </Button>
      <Dialog>
        <DialogBody>{aside}</DialogBody>
      </Dialog>
    </DialogTrigger>
  );
}
