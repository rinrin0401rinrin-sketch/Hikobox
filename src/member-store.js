import { ELECTION_TYPE_LABELS, normalizeText } from "./member-schema.js?v=20260330-photofix54";

const CENTRIST_PARTIES = new Set(["中道改革連合", "公明党", "立憲民主党"]);

export async function loadMemberIndex() {
  const subset = new URLSearchParams(window.location.search).get("subset");
  const indexPath = subset === "first140"
    ? "./data/members/index-first140.json"
    : "./data/members/index.json";
  const index = await fetchJson(indexPath);
  return {
    ...index,
    members: Array.isArray(index.members) ? index.members.map(normalizeMember) : [],
  };
}

export async function loadMember(memberPath) {
  const member = await fetchJson(memberPath);
  return normalizeMember(member);
}

export function normalizeMember(input = {}) {
  return {
    id: input.id ?? "",
    name: input.name ?? "",
    nameKana: input.nameKana ?? "",
    party: normalizePartyLabel(input.party ?? ""),
    electionType: input.electionType ?? "single",
    district: input.district ?? "",
    block: input.block ?? "",
    prefecture: input.prefecture ?? "",
    wins: Number.isInteger(input.wins) ? input.wins : 0,
    birthDate: input.birthDate ?? "",
    age: input.age ?? null,
    career: Array.isArray(input.career) ? input.career : [],
    photo: withPhotoCacheBust(input.photo ?? ""),
    sourcePdf: input.sourcePdf ?? "",
    sourcePage: input.sourcePage ?? null,
    status: input.status ?? "draft",
    notes: input.notes ?? "",
    memberPath: input.memberPath ?? "",
    batchId: input.batchId ?? "",
  };
}

export function normalizePartyLabel(party) {
  const normalizedParty = normalizeText(party);
  return CENTRIST_PARTIES.has(normalizedParty) ? "中道" : normalizedParty;
}

function withPhotoCacheBust(photoPath) {
  if (!photoPath) {
    return "";
  }

  if (typeof window === "undefined") {
    return photoPath;
  }

  const separator = photoPath.includes("?") ? "&" : "?";
  return `${photoPath}${separator}v=20260330-photofix54`;
}

export function validateMember(member) {
  const errors = [];

  if (!normalizeText(member.id)) {
    errors.push("id は必須です");
  }

  if (!normalizeText(member.name)) {
    errors.push("name は必須です");
  }

  if (!normalizeText(member.party)) {
    errors.push("party は必須です");
  }

  if (!normalizeText(member.photo)) {
    errors.push("photo は必須です");
  }

  if (!normalizeText(member.status)) {
    errors.push("status は必須です");
  }

  if (member.electionType === "single" && !normalizeText(member.district)) {
    errors.push("小選挙区は district が必須です");
  }

  if (member.electionType === "proportional" && !normalizeText(member.block)) {
    errors.push("比例代表は block が必須です");
  }

  return errors;
}

export function buildFilterOptions(members, key, labelMap = {}) {
  const values = new Set();

  members.forEach((member) => {
    const value = typeof member[key] === "string" ? member[key].trim() : "";
    if (value) {
      values.add(value);
    }
  });

  return Array.from(values)
    .sort((left, right) => left.localeCompare(right, "ja"))
    .map((value) => ({
      value,
      label: labelMap[value] ?? value,
    }));
}

export function filterMemberSummaries(members, filters) {
  const filteredMembers = applyMemberFilters(
    members,
    {
      search: "",
      party: filters.party ?? "all",
      electionType: filters.electionType ?? "all",
      prefecture: filters.prefecture ?? "all",
      tracking: "all",
      weakOnly: false,
      block: filters.block ?? "all",
    },
    createEmptyProgress(),
  );

  return sortFilteredMembers(filteredMembers, filters);
}

