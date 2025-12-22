// src/services/FilesController.ts
import { useEventBus } from '@quantum/use';

export type ID = string;
export const FileEventBus = useEventBus();

/** 文件来源 */
export enum FileLocation {
  Local = 'local',
  Cloud = 'cloud',
}

/** 文件类型 */
export type FileKind = 'notes' | 'podcast' | 'quiz';

/** 基础文件数据 */
export interface BaseFile {
  id: ID;
  title: string;
  location: FileLocation;
  folderId: ID | null;
  createdAt: number;
  updatedAt: number;
}

/** Notes 子类 */
export interface NotesFile extends BaseFile {
  kind: 'notes';
  meta: { summary?: string };
}

/** Podcast 子类 */
export interface PodcastFile extends BaseFile {
  kind: 'podcast';
  meta: { summary?: string };
}

/** Quiz 子类 */
export interface QuizFile extends BaseFile {
    kind: 'quiz';
    meta: { summary?: string };
  }

export type FileEntity = NotesFile | PodcastFile;

/** 文件夹 */
export interface FolderEntity {
  id: ID;
  name: string;
  location: FileLocation;
}

export default class FilesController {
  private folders = new Map<ID, FolderEntity>();
  private files = new Map<ID, FileEntity>();

  /** ===== Folder 操作 ===== */
  createFolder(name: string, location: FileLocation): FolderEntity {
    const folder: FolderEntity = {
      id: this.genId('fld'),
      name,
      location,
    };
    this.folders.set(folder.id, folder);
    return folder;
  }

  removeFolder(folderId: ID): boolean {
    if (!this.folders.has(folderId)) return false;
    // 同时删除该文件夹下的文件
    for (const [fid, file] of this.files) {
      if (file.folderId === folderId) {
        this.files.delete(fid);
      }
    }
    this.folders.delete(folderId);
    return true;
  }

  listFolders(): FolderEntity[] {
    return Array.from(this.folders.values());
  }

  /** ===== File 操作 ===== */
  createFile(file: Omit<NotesFile, 'id' | 'createdAt' | 'updatedAt'> | Omit<PodcastFile, 'id' | 'createdAt' | 'updatedAt'>): FileEntity {
    const now = Date.now();
    const newFile: FileEntity = {
      ...file,
      id: this.genId('fil'),
      createdAt: now,
      updatedAt: now,
    } as FileEntity;

    this.files.set(newFile.id, newFile);
    return newFile;
  }

  updateFile(id: ID, patch: Partial<Omit<FileEntity, 'kind'>>): boolean {
    const f = this.files.get(id);
    if (!f) return false;
    const updated: FileEntity = { ...f, ...patch, updatedAt: Date.now() } as FileEntity;
    this.files.set(id, updated);
    return true;
  }

  removeFile(id: ID): boolean {
    if (!this.files.has(id)) return false;
    this.files.delete(id);
    return true;
  }

  getFile(id: ID): FileEntity | undefined {
    return this.files.get(id);
  }

  listFiles(folderId?: ID | null): FileEntity[] {
    if (folderId === undefined) return Array.from(this.files.values());
    return Array.from(this.files.values()).filter(f => f.folderId === folderId);
  }

  /** ===== 工具方法 ===== */
  private genId(prefix: string): ID {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }
}
