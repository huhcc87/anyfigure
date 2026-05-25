/** Export a figure card DOM node to PNG (WYSIWYG — includes applied label overlays). */
export async function exportFigureDomToPng(
  container: HTMLElement,
  pixelRatio = 2
): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(container, {
    pixelRatio,
    backgroundColor: "#ffffff",
    cacheBust: true,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return !node.classList.contains("export-exclude");
    },
  });
}
