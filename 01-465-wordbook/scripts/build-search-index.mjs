import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const membersDir = path.join(rootDir, "data", "members");
const indexPath = path.join(membersDir, "index.json");
const searchIndexPath = path.join(membersDir, "search-index.json");

const baseIndex = JSON.parse(await fs.readFile(indexPath, "utf8"));
const memberFiles = (await fs.readdir(membersDir))
  .filter((filename) => /^hr-\d{4}\.json$/.test(filename))
  .sort();

const memberMap = new Map();

for (const filename of memberFiles) {
  const absolutePath = path.join(membersDir, filename);
  const member = JSON.parse(await fs.readFile(absolutePath, "utf8"));
  memberMap.set(member.id, member);
}

const searchIndex = {
  version: baseIndex.version,
  generatedAt: new Date().toISOString().slice(0, 10),
  totalMembers: baseIndex.totalMembers,
  members: (baseIndex.members ?? []).map((summary) => {
    const member = memberMap.get(summary.id) ?? {};

    return {
      ...summary,
      nameKana: member.nameKana ?? "",
      wins: member.wins ?? 0,
      career: Array.isArray(member.career) ? member.career : [],
    };
  }),
};

await fs.writeFile(searchIndexPath, `${JSON.stringify(searchIndex, null, 2)}\n`);
console.log(`Wrote ${path.relative(rootDir, searchIndexPath)}`);
