export type OCRProgressCallback = (status: string) => void

export async function extractDocumentText(file: File, onProgress?: OCRProgressCallback): Promise<string> {
  const progress = (message: string) => {
    onProgress?.(message)
  }

  progress('Preparing image for OCR…')

  if (!file.type.startsWith('image/')) {
    progress('This file type is not supported by OCR yet.')
    return Promise.resolve('')
  }

  const dataUrl = await readFileAsDataUrl(file)
  progress('Scanning image…')
  await sleep(450)
  progress('Detecting text in the image…')
  await sleep(550)
  progress('Cleaning up extracted text…')
  await sleep(300)

  const nameHint = file.name ? `from ${file.name}` : 'from your image'
  return `Mock OCR extraction ${nameHint}: Ihr Zahlungsaufforderungsschreiben verlangt eine Zahlung von 238,50 € innerhalb von 7 Tagen. Bitte prüfen Sie die Frist und antworten Sie bei Fragen.`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('Unable to read file as data URL'))
    }
    reader.onerror = () => reject(new Error('Unable to load file for OCR'))
    reader.readAsDataURL(file)
  })
}

function sleep(duration: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, duration))
}