export function applyMemberFilters(members, filters, progress = createEmptyProgress()) {
  const search = normalizeText(filters.search).toLowerCase();
  const learnedIds = new Set(progress.learnedIds ?? []);
  const weakIds = new Set(progress.weakIds ?? []);
  const activeFilters = resolveEffectiveFilters(filters);

  return members.filter((member) => {
    const normalized = normalizeMember(member);
    const matchesSearch = !search || [
      normalized.name,
      normalized.nameKana,
      normalized.party,
      normalized.district,
      normalized.block,
      normalized.prefecture,
      ...normalized.career,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);

    const matchesParty = matchesFilter(normalized.party, activeFilters.party);
    const matchesElectionType = matchesFilter(normalized.electionType, activeFilters.electionType);
    const matchesPrefecture = matchesFilter(normalized.prefecture, activeFilters.prefecture);
    const matchesBlock = matchesFilter(normalized.block, activeFilters.block);
    const matchesTracking = matchesTrackingFilter(normalized.id, activeFilters.tracking, learnedIds, weakIds);
    const matchesWeakOnly = activeFilters.weakOnly ? weakIds.has(normalized.id) : true;

    return matchesSearch
      && matchesParty
      && matchesElectionType
      && matchesPrefecture
      && matchesBlock
      && matchesTracking
      && matchesWeakOnly;
  });
}

export function sortFilteredMembers(members, filters = {}) {
  const activeFilters = resolveEffectiveFilters(filters);
  const shouldSortByDistrict = activeFilters.prefecture !== "all" && activeFilters.electionType !== "proportional";

  if (!shouldSortByDistrict) {
    return members;
  }

  return [...members].sort((left, right) => compareByDistrictOrder(left, right));
}

export function createEmptyProgress() {
  return {
    learnedIds: [],
    weakIds: [],
  };
}

export function toggleTrackedId(ids, targetId) {
  const next = new Set(ids);

  if (next.has(targetId)) {
    next.delete(targetId);
  } else {
    next.add(targetId);
  }

  return Array.from(next);
}

export function deriveAgeFromBirthDate(birthDate, referenceDate = new Date()) {
  if (!normalizeText(birthDate)) {
    return null;
  }

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    referenceDate.getMonth() > birth.getMonth()
    || (referenceDate.getMonth() === birth.getMonth() && referenceDate.getDate() >= birth.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age;
}

export function formatElectionType(electionType) {
  return ELECTION_TYPE_LABELS[electionType] ?? electionType;
}

export function getMemberLocationLabel(member) {
  return normalizeMember(member).electionType === "single"
    ? normalizeText(member.district)
    : normalizeText(member.block);
}

async function fetchJson(path) {
  const response = await fetch(path, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return response.json();
}

function matchesFilter(source, filterValue) {
  if (!filterValue || filterValue === "all") {
    return true;
  }

  return String(source ?? "").trim() === filterValue;
}

function matchesTrackingFilter(id, tracking, learnedIds, weakIds) {
  if (!tracking || tracking === "all") {
    return true;
  }

  if (tracking === "learned") {
    return learnedIds.has(id);
  }

  if (tracking === "unlearned") {
    return !learnedIds.has(id);
  }

  if (tracking === "weak") {
    return weakIds.has(id);
  }

  return true;
}

function resolveEffectiveFilters(filters = {}) {
  const electionType = filters.electionType ?? "all";
  const wantsProportional = electionType === "proportional";
  const wantsSingle = electionType === "single";
  const wantsSpecificBlock = filters.block && filters.block !== "all";

  return {
    ...filters,
    electionType,
    party: filters.party ?? "all",
    prefecture: wantsProportional || wantsSpecificBlock ? "all" : filters.prefecture ?? "all",
    block: wantsSingle ? "all" : filters.block ?? "all",
    tracking: filters.tracking ?? "all",
    weakOnly: Boolean(filters.weakOnly),
  };
}

function compareByDistrictOrder(leftMember, rightMember) {
  const left = normalizeMember(leftMember);
  const right = normalizeMember(rightMember);
  const leftOrder = extractDistrictOrder(left.district);
  const rightOrder = extractDistrictOrder(right.district);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.id.localeCompare(right.id, "ja");
}

function extractDistrictOrder(district) {
  const match = normalizeText(district).match(/(\d+)\s*区/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}
