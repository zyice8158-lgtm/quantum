export enum FileType {
  DOCS = "docs",
  SHEET = "sheet",
  NOTE = "note",
  AUDIO = "audio",
  MEMORY = "memory",
}
export enum FileLocation {
  LOCAL = "LOCAL",
  SYNC = "SYNC",
}
export interface FileItem {
  id: number;
  name: string;
  type: FileType;
  lastModified: string;
  location:string;
  snapshoot: string;
  action: string;
  tags?: Array<string>;
  fileName?: string;
  contentUri?: Array<string>;
}
