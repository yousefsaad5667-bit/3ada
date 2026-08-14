// ─────────────────────────────────────────────────────────────────────────────
// chart-export.util.ts
// PNG + SVG export helpers for canvas-based and CSS-grid heatmap chart types.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Downloads the given canvas as a PNG file.
 * @param canvas   The HTMLCanvasElement to export.
 * @param filename Base filename without extension.
 * @param pixelRatio  Device pixel ratio for retina quality (default 2).
 */
export function exportAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
  pixelRatio = 2
): void {
  const sanitized = sanitizeFilename(filename);

  // For retina export we redraw at higher pixel ratio onto a temp canvas
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width * pixelRatio;
  exportCanvas.height = canvas.height * pixelRatio;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(pixelRatio, pixelRatio);
  ctx.drawImage(canvas, 0, 0);

  triggerDownload(exportCanvas.toDataURL('image/png'), `${sanitized}.png`);
}

/**
 * Downloads the canvas as a bitmap-wrapped SVG file (canvas → data URL → SVG <image>).
 * This is a bitmap-in-SVG approach — suitable for Chart.js canvas charts.
 * For true vector SVG from DOM elements, use `exportAsSvgFromDom`.
 */
export function exportAsSvg(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  const sanitized = sanitizeFilename(filename);
  const dataUrl = canvas.toDataURL('image/png');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${sanitized}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Serializes a DOM element (e.g., a CSS-grid heatmap) as an SVG file.
 * Clones the element, inlines computed styles, and serializes via XMLSerializer.
 * @param element  The root HTMLElement to serialize.
 * @param filename Base filename without extension.
 */
export function exportAsSvgFromDom(element: HTMLElement, filename: string): void {
  const sanitized = sanitizeFilename(filename);
  const rect = element.getBoundingClientRect();

  // Clone and inline computed styles
  const clone = element.cloneNode(true) as HTMLElement;
  inlineComputedStyles(element, clone);

  const foreignObject = `<foreignObject width="${rect.width}" height="${rect.height}">${new XMLSerializer().serializeToString(clone)}</foreignObject>`;
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">${foreignObject}</svg>`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${sanitized}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function sanitizeFilename(filename: string): string {
  return filename.trim().replace(/\s+/g, '_') || 'chart';
}

function inlineComputedStyles(source: Element, target: Element): void {
  const computed = window.getComputedStyle(source);
  const el = target as HTMLElement;
  for (let i = 0; i < computed.length; i++) {
    const prop = computed[i];
    try {
      el.style.setProperty(prop, computed.getPropertyValue(prop));
    } catch {
      // ignore read-only properties
    }
  }
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i]);
  }
}
