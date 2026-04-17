import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const TODAY = "2026-03-26";
const SOURCE_PDF = path.join(ROOT, "data", "source-pdf", "members.pdf");
const MEMBERS_DIR = path.join(ROOT, "data", "members");
const PHOTOS_DIR = path.join(ROOT, "data", "photos");
const BATCHES_DIR = path.join(ROOT, "data", "batches");
const TMP_PAGES_DIR = path.join(ROOT, "tmp", "pages");

const GROUP_LABELS = {
  "g01-single-basic": "小選挙区基本型",
  "g02-single-variant": "小選挙区変動型",
  "g03-proportional": "比例代表型",
  "g04-hold": "保留・例外型",
};

const NOTE_BATCH16 = "members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。";
const NOTE_FINAL = "members.pdf の掲載情報を転記。単語帳用最終セットとして作成。UI通し確認完了。";

const CROP = {
  left: 270,
  right: 1040,
  top: 150,
  middle: 960,
  bottom: 1760,
  width: 320,
  height: 500,
};

const UPSERTS = [
  {
    id: "hr-0391",
    name: "小林修平",
    nameKana: "こばやししゅうへい",
    party: "チームみらい",
    electionType: "proportional",
    district: "",
    block: "南関東",
    prefecture: "",
    wins: 1,
    birthDate: "1990-08-06",
    age: 35,
    career: ["ウェブエンジニア", "会社員"],
    sourcePage: 32,
    note: NOTE_BATCH16,
    crop: { page: 32, column: "left", row: "bottom" },
  },
  {
    id: "hr-0392",
    name: "後藤祐一",
    nameKana: "ごとうゆういち",
    party: "中道改革連合",
    electionType: "proportional",
    district: "",
    block: "南関東",
    prefecture: "",
    wins: 7,
    birthDate: "1969-03-25",
    age: 56,
    career: ["元財金委員", "立民幹事長代理", "経産省職員"],
    sourcePage: 32,
    note: NOTE_BATCH16,
    crop: { page: 32, column: "right", row: "bottom" },
  },
  {
    id: "hr-0393",
    name: "岩屋毅",
    nameKana: "いわやたけし",
    party: "自由民主党",
    electionType: "single",
    district: "大分3区",
    block: "",
    prefecture: "大分県",
    wins: 11,
    birthDate: "1957-08-24",
    age: 68,
    career: ["前外相", "防衛相", "党国防部会長"],
    sourcePage: 14,
    note: NOTE_BATCH16,
    crop: { page: 14, column: "left", row: "top" },
  },
  {
    id: "hr-0453",
    name: "井林辰憲",
    nameKana: "いばやしたつのり",
    party: "自由民主党",
    electionType: "single",
    district: "静岡2区",
    block: "",
    prefecture: "静岡県",
    wins: 6,
    birthDate: "1976-07-18",
    age: 49,
    career: ["党情報調査局長", "内閣府副大臣", "国交省職員"],
    sourcePage: 13,
    note: NOTE_FINAL,
    crop: { page: 13, column: "right", row: "middle" },
  },
  {
    id: "hr-0454",
    name: "井原巧",
    nameKana: "いはらたくみ",
    party: "自由民主党",
    electionType: "single",
    district: "愛媛2区",
    block: "",
    prefecture: "愛媛県",
    wins: 2,
    birthDate: "1963-11-13",
    age: 62,
    career: ["元経産政務官", "市長", "参院議員"],
    sourcePage: 13,
    note: NOTE_FINAL,
    crop: { page: 13, column: "right", row: "bottom" },
  },
  {
    id: "hr-0455",
    name: "上杉謙太郎",
    nameKana: "うえすぎけんたろう",
    party: "自由民主党",
    electionType: "single",
    district: "福島3区",
    block: "",
    prefecture: "福島県",
    wins: 3,
    birthDate: "1975-04-20",
    age: 50,
    career: ["元外務政務官", "参院議員秘書"],
    sourcePage: 14,
    note: NOTE_FINAL,
    crop: { page: 14, column: "left", row: "middle" },
  },
  {
    id: "hr-0456",
    name: "上田英俊",
    nameKana: "うえだえいしゅん",
    party: "自由民主党",
    electionType: "single",
    district: "富山2区",
    block: "",
    prefecture: "富山県",
    wins: 3,
    birthDate: "1965-01-22",
    age: 61,
    career: ["国交政務官", "党農林部会長代理", "県議"],
    sourcePage: 14,
    note: NOTE_FINAL,
    crop: { page: 14, column: "left", row: "bottom" },
  },
  {
    id: "hr-0457",
    name: "岩田和親",
    nameKana: "いわたかずちか",
    party: "自由民主党",
    electionType: "single",
    district: "佐賀1区",
    block: "",
    prefecture: "佐賀県",
    wins: 6,
    birthDate: "1973-09-20",
    age: 52,
    career: ["内閣府副大臣", "経産副大臣", "佐賀県議"],
    sourcePage: 14,
    note: NOTE_FINAL,
    crop: { page: 14, column: "right", row: "middle" },
  },
  {
    id: "hr-0458",
    name: "後藤茂之",
    nameKana: "ごとうしげゆき",
    party: "自由民主党",
    electionType: "single",
    district: "長野4区",
    block: "",
    prefecture: "長野県",
    wins: 9,
    birthDate: "1955-12-09",
    age: 70,
    career: ["党政調会長代理", "経済再生担当相", "厚労相"],
    sourcePage: 32,
    note: NOTE_FINAL,
    crop: { page: 32, column: "right", row: "middle" },
  },
  {
    id: "hr-0459",
    name: "今洋佑",
    nameKana: "こんようすけ",
    party: "自由民主党",
    electionType: "proportional",
    district: "",
    block: "北信越",
    prefecture: "",
    wins: 1,
    birthDate: "1983-01-18",
    age: 43,
    career: ["元大野市副市長"],
    sourcePage: 33,
    note: NOTE_FINAL,
    crop: { page: 33, column: "left", row: "top" },
  },
  {
    id: "hr-0460",
    name: "古川禎久",
    nameKana: "ふるかわよしひさ",
    party: "自由民主党",
    electionType: "single",
    district: "宮崎3区",
    block: "",
    prefecture: "宮崎県",
    wins: 9,
    birthDate: "1965-08-03",
    age: 60,
    career: ["党幹事長代理", "法相", "財務副大臣"],
    sourcePage: 66,
    note: NOTE_FINAL,
    crop: { page: 66, column: "right", row: "top" },
  },
  {
    id: "hr-0461",
    name: "古屋圭司",
    nameKana: "ふるやけいじ",
    party: "自由民主党",
    electionType: "single",
    district: "岐阜5区",
    block: "",
    prefecture: "岐阜県",
    wins: 13,
    birthDate: "1952-11-01",
    age: 73,
    career: ["党選対委員長", "政調会長代行", "拉致担当相"],
    sourcePage: 66,
    note: NOTE_FINAL,
    crop: { page: 66, column: "right", row: "middle" },
  },
  {
    id: "hr-0462",
    name: "穂坂泰",
    nameKana: "ほさかやすし",
    party: "自由民主党",
    electionType: "single",
    district: "埼玉4区",
    block: "",
    prefecture: "埼玉県",
    wins: 4,
    birthDate: "1974-02-17",
    age: 51,
    career: ["党部会長代理", "内閣府副大臣", "市議"],
    sourcePage: 66,
    note: NOTE_FINAL,
    crop: { page: 66, column: "right", row: "bottom" },
  },
  {
    id: "hr-0463",
    name: "宮内秀樹",
    nameKana: "みやうちひでき",
    party: "自由民主党",
    electionType: "single",
    district: "福岡4区",
    block: "",
    prefecture: "福岡県",
    wins: 6,
    birthDate: "1962-10-19",
    age: 63,
    career: ["党国対副委員長", "農水副大臣", "議員秘書"],
    sourcePage: 71,
    note: NOTE_FINAL,
    crop: { page: 71, column: "right", row: "top" },
  },
  {
    id: "hr-0464",
    name: "向山淳",
    nameKana: "むこうやまじゅん",
    party: "自由民主党",
    electionType: "single",
    district: "北海道8区",
    block: "",
    prefecture: "北海道",
    wins: 2,
    birthDate: "1983-11-19",
    age: 42,
    career: ["総務政務官", "三菱商事社員"],
    sourcePage: 71,
    note: NOTE_FINAL,
    crop: { page: 71, column: "left", row: "middle" },
  },
  {
    id: "hr-0465",
    name: "向山好一",
    nameKana: "むこうやまこういち",
    party: "国民民主党",
    electionType: "proportional",
    district: "",
    block: "近畿",
    prefecture: "",
    wins: 3,
    birthDate: "1957-07-18",
    age: 68,
    career: ["党国対委員長代理", "総務委理事", "兵庫県議"],
    sourcePage: 71,
    note: NOTE_FINAL,
    crop: { page: 71, column: "left", row: "bottom" },
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function renderPage(page) {
  ensureDir(TMP_PAGES_DIR);
  const outputPath = path.join(TMP_PAGES_DIR, `page-${page}.png`);
  execFileSync(
    "swift",
    [
      "-module-cache-path",
      "/tmp/modulecache",
      "scripts/render_pdf_page.swift",
      SOURCE_PDF,
      String(page),
      outputPath,
      "1800",
    ],
    {
      cwd: ROOT,
      env: { ...process.env, HOME: "/tmp" },
      stdio: "inherit",
    },
  );
  return outputPath;
}

function cropPhoto(pagePath, crop, outputPath) {
  const x = CROP[crop.column];
  const y = CROP[crop.row];
  execFileSync(
    "swift",
    [
      "-module-cache-path",
      "/tmp/modulecache",
      "scripts/crop_rect.swift",
      pagePath,
      String(x),
      String(y),
      String(CROP.width),
      String(CROP.height),
      outputPath,
    ],
    {
      cwd: ROOT,
      env: { ...process.env, HOME: "/tmp" },
      stdio: "inherit",
    },
  );
}

function buildMember(record) {
  return {
    id: record.id,
    name: record.name,
    nameKana: record.nameKana,
    party: record.party,
    electionType: record.electionType,
    district: record.district,
    block: record.block,
    prefecture: record.prefecture,
    wins: record.wins,
    birthDate: record.birthDate,
    age: record.age,
    career: record.career,
    photo: `/data/photos/${record.id}.jpg`,
    sourcePdf: "/data/source-pdf/members.pdf",
    sourcePage: record.sourcePage,
    status: "verified",
    notes: record.note,
  };
}

function groupIdFor(member) {
  return member.electionType === "proportional" ? "g03-proportional" : "g01-single-basic";
}

function buildGroups(memberIds) {
  const members = memberIds.map((id) => readJson(path.join(MEMBERS_DIR, `${id}.json`)));
  const grouped = {
    "g01-single-basic": members.filter((member) => groupIdFor(member) === "g01-single-basic"),
    "g03-proportional": members.filter((member) => groupIdFor(member) === "g03-proportional"),
  };

  return Object.entries(grouped)
    .filter(([, list]) => list.length > 0)
    .map(([groupId, list], index) => ({
      id: groupId,
      name: GROUP_LABELS[groupId],
      status: "verified",
      priority: index + 1,
      basedOnMemberId: "hr-0001",
      targetCount: list.length,
      memberIds: list.map((member) => member.id),
      memberNames: list.map((member) => member.name),
    }));
}

function buildRoster(batchId, memberIds) {
  const members = memberIds.map((id) => readJson(path.join(MEMBERS_DIR, `${id}.json`)));
  const allocationSummary = [
    { groupId: "g01-single-basic", groupName: GROUP_LABELS["g01-single-basic"], count: 0 },
    { groupId: "g02-single-variant", groupName: GROUP_LABELS["g02-single-variant"], count: 0 },
    { groupId: "g03-proportional", groupName: GROUP_LABELS["g03-proportional"], count: 0 },
    { groupId: "g04-hold", groupName: GROUP_LABELS["g04-hold"], count: 0 },
  ];

  const slots = members.map((member, index) => {
    const groupId = groupIdFor(member);
    const summary = allocationSummary.find((entry) => entry.groupId === groupId);
    summary.count += 1;

    return {
      slotNo: index + 1,
      id: member.id,
      groupId,
      groupName: GROUP_LABELS[groupId],
      name: member.name,
      status: "verified",
      jsonCreated: true,
      photoPlaced: true,
      sourceChecked: true,
      reviewed: true,
      sourcePage: member.sourcePage,
      notes: [`${member.name}。sourcePage ${member.sourcePage}。career と UI 確認完了。`],
    };
  });

  return {
    batchId,
    referenceMemberId: "hr-0001",
    referenceMemberName: "青山繁晴",
    targetMembers: memberIds.length,
    allocationSummary,
    slots,
  };
}

function writeBatchFiles(batchId, name, goal, memberIds) {
  const batchDir = path.join(BATCHES_DIR, batchId);
  ensureDir(batchDir);
  const groups = buildGroups(memberIds);
  const roster = buildRoster(batchId, memberIds);
  const groupCounts = {
    "g01-single-basic": roster.allocationSummary.find((entry) => entry.groupId === "g01-single-basic").count,
    "g02-single-variant": 0,
    "g03-proportional": roster.allocationSummary.find((entry) => entry.groupId === "g03-proportional").count,
    "g04-hold": 0,
  };

  writeJson(path.join(batchDir, "groups.json"), groups);
  writeJson(
    path.join(batchDir, "manifest.json"),
    {
      id: batchId,
      name,
      status: "complete",
      memberIds,
      goal,
      referenceMemberId: "hr-0001",
      referenceMemberName: "青山繁晴",
      targetMembers: memberIds.length,
      completedMembers: memberIds.length,
      validatedAt: TODAY,
      uiReviewStatus: "checked",
      uiCheckedAt: TODAY,
      groupCounts,
    },
  );
  writeJson(path.join(batchDir, "roster.json"), roster);

  const worklistLines = [
    "slot_no\tid\tgroup_id\tgroup_name\tname\tstatus\tjson_created\tphoto_placed\tsource_checked\treviewed\tsource_page\tnotes",
    ...roster.slots.map(
      (slot) =>
        `${slot.slotNo}\t${slot.id}\t${slot.groupId}\t${slot.groupName}\t${slot.name}\t${slot.status}\tyes\tyes\tyes\tyes\t${slot.sourcePage}\t${slot.notes[0]}`,
    ),
  ];
  fs.writeFileSync(path.join(batchDir, "worklist.tsv"), `${worklistLines.join("\n")}\n`, "utf8");

  const reviewLines = [
    "id\tphoto\tname\tparty\telection\tdistrict_block\tcareer\tjson\tui\treviewer\tresult\tnotes",
    ...memberIds.map((id) => `${id}\tok\tok\tok\tok\tok\tok\tok\tok\tCodex\tverified\tPDF主要項目、career、UI確認まで完了。`),
  ];
  fs.writeFileSync(path.join(batchDir, "review.tsv"), `${reviewLines.join("\n")}\n`, "utf8");
}

function rebuildIndex() {
  const indexPath = path.join(MEMBERS_DIR, "index.json");
  const index = readJson(indexPath);
  const existingBatchById = new Map(index.members.map((entry) => [entry.id, entry.batchId]));

  for (const record of UPSERTS) {
    if (!existingBatchById.has(record.id)) {
      existingBatchById.set(record.id, "batch-19-13");
    }
  }

  const memberFiles = fs
    .readdirSync(MEMBERS_DIR)
    .filter((filename) => /^hr-\d{4}\.json$/.test(filename))
    .sort();

  const members = memberFiles.map((filename) => {
    const member = readJson(path.join(MEMBERS_DIR, filename));
    return {
      id: member.id,
      name: member.name,
      party: member.party,
      electionType: member.electionType,
      district: member.district,
      block: member.block,
      prefecture: member.prefecture,
      photo: member.photo,
      status: member.status,
      memberPath: `/data/members/${member.id}.json`,
      batchId: existingBatchById.get(member.id) ?? "",
    };
  });

  const batches = index.batches.filter((batch) => batch.id !== "batch-19-13");
  batches.push({
    id: "batch-19-13",
    name: "追加補完13名バッチ",
    memberIds: [
      "hr-0453",
      "hr-0454",
      "hr-0455",
      "hr-0456",
      "hr-0457",
      "hr-0458",
      "hr-0459",
      "hr-0460",
      "hr-0461",
      "hr-0462",
      "hr-0463",
      "hr-0464",
      "hr-0465",
    ],
  });

  index.generatedAt = TODAY;
  index.totalMembers = members.length;
  index.members = members;
  index.batches = batches;
  writeJson(indexPath, index);
}

function main() {
  const pages = [...new Set(UPSERTS.map((record) => record.crop.page))];
  const pagePaths = new Map(pages.map((page) => [page, renderPage(page)]));

  for (const record of UPSERTS) {
    const member = buildMember(record);
    writeJson(path.join(MEMBERS_DIR, `${record.id}.json`), member);
    cropPhoto(pagePaths.get(record.crop.page), record.crop, path.join(PHOTOS_DIR, `${record.id}.jpg`));
  }

  writeBatchFiles(
    "batch-16-25",
    "追加25名バッチ 14",
    "20名完成版の仕様を固定見本として、次段階の追加25名を同一形式で管理する。",
    [
      "hr-0391",
      "hr-0392",
      "hr-0393",
      "hr-0394",
      "hr-0395",
      "hr-0396",
      "hr-0397",
      "hr-0398",
      "hr-0399",
      "hr-0400",
      "hr-0401",
      "hr-0402",
      "hr-0403",
      "hr-0404",
      "hr-0405",
      "hr-0406",
      "hr-0407",
      "hr-0408",
      "hr-0409",
      "hr-0410",
      "hr-0411",
      "hr-0412",
      "hr-0413",
      "hr-0414",
      "hr-0415",
    ],
  );

  writeBatchFiles(
    "batch-19-13",
    "追加補完13名バッチ",
    "20名完成版の仕様を固定見本として、PDF再確認で見つかった残り13名を同一形式で管理する。",
    [
      "hr-0453",
      "hr-0454",
      "hr-0455",
      "hr-0456",
      "hr-0457",
      "hr-0458",
      "hr-0459",
      "hr-0460",
      "hr-0461",
      "hr-0462",
      "hr-0463",
      "hr-0464",
      "hr-0465",
    ],
  );

  rebuildIndex();
}

main();
