import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  validateIndexFile,
  validateMemberRecord,
  validateMembersProject,
} from "../scripts/validate-members.js";

test("validateMemberRecord accepts a structurally valid single-member record", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "member-valid-"));
  const photoDir = path.join(rootDir, "data", "photos");
  await fs.mkdir(photoDir, { recursive: true });
  await fs.writeFile(path.join(photoDir, "hr-0001.jpg"), "placeholder");

  const record = {
    id: "hr-0001",
    name: "完成見本議員",
    nameKana: "",
    party: "要確認",
    electionType: "single",
    district: "要確認",
    block: "",
    prefecture: "要確認",
    wins: 0,
    birthDate: "",
    age: null,
    career: [],
    photo: "/data/photos/hr-0001.jpg",
    sourcePdf: "",
    sourcePage: null,
    status: "draft",
    notes: "",
  };

  const errors = await validateMemberRecord(record, {
    filename: "hr-0001.json",
    rootDir,
    photoDir,
  });

  assert.deepEqual(errors, []);
});

test("validateMemberRecord detects block mismatch for single-member records", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "member-single-"));
  const photoDir = path.join(rootDir, "data", "photos");
  await fs.mkdir(photoDir, { recursive: true });
  await fs.writeFile(path.join(photoDir, "hr-0001.jpg"), "placeholder");

  const record = {
    id: "hr-0001",
    name: "完成見本議員",
    nameKana: "",
    party: "要確認",
    electionType: "single",
    district: "東京都第1区",
    block: "東京",
    prefecture: "東京都",
    wins: 0,
    birthDate: "",
    age: null,
    career: [],
    photo: "/data/photos/hr-0001.jpg",
    sourcePdf: "",
    sourcePage: null,
    status: "draft",
    notes: "",
  };

  const errors = await validateMemberRecord(record, {
    filename: "hr-0001.json",
    rootDir,
    photoDir,
  });

  assert.equal(errors.some((error) => error.includes('block must be empty when electionType is "single"')), true);
});

test("validateMemberRecord requires source information for verified records", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "member-verified-"));
  const photoDir = path.join(rootDir, "data", "photos");
  await fs.mkdir(photoDir, { recursive: true });
  await fs.writeFile(path.join(photoDir, "hr-0001.jpg"), "placeholder");

  const record = {
    id: "hr-0001",
    name: "青山繁晴",
    nameKana: "あおやましげはる",
    party: "自由民主党",
    electionType: "single",
    district: "兵庫8区",
    block: "",
    prefecture: "兵庫県",
    wins: 1,
    birthDate: "1952-07-25",
    age: 73,
    career: ["共同通信記者"],
    photo: "/data/photos/hr-0001.jpg",
    sourcePdf: "",
    sourcePage: null,
    status: "verified",
    notes: "",
  };

  const errors = await validateMemberRecord(record, {
    filename: "hr-0001.json",
    rootDir,
    photoDir,
  });

  assert.equal(errors.some((error) => error.includes('sourcePdf is required when status is "verified"')), true);
  assert.equal(errors.some((error) => error.includes('sourcePage is required when status is "verified"')), true);
});

test("validateMembersProject detects duplicate ids across member files", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "member-project-"));
  const membersDir = path.join(rootDir, "data", "members");
  const photosDir = path.join(rootDir, "data", "photos");
  await fs.mkdir(membersDir, { recursive: true });
  await fs.mkdir(photosDir, { recursive: true });

  const memberA = {
    id: "hr-0001",
    name: "A",
    nameKana: "",
    party: "要確認",
    electionType: "single",
    district: "要確認",
    block: "",
    prefecture: "要確認",
    wins: 0,
    birthDate: "",
    age: null,
    career: [],
    photo: "/data/photos/hr-0001.jpg",
    sourcePdf: "",
    sourcePage: null,
    status: "draft",
    notes: "",
  };

  const memberB = {
    ...memberA,
    name: "B",
  };

  await fs.writeFile(path.join(membersDir, "hr-0001.json"), `${JSON.stringify(memberA, null, 2)}\n`);
  await fs.writeFile(path.join(membersDir, "hr-0002.json"), `${JSON.stringify(memberB, null, 2)}\n`);
  await fs.writeFile(path.join(photosDir, "hr-0001.jpg"), "placeholder");
  await fs.writeFile(path.join(photosDir, "hr-0002.jpg"), "placeholder");
  await fs.writeFile(
    path.join(membersDir, "index.json"),
    `${JSON.stringify({
      members: [
        {
          id: "hr-0001",
          memberPath: "/data/members/hr-0001.json",
          photo: "/data/photos/hr-0001.jpg",
        },
      ],
    }, null, 2)}\n`,
  );

  const result = await validateMembersProject(rootDir);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.includes('Duplicate id "hr-0001"')), true);
});

test("validateIndexFile requires an index summary for each member", async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "member-index-"));
  const membersDir = path.join(rootDir, "data", "members");
  await fs.mkdir(membersDir, { recursive: true });
  await fs.writeFile(path.join(membersDir, "index.json"), `${JSON.stringify({ members: [] }, null, 2)}\n`);

  const errors = await validateIndexFile(rootDir, [
    {
      filename: "hr-0001.json",
      absolutePath: path.join(membersDir, "hr-0001.json"),
      member: {
        id: "hr-0001",
      },
    },
  ]);

  assert.equal(errors.some((error) => error.includes('missing summary for "hr-0001"')), true);
});
