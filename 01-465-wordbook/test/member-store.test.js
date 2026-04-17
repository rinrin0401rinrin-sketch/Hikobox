import test from "node:test";
import assert from "node:assert/strict";

import {
  applyMemberFilters,
  compareMembersByBrowseOrder,
  createEmptyProgress,
  deriveAgeFromBirthDate,
  formatElectionType,
  getMemberLocationLabel,
  getPrefectureGroups,
  normalizeMember,
  toggleTrackedId,
  validateMember,
} from "../src/member-store.js";

const sampleMember = normalizeMember({
  id: "hr-0001",
  name: "山田太郎",
  nameKana: "やまだたろう",
  party: "見本党",
  electionType: "single",
  district: "東京都第1区",
  prefecture: "東京都",
  wins: 3,
  birthDate: "1970-01-01",
  career: ["元東京都議会議員"],
  photo: "./data/photos/hr-0001.svg",
  status: "verified",
});

test("validateMember accepts a complete single-seat member record", () => {
  assert.deepEqual(validateMember(sampleMember), []);
});

test("validateMember requires block for proportional members", () => {
  const proportionalMember = normalizeMember({
    id: "hr-0002",
    name: "比例花子",
    party: "見本党",
    electionType: "proportional",
    photo: "./data/photos/hr-0002.svg",
    status: "draft",
  });

  assert.deepEqual(validateMember(proportionalMember), ["比例代表は block が必須です"]);
});

test("applyMemberFilters combines search and progress filters", () => {
  const members = [
    sampleMember,
    normalizeMember({
      id: "hr-0002",
      name: "比例花子",
      party: "未来連合",
      electionType: "proportional",
      block: "南関東ブロック",
      prefecture: "",
      photo: "./data/photos/hr-0002.svg",
      status: "verified",
      career: ["元県議会議員"],
    }),
  ];

  const filtered = applyMemberFilters(
    members,
    {
      search: "比例",
      party: "all",
      electionType: "all",
      prefecture: "all",
      tracking: "all",
      weakOnly: true,
    },
    {
      learnedIds: [],
      weakIds: ["hr-0002"],
    }
  );

  assert.deepEqual(filtered.map((member) => member.id), ["hr-0002"]);
});

test("deriveAgeFromBirthDate calculates age against a supplied date", () => {
  const age = deriveAgeFromBirthDate("1970-01-01", new Date("2026-03-23T00:00:00+09:00"));

  assert.equal(age, 56);
});

test("toggleTrackedId adds and removes a member id", () => {
  const added = toggleTrackedId([], "hr-0001");
  const removed = toggleTrackedId(added, "hr-0001");

  assert.deepEqual(added, ["hr-0001"]);
  assert.deepEqual(removed, []);
});

test("formatElectionType and getMemberLocationLabel return display strings", () => {
  assert.equal(formatElectionType("single"), "小選挙区");
  assert.equal(getMemberLocationLabel(sampleMember), "東京都第1区");
});

test("createEmptyProgress returns the default shape", () => {
  assert.deepEqual(createEmptyProgress(), {
    learnedIds: [],
    weakIds: [],
  });
});

test("compareMembersByBrowseOrder sorts single-seat prefectures from Hokkaido to Okinawa", () => {
  const members = [
    normalizeMember({
      id: "hr-okinawa",
      name: "沖縄見本",
      party: "見本党",
      electionType: "single",
      district: "沖縄1区",
      prefecture: "沖縄県",
      photo: "./data/photos/hr-okinawa.svg",
      status: "verified",
    }),
    normalizeMember({
      id: "hr-hokkaido",
      name: "北海道見本",
      party: "見本党",
      electionType: "single",
      district: "北海道1区",
      prefecture: "北海道",
      photo: "./data/photos/hr-hokkaido.svg",
      status: "verified",
    }),
    normalizeMember({
      id: "hr-tokyo",
      name: "東京見本",
      party: "見本党",
      electionType: "single",
      district: "東京1区",
      prefecture: "東京都",
      photo: "./data/photos/hr-tokyo.svg",
      status: "verified",
    }),
  ];

  const sorted = [...members].sort(compareMembersByBrowseOrder);

  assert.deepEqual(sorted.map((member) => member.prefecture), ["北海道", "東京都", "沖縄県"]);
});

test("getPrefectureGroups returns prefectures grouped by region order", () => {
  const groups = getPrefectureGroups(["沖縄県", "東京都", "北海道", "福岡県"]);

  assert.deepEqual(groups, [
    { region: "北海道", prefectures: ["北海道"] },
    { region: "関東", prefectures: ["東京都"] },
    { region: "九州・沖縄", prefectures: ["福岡県", "沖縄県"] },
  ]);
});
