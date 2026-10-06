// Exportación de documentos en el navegador.
// Usa html-to-image para rasterizar el nodo y jsPDF para exportar a Carta (Letter) / PNG.
// El nodo que se pasa siempre debe tener 794px de ancho (lo garantiza document-actions.tsx).

import { toPng } from 'html-to-image'

export type ExportAction = 'share' | 'download'

function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.addEventListener('click', (e) => e.stopPropagation())
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function shareOrDownload(file: File, fallback: () => void) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ title: file.name, files: [file] })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing file:', err)
        fallback()
      }
    }
  } else {
    fallback()
  }
}

export async function exportNodeToImage(node: HTMLElement, filename: string, action: ExportAction = 'share') {
  const dataUrl = await nodeToPng(node)
  const fullFilename = `${filename}.png`

  if (action === 'download') {
    triggerDownload(dataUrl, fullFilename)
    return
  }
  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], fullFilename, { type: 'image/png' })
  await shareOrDownload(file, () => triggerDownload(dataUrl, fullFilename))
}

export async function exportNodeToPdf(node: HTMLElement, filename: string, action: ExportAction = 'share') {
  const dataUrl = await nodeToPng(node)
  const { jsPDF } = await import('jspdf')

  const img = new Image()
  img.src = dataUrl
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  // Tamaño Carta (215.9 mm x 279.4 mm)
  const pdf = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  let renderWidth = usableWidth
  let renderHeight = usableWidth * (img.height / img.width)
  let y = margin

  if (renderHeight > usableHeight) {
    const scale = Math.min(usableWidth / img.width, usableHeight / img.height)
    renderWidth = img.width * scale
    renderHeight = img.height * scale
    y = (pageHeight - renderHeight) / 2
  }
  pdf.addImage(dataUrl, 'PNG', (pageWidth - renderWidth) / 2, y, renderWidth, renderHeight)

  const fullFilename = `${filename}.pdf`
  if (action === 'download') {
    pdf.save(fullFilename)
    return
  }
  const file = new File([pdf.output('blob')], fullFilename, { type: 'application/pdf' })
  await shareOrDownload(file, () => pdf.save(fullFilename))
}
