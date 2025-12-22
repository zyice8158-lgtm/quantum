import { AppFetch, BaseRes, ShellReq, ShellRes } from "../index";

export interface FileListItem {
  FilePath: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  ConvertPath: string;
  Converted: boolean;
}

export interface AddDocumentReq {
  fileList: Array<Partial<FileListItem>>;
}

export interface ListPageReq {
  pageNum: number;
  pageSize: number;
}

export interface DeleteDocumentReq {
  doc_ids: Array<string>;
}

export interface AddMemoryReq {
  userText: string;
  fileList: Array<string>;
}

export interface DeleteMemoryReq {
  entries: Array<string>;
}

export interface GetMemoryReq {
  //查询文字
  query?: string;
  //id数组
  entries?: Array<string>;
  //一次查询多少个
  topK?: number;
  //模糊搜
  fuzzySearchText?: string;
}

export interface GetAllMemoryReq {
  fields: Array<string>;
  page_number?: number;
  page_size?: number;
}

export interface DocumentFuzzySearchReq {
  substring: string;
}

export interface OpenLocalFileReq {
  filePath: string;
}

export interface BindToLabelReq {
  labelName: string;
  docIds: Array<string>;
}
export interface UpdateDocumentLabelReq {
  labelId: string;
  docIds: Array<string>;
}

export interface GetDocsByLabelIdReq {
  labelIds: Array<string>;
}

export interface AddLabelReq {
  labelName: string;
}

export interface PreferencesReq {
  personalizedContentEnabled?: boolean;
  synchronizationEnabled?: boolean;
}

export interface AddMemTagReq {
  userTags: Array<string>;
  userTagsColors: Array<string>;
}

export interface DeleteMemTagReq {
  userTags: Array<string>;
}

export interface UpdateMemTagReq {
  userTags: Array<string>;
  entries: Array<number>;
}

export interface GetMemByTagReq{
  userTags: Array<string>;
}

const Base = "/fkb";
export const selectFileInFKB = (data: ShellReq<{}>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/selectfile", data);
};

export const getAllDocument = (
  data: ShellReq<ListPageReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/document/getAll", data);
};

export const getDocumentByFuzzySearch = (
  data: ShellReq<DocumentFuzzySearchReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/document/fuzzySearch", data);
};
export const addDocument = async (
  data: ShellReq<AddDocumentReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  data.MessageSource = "FKB";
  return await AppFetch.post(Base + "/document/add", data, { timeout: 8 * 60 * 1000 });
};

export const deleteDocument = (
  data: ShellReq<DeleteDocumentReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/document/delete", data);
};

export const addMemory = (
  data: ShellReq<AddMemoryReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/add", data, { timeout: 8 * 60 * 1000 });
};

export const deleteMemory = (
  data: ShellReq<DeleteMemoryReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/delete", data);
};

export const getMemory = (
  data: ShellReq<GetMemoryReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/get", data);
};

export const getAllMemory = (
  data: ShellReq<GetAllMemoryReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/getAll", data);
};

export const openLocalFile = (
  data: ShellReq<OpenLocalFileReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/openlocalfile", data);
};

export const addLabel = (
  data: ShellReq<AddLabelReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/label/add", data);
};

export const getAllLabels = (): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/label/getAll");
};

export const bindToLabel = (
  data: ShellReq<BindToLabelReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/label/bindtolabel", data);
};

export const getDocsByLabelId = (
  data: ShellReq<GetDocsByLabelIdReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/label/getDocsByLabelId", data);
};

export const updateDocumentLabel = (
  data: ShellReq<UpdateDocumentLabelReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/label/updateDocumentLabel", data);
};

export const setPreferences = (
  data: ShellReq<PreferencesReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/preferences/set", data);
};

export const getPreferences = (data: ShellReq<{}>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/preferences/get");
};

export const getAllMemLabels = (
  data: ShellReq<{}>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/tag/getAvailables", data);
};

export const addMemTag = (
  data: ShellReq<AddMemTagReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/tag/add", data);
};

export const deleteMemTag = (
  data: ShellReq<DeleteMemTagReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/tag/delete", data);
};

export const updateMemTag = (data: ShellReq<UpdateMemTagReq>): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/tag/update", data);
};

export const getMemByTag = (
  data: ShellReq<GetMemByTagReq>
): BaseRes<ShellRes<Record<string, unknown>>> => {
  return AppFetch.post(Base + "/memory/getByTags", data);
};