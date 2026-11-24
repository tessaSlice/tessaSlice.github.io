import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../../public/", import.meta.url));

/** Return the public image path only when that file is inside public/. */
export function existingProjectImage(image?: string): string | undefined {
    if (!image || /^https?:\/\//i.test(image)) return undefined;
    if (!image.startsWith("/") || image.startsWith("//")) return undefined;
    const relativePath = image.slice(1);
    // join() follows ".." and drops publicDir when the next segment is absolute.
    if (!relativePath || relativePath.startsWith("/") || relativePath.split("/").includes("..")) {
        return undefined;
    }
    return existsSync(join(publicDir, relativePath)) ? image : undefined;
}
