import { v4 as uuid } from "uuid";
import { POST } from "./http";

export const getImages = async ({ toolName, parameters }) => {
  const messageId = uuid();

  const res = await POST(
    "https://quantumapp.locallenovo/creatorzone/generatepicture",
    {},
    {
      MessageMethod: "SendTools",
      MessageId: messageId,
      Data: {
        toolName,
        parameters,
      },
    },
    false
  );

  let fileName = "";

  try {
    const localFileName = res?.Data?.mediaItem?.fileName;

    if (localFileName) {
      fileName = `https://quantumapp.locallenovo/czimage/${res?.Data?.modelType}/${
        localFileName?.replaceAll("/", "\\")?.split("\\").slice(-1)[0]
      }`;

      console.log("fileName", fileName);
    }
  } catch (err) {}

  return fileName;
};
