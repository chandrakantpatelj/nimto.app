import {UploadedFile} from '@ui/utils/files/uploaded-file';
import {UploadStrategyConfig} from './strategy/upload-strategy';
import {FileUpload, FileUploadStoreOptions} from './file-upload-store';

export function createUpload(
  file: UploadedFile | File,
  strategyConfig: UploadStrategyConfig | undefined,
  storeOptions: FileUploadStoreOptions | undefined,
): FileUpload {
  let uploadedFile =
    file instanceof UploadedFile ? file : new UploadedFile(file);
  if (storeOptions?.modifyUploadedFile) {
    uploadedFile = storeOptions.modifyUploadedFile(uploadedFile);
  }
  return {
    file: uploadedFile,
    percentage: 0,
    bytesUploaded: 0,
    status: 'pending',
    options: strategyConfig || {},
  };
}
