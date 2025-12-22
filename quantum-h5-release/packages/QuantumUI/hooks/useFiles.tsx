import { GetFilterSetting, selectFile, sendFilesConvert, WebviewMessager } from "@libs/service";
import { onMounted, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { ToastEventBus } from "primevue";
import { EventBus } from "@quantum/use";

interface SelectFileItem {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}
interface useFilesOptions {
  rules?: Array<string>;
  needDrag?: boolean;
}
/**
 * 文件列表管理
 * - 点击选择文件
 * - 监听拖拽文件
 */
export const useFiles = (options?: useFilesOptions) => {
  const { needDrag = true, rules } = options || {};
  const files = ref([]);
  const filterRules = {
    MaxFileCount: 5,
    MaxFileSize: 20 * 1024 * 1024,
    Extensions: [] as any[],
  };
  /** 获取文件过滤规则 */
  const getFilterRules = async () => {
    try {
      const { data } = (await GetFilterSetting()) as any;
      const { filterSetting } = data.Data;
      const { MaxFileCount, MaxFileSize, Extensions } = filterSetting;
      filterRules.MaxFileCount = MaxFileCount;
      filterRules.MaxFileSize = MaxFileSize;
      filterRules.Extensions = (Extensions as any[]).map((item: any) => {
        const { Type, MaxNum, Extensions } = item;
        return {
          Type,
          MaxNum,
          fn: (file: SelectFileItem) => {
            console.log(
              "filterFileByCount",
              Extensions,
              file.fileType,
              Extensions.includes(file.fileType),
            );
            return Extensions.includes(file.fileType);
          },
        };
      });
    } catch (_) {}
  };
  const getFileExtension = (fileItem: SelectFileItem) => {
    for (const { fn, Type } of filterRules.Extensions) {
      if (fn(fileItem)) {
        return Type;
      }
    }
  };
  const ExtensionsCount = Object.create(null);
  const filterFileByCount = (fileItem: SelectFileItem) => {
    const Type = getFileExtension(fileItem);
    if (Type) {
      ExtensionsCount[Type]--;
      if (ExtensionsCount[Type] < 0) {
        return true;
      }
      return false;
    }
    return true;
  };
  /**
   * 处理文件
   * - 去重
   * - 校验不同类型文件个数
   * - 检验总个数
   * - 检验文件总大小
   */
  const handleFiles = (fileList: SelectFileItem[]) => {
    const fileMap = new Map(files.value.map((item: SelectFileItem) => [item.filePath, item]));
    fileList.forEach((item) => {
      fileMap.set(item.filePath, item);
    });
    filterRules.Extensions.forEach((item) => {
      ExtensionsCount[item.Type] = item.MaxNum;
    });

    const newFiles: any[] = [];
    let fileSize = 0;
    for (let fileItem of fileMap.values()) {
      if (fileItem.fileSize === 0) {
        ToastEventBus.emit("add", {
          severity: "warn",
          summary: "Warn Message",
          detail: `Empty files are not supported: ${fileItem.fileName}`,
          life: 3000,
        });
        continue;
      }
      if (newFiles.length === filterRules.MaxFileCount) {
        ToastEventBus.emit("add", {
          severity: "warn",
          summary: "Warn Message",
          detail: "Number of selected files exceeds the maximum limit",
          life: 3000,
        });
        break;
      }
      if (rules?.length && rules?.includes(fileItem.fileType)) {
        ToastEventBus.emit("add", {
          severity: "warn",
          summary: "Warn Message",
          detail: `${fileItem.fileName} is not supported`,
          life: 3000,
        });
        break;
      }
      fileSize += +fileItem.fileSize;
      if (fileSize > filterRules.MaxFileSize) {
        ToastEventBus.emit("add", {
          severity: "warn",
          summary: "Warn Message",
          detail: "Total size of uploaded files exceeds the maximum limit",
          life: 3000,
        });
        fileSize -= +fileItem.fileSize;
        continue;
      }
      if (filterFileByCount(fileItem)) {
        ToastEventBus.emit("add", {
          severity: "warn",
          summary: "Warn Message",
          detail: "Number of selected files exceeds the maximum limit",
          life: 3000,
        });
        continue;
      }
      newFiles.push(fileItem);
    }
    files.value = newFiles;
  };

  const onDragFile = () => {
      console.log('onDragFile');
      WebviewMessager.on("/ContextualPrompt/dragFileUpload", (data) => {
      const { Data, ErrorCode } = data;
      console.log(2222,Data)
      if (ErrorCode === 1 && typeof Data === "string") {
        ToastEventBus.emit("add", {
          severity: "error",
          summary: "Warn Message",
          detail: Data,
          life: 4000,
        });
      } else {
        const { fileList } = data.Data as any;
        handleFiles(
          fileList.map((item: any) => ({
            isFileLoading: false,
            converted: !!item.PdfFileName || false,
            convertPath: item.PdfPath || item.FilePath,
            fileName: item.FileName,
            filePath: item.FilePath,
            fileSize: Number(item.FileSize),
            fileBase64: item.Base64 || "",
            fileType: item.FileType.toLocaleLowerCase(),
          })),
        );
        setConvertfiles();
      }
    });
  };
  const onFileSelect = async () => {
    const { data } = await selectFile({ Data: {} });
    const { fileList } = data.Data as any;
    handleFiles(
      fileList.map((item: any) => ({
        isFileLoading: false,
        converted: item.Converted || false,
        convertPath: item.ConvertPath || item.FilePath,
        fileName: item.FileName,
        filePath: item.FilePath,
        fileSize: item.FileSize,
        fileBase64: item.Base64 || "",
        fileType: item.FileType.toLocaleLowerCase(),
      })),
    );
    setConvertfiles();
  };
  const onFileDelete = (filePath: string) => {
    files.value = files.value.filter((item) => item.filePath != filePath);
  };
  const onFileAdd = (fileList: SelectFileItem[]) => {
    handleFiles(fileList);
    setConvertfiles();
  };
  const onFileclear = () => {
    files.value = [];
  };
  const setConvertfiles = async () => {
    const needConvertList = files.value.filter((fileItem) => {
      const needConvert =
        "Word" === getFileExtension(fileItem) &&
        fileItem.converted === false &&
        fileItem.isFileLoading === false;
      if (needConvert) {
        fileItem.isFileLoading = true;
      }
      return needConvert;
    });
    console.log("needConvertList", needConvertList);
    if (needConvertList.length) {
      sendFilesConvert({
        Data: {
          fileList: needConvertList,
        },
      });
      // setTimeout(() => {
      //   EventBus.emit('FileConverted', {
      //     Data: {
      //       fileList: needConvertList.map(item=>{
      //         return {
      //           FilePath: item.filePath,
      //           ConvertPath: item.convertPath,
      //           Converted: true,
      //         }
      //       })
      //     }
      //   })
      // }, 300)
    }
  };
  const onFileConverted = () => {
    WebviewMessager.on("FileConverted", ({ Data }) => {
      console.log("FileConverted----------", Data);
      const { fileList } = Data as any;
      const fileMap = new Map(files.value.map((item) => [item.filePath, item]));
      fileList.forEach((item: any) => {
        if (fileMap.has(item.FilePath)) {
          Object.assign(fileMap.get(item.FilePath), {
            isFileLoading: false,
            converted: item.Converted,
            convertPath: item.ConvertPath,
          });
        }
      });
    });
  };

  onMounted(() => {
    getFilterRules();
    needDrag && onDragFile();
    onFileConverted();
  });
  return {
    files,
    onFileDelete,
    onFileAdd,
    onFileclear,
    onFileSelect,
    getFilterRules,
  };
};

const FileScope = Object.create(null);

export type FilesManager = ReturnType<typeof useFiles>;
export type FilesManagerScope = FilesManager & {
  deleteScope: () => void;
};

/** 携带作用域的文件列表管理 */
export const useFileScope = (opts?: { scope?: string; rules?: string[] }): FilesManagerScope => {
  const { scope = Symbol(), rules } = opts || {};
  if (scope && FileScope[scope]) {
    return FileScope[scope];
  }
  FileScope[scope] = useFiles({ rules: rules });
  FileScope[scope]["deleteScope"] = () => {
    delete FileScope[scope];
  };
  return FileScope[scope];
};
