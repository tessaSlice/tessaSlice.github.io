import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));

/** Return the public image path only when that field points at a real file. */
export function existingProjectImage(image?: string): string | undefined {
    if (!image) return undefined;
    if (/^https?:\/\//i.test(image)) return image;
    if (!image.startsWith("/")) return undefined;
    return existsSync(join(publicDir, image.slice(1))) ? image : undefined;
}
