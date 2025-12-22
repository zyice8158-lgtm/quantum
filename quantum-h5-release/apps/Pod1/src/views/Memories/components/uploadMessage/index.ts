export enum FileStatus {
  UPLOADING = "uploading",
  SUCCESS = "success",
  FAIL = "fail",
}

export interface SelectedFileData {
  FilePath: string;
  FileName: string;
  FileSize: number;
  FileType: string;
  ConvertPath: string;
  Converted:boolean;
}
export interface UploadFileItem {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  convertPath: string;
  converted: boolean;
  iconUrl: string;
  status: FileStatus;
  message: string;
  //是否聚合
  polymeric?: boolean;
}
