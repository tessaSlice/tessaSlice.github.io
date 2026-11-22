import { statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = resolve(fileURLToPath(new URL("../../public/", import.meta.url)));

/** Return a root-relative path only when it is a file inside public/. */
export function existingProjectImage(image?: string): string | undefined {
    if (!image || /^https?:\/\//i.test(image)) return undefined;
    if (!image.startsWith("/") || image.startsWith("//")) return undefined;

    const file = resolve(publicDir, image.slice(1));
    const rel = relative(publicDir, file);
    if (!rel || isAbsolute(rel) || rel.split(sep).includes("..")) return undefined;

    try {
        if (!statSync(file).isFile()) return undefined;
    } catch {
        return undefined;
    }

    return `/${rel.split(sep).join("/")}`;
}
