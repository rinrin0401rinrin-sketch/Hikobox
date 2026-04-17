import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const membersDir = path.join(rootDir, "data", "members");
const photosDir = path.join(rootDir, "data", "photos");
const thumbsDir = path.join(photosDir, "thumbs");
const searchIndexPath = path.join(membersDir, "search-index.json");

async function main() {
  const memberFiles = (await fs.readdir(membersDir))
    .filter((name) => /^hr-\d{4}\.json$/.test(name))
    .sort();
  const photoFiles = new Set(
    (await fs.readdir(photosDir))
      .filter((name) => /\.(jpg|jpeg|png)$/i.test(name)),
  );
  const thumbFiles = new Set(
    (await fs.readdir(thumbsDir))
      .filter((name) => /\.(jpg|jpeg|png)$/i.test(name)),
  );
  const searchIndex = JSON.parse(await fs.readFile(searchIndexPath, "utf8"));
  const searchIndexIds = new Set((searchIndex.members ?? []).map((member) => member.id));

  const missingPhotos = [];
  const missingThumbs = [];
  const missingFromSearchIndex = [];

  for (const filename of memberFiles) {
    const id = filename.replace(/\.json$/, "");
    const photoName = `${id}.jpg`;

    if (!photoFiles.has(photoName)) {
      missingPhotos.push(photoName);
    }

    if (!thumbFiles.has(photoName)) {
      missingThumbs.push(photoName);
    }

    if (!searchIndexIds.has(id)) {
      missingFromSearchIndex.push(id);
    }
  }

  console.log("=== Asset Verification ===");
  console.log(`Member files: ${memberFiles.length}`);
  console.log(`Photos: ${photoFiles.size}`);
  console.log(`Thumbnails: ${thumbFiles.size}`);
  console.log(`Search index entries: ${searchIndexIds.size}`);
  console.log(`Missing photos: ${missingPhotos.length}`);
  console.log(`Missing thumbnails: ${missingThumbs.length}`);
  console.log(`Missing search index entries: ${missingFromSearchIndex.length}`);

  if (missingPhotos.length > 0) {
    console.log(`Missing photos sample: ${missingPhotos.slice(0, 10).join(", ")}`);
  }

  if (missingThumbs.length > 0) {
    console.log(`Missing thumbnails sample: ${missingThumbs.slice(0, 10).join(", ")}`);
  }

  if (missingFromSearchIndex.length > 0) {
    console.log(`Missing search index sample: ${missingFromSearchIndex.slice(0, 10).join(", ")}`);
  }

  if (missingPhotos.length > 0 || missingThumbs.length > 0 || missingFromSearchIndex.length > 0) {
    process.exitCode = 1;
  }
}

await main();
