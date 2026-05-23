import type { ExportOptions } from "@/types";

export async function exportFigure(
  canvasElement: HTMLElement,
  options: ExportOptions
): Promise<void> {
  switch (options.format) {
    case "png":
      await exportAsPNG(canvasElement, options);
      break;
    case "svg":
      await exportAsSVG(canvasElement, options);
      break;
    case "pdf":
      await exportAsPDF(canvasElement, options);
      break;
    case "pptx":
      await exportAsPPTX(canvasElement, options);
      break;
  }
}

async function exportAsPNG(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const { saveAs } = await import("file-saver");

  const scale = (options.resolution || 150) / 96;

  const dataUrl = await toPng(element, {
    quality: (options.quality || 95) / 100,
    pixelRatio: scale,
    backgroundColor: options.transparentBackground ? undefined : "#ffffff",
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, `anyfigure-export.png`);
}

async function exportAsSVG(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { toSvg } = await import("html-to-image");
  const { saveAs } = await import("file-saver");

  const dataUrl = await toSvg(element, {
    backgroundColor: options.transparentBackground ? undefined : "#ffffff",
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, `anyfigure-export.svg`);
}

async function exportAsPDF(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const { PDFDocument } = await import("pdf-lib");
  const { saveAs } = await import("file-saver");

  const scale = (options.resolution || 150) / 96;
  const dataUrl = await toPng(element, {
    pixelRatio: scale,
    backgroundColor: options.transparentBackground ? undefined : "#ffffff",
  });

  const pdfDoc = await PDFDocument.create();
  const imgBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
  const img = await pdfDoc.embedPng(imgBytes);

  const page = pdfDoc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
  saveAs(blob, `anyfigure-export.pdf`);
}

async function exportAsPPTX(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const PptxGenJS = (await import("pptxgenjs")).default;
  const { saveAs } = await import("file-saver");

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: options.transparentBackground ? undefined : "#ffffff",
  });

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "FIGURE", width: 10, height: 7.5 });
  pptx.layout = "FIGURE";

  const slide = pptx.addSlide();
  slide.addImage({
    data: dataUrl,
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
  });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  saveAs(blob, `anyfigure-export.pptx`);
}
