import { v4 as uuid } from "uuid";
import { POST } from "./http";

export const getGallery = async ({
  pageSize,
  pageNumber,
  sortBy,
}: {
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
}) => {
  const messageId = uuid();

  return await POST(
    "https://quantumapp.locallenovo/creatorzone/getgallery",
    {},
    {
      MessageMethod: "SendTools",
      MessageId: messageId,
      Data: { pageSize, pageNumber, sortBy, states: "available" },
    },
    false
  );
};

export const getBlobData = async ({ blobId }: { blobId: string }) => {
  const messageId = uuid();

  return await POST(
    "https://quantumapp.locallenovo/creatorzone/getblobdata",
    {},
    {
      MessageMethod: "SendTools",
      MessageId: messageId,
      Data: { blobId },
    },
    false
  );
};

// export const getUserImages = async ({
//   pageSize,
//   pageNumber,
//   sortBy,
// }: {
//   pageSize?: number;
//   pageNumber?: number;
//   sortBy?: string;
// }) => {
//   const res = await getGallery({ pageSize, pageNumber, sortBy });

//   let images = [];

//   try {
//     images = await Promise.all(
//       JSON.parse(res?.Data?.response)?.content?.map(async (image) => {
//         const res = await getBlobData({
//           blobId: image.id,
//         });

//         try {
//           return {
//             imageId: image.id,
//             url: JSON.parse(res?.Data?.response)?.base64,
//             createTime: image.created,
//           };
//         } catch (err) {
//           return {
//             imageId: image.id,
//             url: "",
//             createTime: image.created,
//           };
//         }
//       })
//     );
//   } catch (err) {}

//   return {
//     success: true,
//     images,
//     pageSize,
//     pageNumber,
//   };
// };

export const getUserImages = async ({
  pageSize,
  pageNumber,
  sortBy,
}: {
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
}) => {
  const messageId = uuid();

  const res = await POST(
    "https://quantumapp.locallenovo/creatorzone/getimggallery",
    {},
    { MessageMethod: "SendTools", MessageId: messageId, Data: {} },
    false
  );

  const images = res?.Data?.map((image) => {
    return {
      imageId: image.id,
      url: image.filename,
      content: image.prompt,
      width: image.width,
      height: image.height,
      createTime: image.created,
    };
  });

  return {
    success: true,
    images,
    pageSize,
    pageNumber,
  };
};
