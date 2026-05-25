import "server-only";

import { getImageDimensionsFromBase64 } from "@/lib/makeEditable/imageRegionUtils";

/** Server-side: use sharp for reliable image dimensions from base64 bytes. */
export async function resolveImageDimensions(
  data: string,
  mimeType: string
): Promise<{ width: number; height: number }> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(Buffer.from(data, "base64")).metadata();
    if (meta.width && meta.height && meta.width > 0 && meta.height > 0) {
      return { width: meta.width, height: meta.height };
    }
  } catch {
    /* fall through */
  }
  return getImageDimensionsFromBase64(data, mimeType);
}
