import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  ELECTION_TYPES,
  REQUIRED_MEMBER_KEYS,
  STATUS_VALUES,
  isBlankString,
  normalizeText,
} from "../src/member-schema.js";

const MEMBER_FILE_PATTERN = /^hr-\d{4}\.json$/;

export async function validateMembersProject(rootDir = process.cwd()) {
  const membersDir = path.join(rootDir, "data", "members");
  const photoDir = path.join(rootDir, "data", "photos");
  const errors = [];

  const dirEntries = await fs.readdir(membersDir, { withFileTypes: true });
  const memberFiles = dirEntries
    .filter((entry) => entry.isFile() && MEMBER_FILE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const records = [];
  const idToFiles = new Map();

  for (const filename of memberFiles) {
    const absolutePath = path.join(membersDir, filename);
    const raw = await fs.readFile(absolutePath, "utf8");
    const member = JSON.parse(raw);
    records.push({ filename, absolutePath, member });

    const files = idToFiles.get(member.id) ?? [];
    files.push(filename);
    idToFiles.set(member.id, files);
  }

  for (const record of records) {
    errors.push(...(await validateMemberRecord(record.member, {
      filename: record.filename,
      rootDir,
      photoDir,
    })));
  }

  idToFiles.forEach((files, id) => {
    if (files.length > 1) {
      errors.push(`Duplicate id "${id}" found in: ${files.join(", ")}`);
    }
  });

  errors.push(...(await validateIndexFile(rootDir, records)));

  return {
    ok: errors.length === 0,
    memberCount: records.length,
    errors,
  };
}

export async function validateMemberRecord(member, context) {
  const { filename, rootDir, photoDir } = context;
  const errors = [];

  if (!member || typeof member !== "object" || Array.isArray(member)) {
    return [`${filename}: member record must be a JSON object.`];
  }

  REQUIRED_MEMBER_KEYS.forEach((key) => {
    if (!(key in member)) {
      errors.push(`${filename}: missing required key "${key}".`);
    }
  });

  if (member.id && member.id !== path.basename(filename, ".json")) {
    errors.push(`${filename}: id "${member.id}" must match filename.`);
  }

  if (isBlankString(member.id)) {
    errors.push(`${filename}: id must be a non-empty string.`);
  }

  if (isBlankString(member.name)) {
    errors.push(`${filename}: name must be a non-empty string.`);
  }

  if (isBlankString(member.party)) {
    errors.push(`${filename}: party must be a non-empty string.`);
  }

  if (!ELECTION_TYPES.includes(member.electionType)) {
    errors.push(`${filename}: electionType must be one of ${ELECTION_TYPES.join(", ")}.`);
  }

  if (!Array.isArray(member.career)) {
    errors.push(`${filename}: career must be an array.`);
  }

  if (!STATUS_VALUES.includes(member.status)) {
    errors.push(`${filename}: status must be one of ${STATUS_VALUES.join(", ")}.`);
  }

  if (!Number.isInteger(member.wins) || member.wins < 0) {
    errors.push(`${filename}: wins must be an integer greater than or equal to 0.`);
  }

  if (member.age !== null && (!Number.isInteger(member.age) || member.age < 0)) {
    errors.push(`${filename}: age must be null or a non-negative integer.`);
  }

  if (member.sourcePage !== null && !Number.isInteger(member.sourcePage)) {
    errors.push(`${filename}: sourcePage must be null or an integer.`);
  }

  if (typeof member.notes !== "string") {
    errors.push(`${filename}: notes must be a string.`);
  }

  if (typeof member.nameKana !== "string") {
    errors.push(`${filename}: nameKana must be a string.`);
  }

  if (typeof member.sourcePdf !== "string") {
    errors.push(`${filename}: sourcePdf must be a string.`);
  }

  if (typeof member.photo !== "string" || isBlankString(member.photo)) {
    errors.push(`${filename}: photo must be a non-empty string.`);
  }

  const expectedPhotoPath = `/data/photos/${member.id}.jpg`;
  if (member.photo !== expectedPhotoPath) {
    errors.push(`${filename}: photo must match "${expectedPhotoPath}".`);
  }

  if (member.electionType === "single") {
    if (isBlankString(member.district)) {
      errors.push(`${filename}: district is required when electionType is "single".`);
    }

    if (normalizeText(member.block)) {
      errors.push(`${filename}: block must be empty when electionType is "single".`);
    }
  }

  if (member.electionType === "proportional") {
    if (isBlankString(member.block)) {
      errors.push(`${filename}: block is required when electionType is "proportional".`);
    }

    if (normalizeText(member.district)) {
      errors.push(`${filename}: district must be empty when electionType is "proportional".`);
    }
  }

  if (!photoDir) {
    const absolutePhoto = path.join(rootDir, member.photo.replace(/^\//, ""));
    if (!(await fileExists(absolutePhoto))) {
      errors.push(`${filename}: photo file is missing at ${member.photo}.`);
    }
  } else {
    const absolutePhoto = path.join(photoDir, `${member.id}.jpg`);
    if (!(await fileExists(absolutePhoto))) {
      errors.push(`${filename}: photo file is missing at /data/photos/${member.id}.jpg.`);
    }
  }

  return errors;
}

export async function validateIndexFile(rootDir, records) {
  const indexPath = path.join(rootDir, "data", "members", "index.json");
  const errors = [];

  if (!(await fileExists(indexPath))) {
    errors.push("data/members/index.json is missing.");
    return errors;
  }

  const raw = await fs.readFile(indexPath, "utf8");
  const index = JSON.parse(raw);

  if (!Array.isArray(index.members)) {
    errors.push("data/members/index.json: members must be an array.");
    return errors;
  }

  const recordIds = new Set(records.map(({ member }) => member.id));
  const summaryIds = new Set();

  index.members.forEach((summary, summaryIndex) => {
    const prefix = `data/members/index.json: members[${summaryIndex}]`;

    if (isBlankString(summary.id)) {
      errors.push(`${prefix}.id must be a non-empty string.`);
      return;
    }

    if (summaryIds.has(summary.id)) {
      errors.push(`${prefix}.id duplicates "${summary.id}".`);
    }
    summaryIds.add(summary.id);

    if (!recordIds.has(summary.id)) {
      errors.push(`${prefix}.id "${summary.id}" does not have a matching member file.`);
    }

    if (summary.memberPath !== `/data/members/${summary.id}.json`) {
      errors.push(`${prefix}.memberPath must match "/data/members/${summary.id}.json".`);
    }

    if (summary.photo !== `/data/photos/${summary.id}.jpg`) {
      errors.push(`${prefix}.photo must match "/data/photos/${summary.id}.jpg".`);
    }
  });

  recordIds.forEach((id) => {
    if (!summaryIds.has(id)) {
      errors.push(`data/members/index.json is missing summary for "${id}".`);
    }
  });

  return errors;
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function runCli() {
  try {
    const result = await validateMembersProject(process.cwd());

    if (result.ok) {
      console.log(`Validation passed. ${result.memberCount} member file(s) checked.`);
      return;
    }

    console.error("Validation failed:");
    result.errors.forEach((error) => {
      console.error(`- ${error}`);
    });
    process.exitCode = 1;
  } catch (error) {
    console.error(`Validation crashed: ${error.message}`);
    process.exitCode = 1;
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  await runCli();
}
