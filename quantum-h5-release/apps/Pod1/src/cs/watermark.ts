export const watermark = (_, message, data) => {
  if (message.cmd === 'cz.image.watermark') {
    window.dispatchEvent(
      new CustomEvent('cz.image.watermark', {
        detail: { fileUrl: data?.imagePath },
      })
    )
  }
}
