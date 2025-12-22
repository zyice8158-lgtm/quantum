import { v4 as uuid } from "uuid";

export const getImages = async ({ toolName, parameters }) => {
  const messageId = uuid();

  const callback = async (e) => {
    console.log("res", e);

    if (e?.data?.MessageId === messageId) {
      window?.chrome?.webview?.removeEventListener("message", callback);

      let fileName = "";

      try {
        const result = JSON.parse(e?.data?.Data?.Result);

        const localFileName = result?.mediaItem?.fileName;

        if (localFileName) {
          fileName = `https://quantumapp.locallenovo/czimage/${result?.modelType}/${
            localFileName?.replaceAll("/", "\\")?.split("\\").slice(-1)[0]
          }`;

          console.log("fileName", fileName);
        }
      } catch (err) {}

      window.dispatchEvent(
        new CustomEvent(messageId, {
          detail: { fileName },
        })
      );
    }
  };

  window?.chrome?.webview?.addEventListener("message", callback);

  return new Promise((resolve) => {
    const callback = (e) => {
      window.removeEventListener(messageId, callback);

      resolve(e.detail.fileName);
    };

    window.addEventListener(messageId, callback);

    console.log("req", {
      MessageMethod: "SendTools",
      MessageId: messageId,
      Data: {
        toolName,
        parameters,
      },
    });

    window?.chrome?.webview?.postMessage({
      MessageMethod: "SendTools",
      MessageId: messageId,
      Data: {
        toolName,
        parameters,
      },
    });
  });
};
