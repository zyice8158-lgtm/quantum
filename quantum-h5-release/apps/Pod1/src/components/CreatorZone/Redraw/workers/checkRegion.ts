self.onmessage = (e) => {
  let isEmpty = true;

  const pixels = e.data.imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] > 0) {
      isEmpty = false;

      break;
    }
  }

  self.postMessage({ isEmpty });
};
