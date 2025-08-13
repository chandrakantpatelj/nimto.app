import {BackendMetadata} from '../backend-metadata';
import {Restrictions} from '@ui/utils/files/validate-file';
import {FileEntry} from '../../file-entry';
import {UploadedFile} from '@ui/utils/files/uploaded-file';

export interface UploadStrategyConfig {
  chunkSize?: number;
  baseUrl?: string;
  restrictions?: Restrictions;
  showToastOnRestrictionFail?: boolean;
  showToastOnBackendError?: boolean;
  onProgress?: (progress: {bytesUploaded: number; bytesTotal: number}) => void;
  onSuccess?: (entry: FileEntry, file: UploadedFile) => void;
  onError?: (message: string | undefined | null, file: UploadedFile) => void;
  metadata?: BackendMetadata;
}

export interface UploadStrategy {
  start: () => void;
  abort: () => Promise<void>;
}
