import { WebviewMessager, sendFileStorage, selectFile, sendFilesConvert } from '@libs/service';
import { ChatController } from '../../QuantumUI';
import { v4 as uuidv4 } from "uuid";
import { FileSearchListType } from "../ChatBaseComponent/types";
import { ToastEventBus } from 'primevue';
/**
 * 
 * 拖拽和加号选择不需要监听FileConverted，但是pod1 filesearch需要converted监听然后改变loading状态
 */
const handleFileUpload = async (chat: ChatController, Data: {
  fileList: Array<{ FilePath: string, FileName: string, FileSize: number, FileType: string, ConvertPath: string, Converted: boolean }>, errors: {
    Msg: string;
    Error: number;
  }[]
}) => {
  const fileList = Data.fileList;
  const errors = Data.errors;
  if (errors && errors.length) {
    const Error_10001 = 'Total size of uploaded files exceeds the maximum limit'
    const Error_10002 = 'Number of selected files exceeds the maximum limit'
    if (errors[0].Error === 10001) {
      ToastEventBus.emit('add', { severity: 'warn', summary: 'Warn Message', detail: Error_10001, life: 3000 })
    } else if (errors[0].Error === 10002) {
      ToastEventBus.emit('add', { severity: 'warn', summary: 'Warn Message', detail: Error_10002, life: 3000 })
    } else {
      ToastEventBus.emit('add', { severity: 'warn', summary: 'Warn Message', detail: 'unknown', life: 3000 })
    }
  }
  // // 去重
  const existingPaths = new Set(chat.fileSearchList.map(item => item.filePath));
  //存在的进行更新
  const existingFiles = fileList.filter(item => existingPaths.has(item.FilePath));
  existingFiles.forEach(item => {
    const index = chat.fileSearchList.findIndex(file => file.filePath === item.FilePath);
    if (index > -1) {
      console.log('更新文件', item.FilePath)
      chat.updateSearchList(index,{filePath:item.FilePath,isFileLoading:false})
    }
  })
  // //不存在的进行添加
  // const newData = fileList.filter(item => !existingPaths.has(item.FilePath));
  const newFileList = fileList.filter(item => !existingPaths.has(item.FilePath)).map(item => {
    const fileId = uuidv4();
    return {
      fileId,
      icon: '',
      fileName: item.FileName,
      fileType: item.FileType,
      filePath: item.FilePath,
      isFileLoading: false,
      convertPath: item.ConvertPath,
    };
  });
  chat.setSearchList(newFileList);
  // 这里循环加入延迟入库，因为同步入库C#因为报错403，所以只能用异步入库
  // for (let i = 0; i < newFileList.length; i++) {
  //   setTimeout(async () => {
  //     await uploadFileInward(props, newFileList[i]);
  //   }, 500 * i);
  // }
}
// 文件入库
export async function uploadFileInward(props: { chat: ChatController | undefined }, fileItem: FileSearchListType) {
  WebviewMessager.on('AddFileToTemp', (data) => {
    console.log('AddFileToTemp-----', data);
    try {
      const res = data.Data.Chunk[0];
      console.log('AddFileToTempres-----', res);
      const storedFileIndex = props.chat.fileSearchList.findIndex(item => item.filePath === res.path);
      if (storedFileIndex !== -1) {
        props.chat.updateSearchList(storedFileIndex, { filePath: res.path, isFileLoading: false });
      }
    } catch (error) {
      console.error('AddFileToTempError-----', error);
    }
  });
  // 调用文件入库接口
  const res = await sendFileStorage(
    {
      Data: {
        "fileList": [
          {
            "path": fileItem.filePath
          }
        ]
      }
    });
  console.log('sendFileStorage----------', res);
}

export const dragFileUpload = async (chat: ChatController) => {
  WebviewMessager.on('/ContextualPrompt/dragFileUpload', (data) => {
    const { Data, ErrorCode } = data;
    if(ErrorCode === 1 && typeof Data === 'string') {
      ToastEventBus.emit('add', { severity: 'warn', summary: 'Warn Message', detail: Data, life: 3000 })
    } else {
      handleFileUpload(chat, Data);
    }
  });
}
export async function convertFileSuccessed(chat: ChatController) {
  WebviewMessager.on('FileConverted', ({ Data }) => {
    console.log('convertFileSuccessed----------', Data);
    handleFileUpload(chat, Data);
  });
}
// 新增文件
export const handleAddFile = async (chat: ChatController) => {
  try {
    const {
      data: { ErrorCode, ErrorMessage, Data },
    } = await selectFile({ MessageSource: '', Data: {} });

    if (ErrorCode !== 0) {
      console.error("File selection error:", ErrorMessage);
      return;
    }
    handleFileUpload(chat, Data);
  } catch (error) {
    console.error("Error handling file selection:", error);
  }
};
// checkbox 新增文件
export const handleConvertFiles = async (chat: ChatController, searchFileList: FileSearchListType | FileSearchListType[]) => {
  try {
    const {
      data: { ErrorCode, ErrorMessage, Data },
    } = await sendFilesConvert({
      MessageSource: '', Data: {
        fileList: Array.isArray(searchFileList) ? searchFileList : [searchFileList]
      }
    });

    if (ErrorCode !== 0) {
      console.error("File convert error:", ErrorMessage);
      return;
    }
  } catch (error) {
    console.error("Error handling file convert:", error);
  }
};


