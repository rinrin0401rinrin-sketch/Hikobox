import { ELECTION_TYPE_LABELS, normalizeText } from "./member-schema.js";

export async function loadMemberIndex() {
  const index = await fetchJson("./data/members/index.json");
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
    party: input.party ?? "",
    electionType: input.electionType ?? "single",
    district: input.district ?? "",
    block: input.block ?? "",
    prefecture: input.prefecture ?? "",
    wins: Number.isInteger(input.wins) ? input.wins : 0,
    birthDate: input.birthDate ?? "",
    age: input.age ?? null,
    career: Array.isArray(input.career) ? input.career : [],
    photo: input.photo ?? "",
    sourcePdf: input.sourcePdf ?? "",
    sourcePage: input.sourcePage ?? null,
    status: input.status ?? "draft",
    notes: input.notes ?? "",
    memberPath: input.memberPath ?? "",
    batchId: input.batchId ?? "",
  };
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
  return applyMemberFilters(
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
}

export function applyMemberFilters(members, filters, progress = createEmptyProgress()) {
  const search = normalizeText(filters.search).toLowerCase();
  const learnedIds = new Set(progress.learnedIds ?? []);
  const weakIds = new Set(progress.weakIds ?? []);

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

    const matchesParty = matchesFilter(normalized.party, filters.party);
    const matchesElectionType = matchesFilter(normalized.electionType, filters.electionType);
    const matchesPrefecture = matchesFilter(normalized.prefecture, filters.prefecture);
    const matchesBlock = matchesFilter(normalized.block, filters.block);
    const matchesTracking = matchesTrackingFilter(normalized.id, filters.tracking, learnedIds, weakIds);
    const matchesWeakOnly = filters.weakOnly ? weakIds.has(normalized.id) : true;

    return matchesSearch
      && matchesParty
      && matchesElectionType
      && matchesPrefecture
      && matchesBlock
      && matchesTracking
      && matchesWeakOnly;
  });
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
