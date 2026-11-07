import type { components } from '@snote/contracts';

export type LibraryItemType = 'text' | 'link' | 'file';
export type LibraryItemStatus = 'active' | 'trash';

export type Library = components['schemas']['Library'];
export type LibraryItem = components['schemas']['LibraryItem'];
export type Folder = components['schemas']['Folder'];
export type FolderInput = components['schemas']['FolderInput'];
export type Copy = components['schemas']['Copy'];
export type UploadStart = components['schemas']['UploadStart'];
export type Upload = components['schemas']['Upload'];
export type Download = components['schemas']['Download'];

export interface QuotaInfo {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  warning: boolean;
  itemCount: number;
}

export interface ItemDetail extends Library {
  folderId?: string | null;
  revision?: {
    id: string;
    text?: string | null;
    url?: string | null;
    blobId?: string | null;
    actorId: string;
    at: string;
  };
  preview?: {
    url: string;
    domain: string;
    title?: string;
    coverImage?: string;
  };
}

export interface TrashItem extends Library {
  deletedAt: string;
  purgeAfter: string;
  daysRemaining: number;
}
