export const ELECTION_TYPES = Object.freeze(["single", "proportional"]);
export const STATUS_VALUES = Object.freeze(["draft", "verified"]);

export const REQUIRED_MEMBER_KEYS = Object.freeze([
  "id",
  "name",
  "nameKana",
  "party",
  "electionType",
  "district",
  "block",
  "prefecture",
  "wins",
  "birthDate",
  "age",
  "career",
  "photo",
  "sourcePdf",
  "sourcePage",
  "status",
  "notes",
]);

export const ELECTION_TYPE_LABELS = Object.freeze({
  single: "小選挙区",
  proportional: "比例代表",
});

export const STATUS_LABELS = Object.freeze({
  draft: "draft: 未確認",
  verified: "verified: 確認済み",
});

export function isBlankString(value) {
  return typeof value !== "string" || value.trim() === "";
}

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getLocationLabel(member) {
  if (member.electionType === "single") {
    return normalizeText(member.district) || "未設定";
  }

  if (member.electionType === "proportional") {
    return normalizeText(member.block) || "未設定";
  }

  return "未設定";
}
