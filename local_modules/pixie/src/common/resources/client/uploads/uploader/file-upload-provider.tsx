import {createContext, ReactNode, useContext, useState} from 'react';
import {
  createFileUploadStore,
  FileUploadState,
  FileUploadStoreOptions,
} from '@common/uploads/uploader/file-upload-store';
import {useSettings} from '@ui/settings/use-settings';
import {useStoreWithEqualityFn} from 'zustand/traditional';

type FileUploadStore = ReturnType<typeof createFileUploadStore>;
const FileUploadContext = createContext<FileUploadStore>(null!);

export function useFileUploadStore<T>(
  selector: (s: FileUploadState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const store = useContext(FileUploadContext);
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

interface FileUploadProviderProps {
  children: ReactNode;
  options?: FileUploadStoreOptions;
}
export function FileUploadProvider({
  children,
  options,
}: FileUploadProviderProps) {
  const settings = useSettings();

  //lazily create store object only once
  const [store] = useState(() => {
    return createFileUploadStore({settings, options});
  });

  return (
    <FileUploadContext.Provider value={store}>
      {children}
    </FileUploadContext.Provider>
  );
}
