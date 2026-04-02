import { ELECTION_TYPE_LABELS, normalizeText } from "./member-schema.js?v=20260402-finishpass1";

const PHOTO_CACHE_VERSION = "20260401-pwa465";
const DATA_CACHE_VERSION = "20260402-finishpass1";
const PREFECTURE_REGION_GROUPS = [
  { region: "北海道", prefectures: ["北海道"] },
  { region: "東北", prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { region: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { region: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { region: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { region: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { region: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { region: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];
const PREFECTURE_ORDER = new Map();
const PREFECTURE_REGION_BY_NAME = new Map(
  PREFECTURE_REGION_GROUPS.flatMap((group) => group.prefectures.map((prefecture) => [prefecture, group.region])),
);

let prefectureOrderIndex = 0;
PREFECTURE_REGION_GROUPS.forEach((group) => {
  group.prefectures.forEach((prefecture) => {
    PREFECTURE_ORDER.set(prefecture, prefectureOrderIndex);
    prefectureOrderIndex += 1;
  });
});

export async function loadMemberIndex() {
  const subset = new URLSearchParams(window.location.search).get("subset");
  const indexPath = subset === "first140"
    ? "./data/members/index-first140.json"
    : "./data/members/index.json";
  const index = await fetchJson(withDataCacheBust(indexPath));

  return {
    ...index,
    members: Array.isArray(index.members) ? index.members.map(normalizeMember) : [],
  };
}

export async function loadMemberSearchIndex() {
  const searchIndex = await fetchJson(withDataCacheBust("./data/members/search-index.json"));

  return {
    ...searchIndex,
    members: Array.isArray(searchIndex.members) ? searchIndex.members.map(normalizeMember) : [],
  };
}

export async function loadMember(memberPath) {
  const member = await fetchJson(withDataCacheBust(memberPath));
  return normalizeMember(member);
}

export function normalizeMember(input = {}) {
  const electionType = normalizeText(input.districtType || input.electionType) || "single";
  const districtName = normalizeText(input.districtName || input.district);
  const proportionalBlock = normalizeText(input.proportionalBlock || input.block);
  const prefecture = normalizeText(input.prefecture);
  const party = normalizeText(input.party);
  const image = withPhotoCacheBust(normalizeText(input.image || input.photo));
  const normalizedCareer = Array.isArray(input.career)
    ? input.career.filter((item) => normalizeText(item))
    : [];

  return {
    id: normalizeText(input.id),
    name: normalizeText(input.name),
    nameKana: normalizeText(input.nameKana),
    party,
    partyGroup: normalizePartyGroupLabel(party),
    electionType,
    districtType: electionType,
    electionLabel: formatElectionType(electionType),
    district: districtName,
    districtName,
    block: proportionalBlock,
    proportionalBlock,
    prefecture,
    districtOrBlockLabel: electionType === "single"
      ? districtName || "未設定"
      : proportionalBlock || "未設定",
    wins: Number.isInteger(input.wins) ? input.wins : 0,
    birthDate: normalizeText(input.birthDate),
    age: Number.isInteger(input.age) ? input.age : null,
    career: normalizedCareer,
    photo: image,
    image,
    sourcePdf: normalizeText(input.sourcePdf),
    sourcePage: Number.isInteger(input.sourcePage) ? input.sourcePage : null,
    status: normalizeText(input.status) || "draft",
    notes: normalizeText(input.notes),
    memberPath: normalizeText(input.memberPath),
    batchId: normalizeText(input.batchId),
    isActive: Boolean(input.isActive),
    searchText: [
      normalizeText(input.name),
      normalizeText(input.nameKana),
      party,
      prefecture,
      districtName,
      proportionalBlock,
      ...normalizedCareer,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

export function normalizePartyGroupLabel(party) {
  const normalizedParty = normalizeText(party);

  if (normalizedParty === "中道改革連合" || normalizedParty === "公明党" || normalizedParty === "立憲民主党") {
    return "中道";
  }

  return normalizedParty;
}

export function validateMember(member) {
  const normalized = normalizeMember(member);
  const errors = [];

  if (!normalized.id) {
    errors.push("id は必須です");
  }

  if (!normalized.name) {
    errors.push("name は必須です");
  }

  if (!normalized.party) {
    errors.push("party は必須です");
  }

  if (!normalized.photo) {
    errors.push("photo は必須です");
  }

  if (!normalized.status) {
    errors.push("status は必須です");
  }

  if (normalized.electionType === "single" && !normalized.districtName) {
    errors.push("小選挙区は district が必須です");
  }

  if (normalized.electionType === "proportional" && !normalized.proportionalBlock) {
    errors.push("比例代表は block が必須です");
  }

  return errors;
}

export function buildFilterOptions(members, key, labelMap = {}) {
  const values = new Set();

  members.forEach((member) => {
    const normalized = normalizeMember(member);
    const value = typeof normalized[key] === "string" ? normalized[key].trim() : "";

    if (value) {
      values.add(value);
    }
  });

  return Array.from(values)
    .sort((left, right) => (key === "prefecture"
      ? compareByPrefectureOrder(left, right)
      : left.localeCompare(right, "ja")))
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
    const matchesSearch = !search || normalized.searchText.includes(search);
    const matchesParty = matchesFilter(normalized.party, activeFilters.party);
    const matchesElectionType = matchesFilter(normalized.electionType, activeFilters.electionType);
    const matchesPrefecture = matchesFilter(normalized.prefecture, activeFilters.prefecture);
    const matchesBlock = matchesFilter(normalized.proportionalBlock, activeFilters.block);
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
    return sortMembersByBrowseOrder(members);
  }

  return [...members].sort((left, right) => compareByDistrictOrder(left, right));
}

export function sortMembersByBrowseOrder(members) {
  return [...members].sort(compareMembersByBrowseOrder);
}

export function compareMembersByBrowseOrder(leftMember, rightMember) {
  const left = normalizeMember(leftMember);
  const right = normalizeMember(rightMember);

  if (left.electionType !== right.electionType) {
    return left.electionType.localeCompare(right.electionType, "ja");
  }

  if (left.electionType === "single") {
    const prefectureOrder = compareByPrefectureOrder(left.prefecture, right.prefecture);
    if (prefectureOrder !== 0) {
      return prefectureOrder;
    }

    const districtOrder = compareByDistrictOrder(left, right);
    if (districtOrder !== 0) {
      return districtOrder;
    }
  }

  if (left.electionType === "proportional") {
    const blockOrder = left.proportionalBlock.localeCompare(right.proportionalBlock, "ja");
    if (blockOrder !== 0) {
      return blockOrder;
    }
  }

  return left.name.localeCompare(right.name, "ja");
}

export function groupMembersByPrefecture(members) {
  const grouped = new Map();

  sortMembersByBrowseOrder(members)
    .filter((member) => normalizeMember(member).electionType === "single")
    .forEach((member) => {
      const normalized = normalizeMember(member);
      const current = grouped.get(normalized.prefecture) ?? [];
      current.push(normalized);
      grouped.set(normalized.prefecture, current);
    });

  return grouped;
}

export function groupMembersByBlock(members) {
  const grouped = new Map();

  sortMembersByBrowseOrder(members)
    .filter((member) => normalizeMember(member).electionType === "proportional")
    .forEach((member) => {
      const normalized = normalizeMember(member);
      const current = grouped.get(normalized.proportionalBlock) ?? [];
      current.push(normalized);
      grouped.set(normalized.proportionalBlock, current);
    });

  return grouped;
}

export function compareByPrefectureOrder(leftPrefecture, rightPrefecture) {
  const left = normalizeText(leftPrefecture);
  const right = normalizeText(rightPrefecture);
  const leftIndex = PREFECTURE_ORDER.get(left);
  const rightIndex = PREFECTURE_ORDER.get(right);

  if (leftIndex != null && rightIndex != null && leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  if (leftIndex != null && rightIndex == null) {
    return -1;
  }

  if (leftIndex == null && rightIndex != null) {
    return 1;
  }

  return left.localeCompare(right, "ja");
}

export function getPrefectureGroups(prefectures) {
  const grouped = new Map(PREFECTURE_REGION_GROUPS.map((group) => [group.region, []]));
  const extra = [];

  sortPrefectures(prefectures).forEach((prefecture) => {
    const region = PREFECTURE_REGION_BY_NAME.get(prefecture);

    if (!region) {
      extra.push(prefecture);
      return;
    }

    grouped.get(region)?.push(prefecture);
  });

  const orderedGroups = PREFECTURE_REGION_GROUPS
    .map((group) => ({
      region: group.region,
      prefectures: grouped.get(group.region) ?? [],
    }))
    .filter((group) => group.prefectures.length > 0);

  if (extra.length > 0) {
    orderedGroups.push({
      region: "未分類",
      prefectures: extra,
    });
  }

  return orderedGroups;
}

export function sortPrefectures(prefectures) {
  return [...new Set(prefectures.filter(Boolean))].sort(compareByPrefectureOrder);
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
  return normalizeMember(member).districtOrBlockLabel;
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

function withPhotoCacheBust(photoPath) {
  if (!photoPath) {
    return "";
  }

  if (photoPath.includes(`v=${PHOTO_CACHE_VERSION}`)) {
    return photoPath;
  }

  if (typeof window === "undefined") {
    return photoPath;
  }

  const separator = photoPath.includes("?") ? "&" : "?";
  return `${photoPath}${separator}v=${PHOTO_CACHE_VERSION}`;
}

function withDataCacheBust(path) {
  if (!path) {
    return "";
  }

  if (path.includes(`v=${DATA_CACHE_VERSION}`)) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${DATA_CACHE_VERSION}`;
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
  const leftOrder = extractDistrictOrder(left.districtName);
  const rightOrder = extractDistrictOrder(right.districtName);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.id.localeCompare(right.id, "ja");
}

function extractDistrictOrder(district) {
  const match = normalizeText(district).match(/(\d+)\s*区/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}
