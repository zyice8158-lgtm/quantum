import { imageTypes } from '@/constant/index'

export const fileToImageBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.readAsDataURL(file)
  })
}

export const imageBase64ToFile = async (imageBase64, fileName?) => {
  const url = imageBase64

  const type = imageBase64.split(';')[0].split(':')[1]

  const _fileName = fileName
    ? `${fileName}.${type.split('/')[1]}`
    : `${new Date().getTime()}_${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}.${
        type.split('/')[1]
      }`

  return new File([await (await fetch(url)).blob()], _fileName, {
    type,
  })
}

// 图片 Base64 转格式 默认转为 png
export const translateImageBase64 = async (imageBase64) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = window.document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");

      // 添加原图
      ctx.drawImage(image, 0, 0);

      resolve(canvas.toDataURL());
    };

    image.src = imageBase64;
  });
};

// 图片 file 转为 png 类型
export const translateImageFile = async (file) => {
  return await imageBase64ToFile(
    await translateImageBase64(await fileToImageBase64(file))
  );
};

export const urlToFile = async (url) => {
  const extension = url.split('.')[url.split('.').length - 1].toLowerCase()
  let type = ''

  if (imageTypes.includes(extension)) {
    type = `image/${extension}`
  }

  let blob = null

  try {
    blob = await (await fetch(url)).blob()
  } catch (error) {
    blob = null
  }

  if (!blob) {
    return ''
  }

  return new File([blob], `${new Date().getTime()}.${extension}`, {
    type,
  })
}

export const saveFile = (file, init = () => {}, success = () => {}, fail = (_) => {}) => {
  init()

  window
    .showSaveFilePicker({
      types: [
        {
          description: '',
          accept: { [`${file.type.split('/')[0]}/*`]: [`.${file.type.split('/')[1]}`] },
        },
      ],
    })
    .then(async (fileHandle) => {
      const writable = await fileHandle.createWritable()

      await writable.write(file)

      await writable.close()

      success()
    })
    .catch((e) => {
      fail(e)
    })
}
