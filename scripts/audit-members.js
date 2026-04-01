import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();

async function main() {
  const membersDir = path.join(rootDir, "data", "members");
  const indexPath = path.join(membersDir, "index.json");
  const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
  const memberFiles = (await fs.readdir(membersDir))
    .filter((filename) => /^hr-\d{4}\.json$/.test(filename))
    .sort();

  const members = await Promise.all(memberFiles.map(async (filename) => {
    const absolutePath = path.join(membersDir, filename);
    return JSON.parse(await fs.readFile(absolutePath, "utf8"));
  }));

  const duplicateNames = collectDuplicates(members, (member) => member.name);
  const duplicatePhotoRefs = collectDuplicates(members, (member) => member.photo);
  const duplicateSourcePages = collectDuplicates(
    members.filter((member) => member.sourcePage !== null),
    (member) => `${member.sourcePage}:${member.name}`,
  );
  const indexOnlyIds = new Set((index.members ?? []).map((member) => member.id));
  const fileOnlyIds = new Set(members.map((member) => member.id));

  console.log("=== Member Audit Summary ===");
  console.log(`Members: ${members.length}`);
  console.log(`Index summaries: ${(index.members ?? []).length}`);
  console.log(`Single-seat: ${members.filter((member) => member.electionType === "single").length}`);
  console.log(`Proportional: ${members.filter((member) => member.electionType === "proportional").length}`);
  console.log(`Missing prefecture: ${members.filter((member) => !member.prefecture).length}`);
  console.log(`Missing source page: ${members.filter((member) => member.sourcePage === null).length}`);
  console.log("");

  printSection("Duplicate names", duplicateNames);
  printSection("Duplicate photo references", duplicatePhotoRefs);
  printSection("Same sourcePage + name pairs", duplicateSourcePages);

  const missingFromIndex = [...fileOnlyIds].filter((id) => !indexOnlyIds.has(id));
  const missingFromFiles = [...indexOnlyIds].filter((id) => !fileOnlyIds.has(id));

  console.log("=== Index Consistency ===");
  console.log(`Missing from index: ${missingFromIndex.length ? missingFromIndex.join(", ") : "none"}`);
  console.log(`Missing from files: ${missingFromFiles.length ? missingFromFiles.join(", ") : "none"}`);
  console.log("");

  console.log("=== Quick Review Hints ===");
  console.log("- Duplicate photo references are strong candidates for face/name mismatch checks.");
  console.log("- Duplicate names are not always errors, but should be visually checked alongside party and district.");
  console.log("- To inspect one member quickly, open data/members/hr-XXXX.json and compare with data/photos/hr-XXXX.jpg.");
}

function collectDuplicates(items, keySelector) {
  const grouped = new Map();

  items.forEach((item) => {
    const key = String(keySelector(item) ?? "").trim();
    if (!key) {
      return;
    }

    const list = grouped.get(key) ?? [];
    list.push(item.id);
    grouped.set(key, list);
  });

  return [...grouped.entries()]
    .filter(([, ids]) => ids.length > 1)
    .sort(([left], [right]) => left.localeCompare(right, "ja"));
}

function printSection(title, entries) {
  console.log(`=== ${title} ===`);

  if (entries.length === 0) {
    console.log("none");
    console.log("");
    return;
  }

  entries.forEach(([key, ids]) => {
    console.log(`${key}: ${ids.join(", ")}`);
  });
  console.log("");
}

await main();
