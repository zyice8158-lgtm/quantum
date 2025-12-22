const unitText: Record<string, string[]> = {
  ARS: ['es-AR', 'en-US'], // 'AR'
  AUD: ['en-AU'], // 'AU'
  BRL: ['pt-BR', 'en-US'], // 'BR'
  CAD: ['en-CA', 'fr-CA'], // 'CA'
  EUR: ['de-DE','en-GB','es-ES', 'en-GB', 'ca-ES', 'fr-FR','en-GB', 'it-IT','en-GB', 'en-IE'], // 'DE' ES, FR, PT, IE
  GBP: ['en-GB'], // 'GB'
  INR: ['en-GB'], // 'IN'
  JPY: ['ja-JP', 'en-US'], // 'JP'
  MXN: ['es-MX', 'en-US'], // 'MX'
}

export const priceFormat = (currencyCode: string, value: number) => {
  return new Intl.NumberFormat(unitText[currencyCode] ? unitText[currencyCode][0] : 'en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}
