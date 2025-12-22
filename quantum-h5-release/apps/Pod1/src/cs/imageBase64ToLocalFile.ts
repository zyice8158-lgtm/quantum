import { v4 as uuid } from "uuid";

export const imageBase64ToLocalFile = async (imageBase64) => {
  const messageId = uuid();

  const callback = async (e) => {
    if (e?.data?.MessageId === messageId) {
      window?.chrome?.webview?.removeEventListener("message", callback);

      window.dispatchEvent(
        new CustomEvent(messageId, {
          detail: e?.data?.Data,
        })
      );
    }
  };

  window?.chrome?.webview?.addEventListener("message", callback);

  return new Promise((resolve) => {
    const callback = (e) => {
      window.removeEventListener(messageId, callback);

      resolve(e.detail?.filePath);
    };

    window.addEventListener(messageId, callback);

    window?.chrome?.webview?.postMessage({
      MessageMethod: "Base64Save",
      MessageId: messageId,
      Data: {
        base64: imageBase64,
      },
    });
  });
};
