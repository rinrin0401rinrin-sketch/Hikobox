#!/usr/bin/env python3

from __future__ import annotations

import csv
import json
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MEMBERS_DIR = ROOT / "data" / "members"
BATCH_DIR = ROOT / "data" / "batches" / "batch-02-50"
TODAY = "2026-03-24"
SOURCE_PDF = "/data/source-pdf/members.pdf"
COMMON_NOTE = "members.pdf の掲載情報から基本項目を転記。career 未入力のため draft。"


RECORDS = [
    {
        "id": "hr-0021",
        "name": "五十嵐清",
        "nameKana": "いがらしきよし",
        "party": "自由民主党",
        "electionType": "single",
        "district": "栃木2区",
        "block": "",
        "prefecture": "栃木県",
        "wins": 3,
        "birthDate": "1969-12-14",
        "age": 56,
        "sourcePage": 7,
    },
    {
        "id": "hr-0022",
        "name": "安藤高夫",
        "nameKana": "あんどうたかお",
        "party": "自由民主党",
        "electionType": "single",
        "district": "東京28区",
        "block": "",
        "prefecture": "東京都",
        "wins": 3,
        "birthDate": "1959-04-01",
        "age": 66,
        "sourcePage": 7,
    },
    {
        "id": "hr-0023",
        "name": "石井拓",
        "nameKana": "いしいたく",
        "party": "自由民主党",
        "electionType": "single",
        "district": "愛知13区",
        "block": "",
        "prefecture": "愛知県",
        "wins": 2,
        "birthDate": "1965-04-11",
        "age": 60,
        "sourcePage": 8,
    },
    {
        "id": "hr-0024",
        "name": "石橋林太郎",
        "nameKana": "いしばしりんたろう",
        "party": "自由民主党",
        "electionType": "single",
        "district": "広島3区",
        "block": "",
        "prefecture": "広島県",
        "wins": 3,
        "birthDate": "1978-05-02",
        "age": 47,
        "sourcePage": 9,
    },
    {
        "id": "hr-0025",
        "name": "石原宏高",
        "nameKana": "いしはらひろたか",
        "party": "自由民主党",
        "electionType": "single",
        "district": "東京3区",
        "block": "",
        "prefecture": "東京都",
        "wins": 7,
        "birthDate": "1964-06-19",
        "age": 61,
        "sourcePage": 9,
    },
    {
        "id": "hr-0026",
        "name": "石原正敬",
        "nameKana": "いしはらまさたか",
        "party": "自由民主党",
        "electionType": "single",
        "district": "三重3区",
        "block": "",
        "prefecture": "三重県",
        "wins": 2,
        "birthDate": "1971-11-29",
        "age": 54,
        "sourcePage": 9,
    },
    {
        "id": "hr-0027",
        "name": "石坂太",
        "nameKana": "いしざかまさる",
        "party": "自由民主党",
        "electionType": "single",
        "district": "栃木4区",
        "block": "",
        "prefecture": "栃木県",
        "wins": 1,
        "birthDate": "1980-12-23",
        "age": 45,
        "sourcePage": 9,
    },
    {
        "id": "hr-0028",
        "name": "石破茂",
        "nameKana": "いしばしげる",
        "party": "自由民主党",
        "electionType": "single",
        "district": "鳥取1区",
        "block": "",
        "prefecture": "鳥取県",
        "wins": 14,
        "birthDate": "1957-02-04",
        "age": 69,
        "sourcePage": 9,
    },
    {
        "id": "hr-0029",
        "name": "井出庸生",
        "nameKana": "いでようせい",
        "party": "自由民主党",
        "electionType": "single",
        "district": "長野3区",
        "block": "",
        "prefecture": "長野県",
        "wins": 6,
        "birthDate": "1977-11-21",
        "age": 48,
        "sourcePage": 10,
    },
    {
        "id": "hr-0030",
        "name": "伊藤達也",
        "nameKana": "いとうたつや",
        "party": "自由民主党",
        "electionType": "single",
        "district": "東京22区",
        "block": "",
        "prefecture": "東京都",
        "wins": 11,
        "birthDate": "1961-07-06",
        "age": 64,
        "sourcePage": 11,
    },
    {
        "id": "hr-0031",
        "name": "伊藤忠彦",
        "nameKana": "いとうただひこ",
        "party": "自由民主党",
        "electionType": "single",
        "district": "愛知8区",
        "block": "",
        "prefecture": "愛知県",
        "wins": 7,
        "birthDate": "1964-07-11",
        "age": 61,
        "sourcePage": 11,
    },
    {
        "id": "hr-0032",
        "name": "井野俊郎",
        "nameKana": "いのとしろう",
        "party": "自由民主党",
        "electionType": "single",
        "district": "群馬2区",
        "block": "",
        "prefecture": "群馬県",
        "wins": 6,
        "birthDate": "1980-01-08",
        "age": 46,
        "sourcePage": 12,
    },
    {
        "id": "hr-0033",
        "name": "井上信治",
        "nameKana": "いのうえしんじ",
        "party": "自由民主党",
        "electionType": "single",
        "district": "東京25区",
        "block": "",
        "prefecture": "東京都",
        "wins": 9,
        "birthDate": "1969-10-07",
        "age": 56,
        "sourcePage": 12,
    },
    {
        "id": "hr-0034",
        "name": "井上貴博",
        "nameKana": "いのうえたかひろ",
        "party": "自由民主党",
        "electionType": "single",
        "district": "福岡1区",
        "block": "",
        "prefecture": "福岡県",
        "wins": 6,
        "birthDate": "1962-04-02",
        "age": 63,
        "sourcePage": 12,
    },
    {
        "id": "hr-0035",
        "name": "稲田朋美",
        "nameKana": "いなだともみ",
        "party": "自由民主党",
        "electionType": "single",
        "district": "福井1区",
        "block": "",
        "prefecture": "福井県",
        "wins": 8,
        "birthDate": "1959-02-20",
        "age": 66,
        "sourcePage": 12,
    },
    {
        "id": "hr-0036",
        "name": "稲葉大輔",
        "nameKana": "いなばだいすけ",
        "party": "自由民主党",
        "electionType": "single",
        "district": "静岡8区",
        "block": "",
        "prefecture": "静岡県",
        "wins": 1,
        "birthDate": "1974-03-25",
        "age": 51,
        "sourcePage": 12,
    },
    {
        "id": "hr-0037",
        "name": "井原隆",
        "nameKana": "いはらゆたか",
        "party": "自由民主党",
        "electionType": "single",
        "district": "埼玉5区",
        "block": "",
        "prefecture": "埼玉県",
        "wins": 1,
        "birthDate": "1983-01-13",
        "age": 43,
        "sourcePage": 13,
    },
    {
        "id": "hr-0038",
        "name": "今枝宗一郎",
        "nameKana": "いまえだそういちろう",
        "party": "自由民主党",
        "electionType": "single",
        "district": "愛知14区",
        "block": "",
        "prefecture": "愛知県",
        "wins": 6,
        "birthDate": "1984-02-18",
        "age": 41,
        "sourcePage": 13,
    },
    {
        "id": "hr-0039",
        "name": "今岡植",
        "nameKana": "いまおかうえき",
        "party": "自由民主党",
        "electionType": "single",
        "district": "東京26区",
        "block": "",
        "prefecture": "東京都",
        "wins": 1,
        "birthDate": "1988-03-05",
        "age": 37,
        "sourcePage": 13,
    },
    {
        "id": "hr-0040",
        "name": "池下卓",
        "nameKana": "いけしたたく",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪10区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 3,
        "birthDate": "1975-04-10",
        "age": 50,
        "sourcePage": 7,
    },
    {
        "id": "hr-0041",
        "name": "泉健太",
        "nameKana": "いずみけんた",
        "party": "中道改革連合",
        "electionType": "single",
        "district": "京都3区",
        "block": "",
        "prefecture": "京都府",
        "wins": 10,
        "birthDate": "1974-07-29",
        "age": 51,
        "sourcePage": 10,
    },
    {
        "id": "hr-0042",
        "name": "井上英孝",
        "nameKana": "いのうえひでたか",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪1区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 6,
        "birthDate": "1971-10-25",
        "age": 54,
        "sourcePage": 13,
    },
    {
        "id": "hr-0043",
        "name": "岩谷良平",
        "nameKana": "いわたにりょうへい",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪13区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 3,
        "birthDate": "1980-06-07",
        "age": 45,
        "sourcePage": 14,
    },
    {
        "id": "hr-0044",
        "name": "漆間譲司",
        "nameKana": "うるまじょうじ",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪8区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 3,
        "birthDate": "1974-09-14",
        "age": 51,
        "sourcePage": 16,
    },
    {
        "id": "hr-0045",
        "name": "梅村聡",
        "nameKana": "うめむらさとし",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪5区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 2,
        "birthDate": "1975-02-13",
        "age": 50,
        "sourcePage": 16,
    },
    {
        "id": "hr-0046",
        "name": "浦野靖人",
        "nameKana": "うらのやすと",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪15区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 6,
        "birthDate": "1973-04-04",
        "age": 52,
        "sourcePage": 16,
    },
    {
        "id": "hr-0047",
        "name": "遠藤敬",
        "nameKana": "えんどうたかし",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪18区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 6,
        "birthDate": "1968-06-06",
        "age": 57,
        "sourcePage": 17,
    },
    {
        "id": "hr-0048",
        "name": "小川淳也",
        "nameKana": "おがわじゅんや",
        "party": "中道改革連合",
        "electionType": "single",
        "district": "香川1区",
        "block": "",
        "prefecture": "香川県",
        "wins": 8,
        "birthDate": "1971-04-18",
        "age": 54,
        "sourcePage": 19,
    },
    {
        "id": "hr-0049",
        "name": "奥下剛光",
        "nameKana": "おくしたたけみつ",
        "party": "日本維新の会",
        "electionType": "single",
        "district": "大阪7区",
        "block": "",
        "prefecture": "大阪府",
        "wins": 3,
        "birthDate": "1975-10-04",
        "age": 50,
        "sourcePage": 19,
    },
    {
        "id": "hr-0050",
        "name": "有田芳生",
        "nameKana": "ありたよしふ",
        "party": "中道改革連合",
        "electionType": "proportional",
        "district": "",
        "block": "東北",
        "prefecture": "",
        "wins": 2,
        "birthDate": "1952-02-20",
        "age": 73,
        "sourcePage": 7,
    },
    {
        "id": "hr-0051",
        "name": "石川昭政",
        "nameKana": "いしかわあきまさ",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "北関東",
        "prefecture": "",
        "wins": 5,
        "birthDate": "1972-09-18",
        "age": 53,
        "sourcePage": 8,
    },
    {
        "id": "hr-0052",
        "name": "石川勝",
        "nameKana": "いしかわまさる",
        "party": "参政党",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 1,
        "birthDate": "1968-08-03",
        "age": 57,
        "sourcePage": 8,
    },
    {
        "id": "hr-0053",
        "name": "池畑浩太朗",
        "nameKana": "いけはたこうたろう",
        "party": "日本維新の会",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 3,
        "birthDate": "1974-09-26",
        "age": 51,
        "sourcePage": 8,
    },
    {
        "id": "hr-0054",
        "name": "伊佐進一",
        "nameKana": "いさしんいち",
        "party": "中道改革連合",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 5,
        "birthDate": "1974-12-10",
        "age": 51,
        "sourcePage": 8,
    },
    {
        "id": "hr-0055",
        "name": "石井啓一",
        "nameKana": "いしいけいいち",
        "party": "中道改革連合",
        "electionType": "proportional",
        "district": "",
        "block": "北関東",
        "prefecture": "",
        "wins": 11,
        "birthDate": "1958-03-20",
        "age": 67,
        "sourcePage": 8,
    },
    {
        "id": "hr-0056",
        "name": "石田真敏",
        "nameKana": "いしだまさとし",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 10,
        "birthDate": "1952-04-11",
        "age": 73,
        "sourcePage": 9,
    },
    {
        "id": "hr-0057",
        "name": "井戸正枝",
        "nameKana": "いどまさえ",
        "party": "国民民主党",
        "electionType": "proportional",
        "district": "",
        "block": "東京",
        "prefecture": "",
        "wins": 2,
        "birthDate": "1965-12-13",
        "age": 60,
        "sourcePage": 10,
    },
    {
        "id": "hr-0058",
        "name": "伊藤恵介",
        "nameKana": "いとうけいすけ",
        "party": "参政党",
        "electionType": "proportional",
        "district": "",
        "block": "東海",
        "prefecture": "",
        "wins": 1,
        "birthDate": "1978-12-01",
        "age": 47,
        "sourcePage": 10,
    },
    {
        "id": "hr-0059",
        "name": "一谷勇一郎",
        "nameKana": "いちたにゆういちろう",
        "party": "日本維新の会",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 2,
        "birthDate": "1975-01-22",
        "age": 51,
        "sourcePage": 10,
    },
    {
        "id": "hr-0060",
        "name": "市村浩一郎",
        "nameKana": "いちむらこういちろう",
        "party": "日本維新の会",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 6,
        "birthDate": "1964-07-16",
        "age": 61,
        "sourcePage": 10,
    },
    {
        "id": "hr-0061",
        "name": "伊東信久",
        "nameKana": "いとうのぶひさ",
        "party": "日本維新の会",
        "electionType": "proportional",
        "district": "",
        "block": "近畿",
        "prefecture": "",
        "wins": 5,
        "birthDate": "1964-01-04",
        "age": 62,
        "sourcePage": 11,
    },
    {
        "id": "hr-0062",
        "name": "伊東良孝",
        "nameKana": "いとうよしたか",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "北海道",
        "prefecture": "",
        "wins": 7,
        "birthDate": "1948-11-24",
        "age": 77,
        "sourcePage": 11,
    },
    {
        "id": "hr-0063",
        "name": "伊藤聡",
        "nameKana": "いとうさとし",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "南関東",
        "prefecture": "",
        "wins": 1,
        "birthDate": "1979-01-24",
        "age": 47,
        "sourcePage": 11,
    },
    {
        "id": "hr-0064",
        "name": "伊藤信太郎",
        "nameKana": "いとうしんたろう",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "東北",
        "prefecture": "",
        "wins": 8,
        "birthDate": "1953-05-06",
        "age": 72,
        "sourcePage": 11,
    },
    {
        "id": "hr-0065",
        "name": "犬飼明佳",
        "nameKana": "いぬかいあきよし",
        "party": "中道改革連合",
        "electionType": "proportional",
        "district": "",
        "block": "東海",
        "prefecture": "",
        "wins": 1,
        "birthDate": "1972-09-10",
        "age": 53,
        "sourcePage": 12,
    },
    {
        "id": "hr-0066",
        "name": "岩崎比菜",
        "nameKana": "いわさきひな",
        "party": "自由民主党",
        "electionType": "proportional",
        "district": "",
        "block": "南関東",
        "prefecture": "",
        "wins": 1,
        "birthDate": "1993-03-27",
        "age": 32,
        "sourcePage": 14,
    },
    {
        "id": "hr-0067",
        "name": "浮島智子",
        "nameKana": "うきしまともこ",
        "party": "中道改革連合",
        "electionType": "proportional",
        "district": "",
        "block": "北海道",
        "prefecture": "",
        "wins": 6,
        "birthDate": "1963-02-01",
        "age": 63,
        "sourcePage": 15,
    },
    {
        "id": "hr-0068",
        "name": "臼木秀剛",
        "nameKana": "うすきひでたけ",
        "party": "国民民主党",
        "electionType": "proportional",
        "district": "",
        "block": "北海道",
        "prefecture": "",
        "wins": 2,
        "birthDate": "1981-03-28",
        "age": 44,
        "sourcePage": 15,
    },
    {
        "id": "hr-0069",
        "name": "宇佐美登",
        "nameKana": "うさみのぼる",
        "party": "チームみらい",
        "electionType": "proportional",
        "district": "",
        "block": "東京",
        "prefecture": "",
        "wins": 3,
        "birthDate": "1967-02-16",
        "age": 58,
        "sourcePage": 15,
        "notes": "members.pdf の掲載情報から基本項目を転記。career 未入力のため draft。PDF表記の政党略号「み」はチームみらいとして展開。",
    },
    {
        "id": "hr-0070",
        "name": "緒方林太郎",
        "nameKana": "おがたりんたろう",
        "party": "無所属",
        "electionType": "single",
        "district": "福岡9区",
        "block": "",
        "prefecture": "福岡県",
        "wins": 5,
        "birthDate": "1973-01-08",
        "age": 53,
        "sourcePage": 19,
    },
]

NAME_BY_ID = {record["id"]: record["name"] for record in RECORDS}


def make_member(record: dict) -> dict:
    member = deepcopy(record)
    source_page = member.pop("sourcePage")
    note = member.pop("notes", COMMON_NOTE)
    member.update(
        {
            "career": [],
            "photo": f"/data/photos/{member['id']}.jpg",
            "sourcePdf": SOURCE_PDF,
            "sourcePage": source_page,
            "status": "draft",
            "notes": note,
        }
    )
    return member


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def build_members() -> None:
    for record in RECORDS:
        member = make_member(record)
        save_json(MEMBERS_DIR / f"{member['id']}.json", member)


def update_index() -> None:
    index_path = MEMBERS_DIR / "index.json"
    index = load_json(index_path)

    existing = {entry["id"]: entry for entry in index["members"]}
    for record in RECORDS:
        existing[record["id"]] = {
            "id": record["id"],
            "name": record["name"],
            "party": record["party"],
            "electionType": record["electionType"],
            "district": record["district"],
            "block": record["block"],
            "prefecture": record["prefecture"],
            "photo": f"/data/photos/{record['id']}.jpg",
            "status": "draft",
            "memberPath": f"/data/members/{record['id']}.json",
            "batchId": "batch-02-50",
        }

    member_ids = [record["id"] for record in RECORDS]
    batch_ids = [batch["id"] for batch in index["batches"]]
    if "batch-02-50" not in batch_ids:
        index["batches"].append(
            {
                "id": "batch-02-50",
                "name": "標準50名バッチ",
                "memberIds": member_ids,
            }
        )
    else:
        for batch in index["batches"]:
            if batch["id"] == "batch-02-50":
                batch["memberIds"] = member_ids

    index["generatedAt"] = TODAY
    index["totalMembers"] = len(existing)
    index["members"] = [existing[key] for key in sorted(existing)]
    save_json(index_path, index)


def build_operational_batch_files() -> None:
    member_ids = [record["id"] for record in RECORDS]
    chunks = [
        {
            "id": "chunk-01",
            "memberIds": member_ids[0:10],
            "groupId": "g01-single-basic",
            "status": "draft-json-created",
            "completedAt": TODAY,
        },
        {
            "id": "chunk-02",
            "memberIds": member_ids[10:20],
            "groupId": "g01-single-basic",
            "status": "draft-json-created",
            "completedAt": TODAY,
        },
        {
            "id": "chunk-03",
            "memberIds": member_ids[20:30],
            "groupId": "g02-single-variant",
            "status": "draft-json-created",
            "completedAt": TODAY,
        },
        {
            "id": "chunk-04",
            "memberIds": member_ids[30:40],
            "groupId": "g03-proportional",
            "status": "draft-json-created",
            "completedAt": TODAY,
        },
        {
            "id": "chunk-05",
            "memberIds": member_ids[40:50],
            "groupId": "g03-proportional_and_g04-hold",
            "status": "draft-json-created",
            "completedAt": TODAY,
        },
    ]

    groups_template_path = BATCH_DIR / "groups.template.json"
    groups_template = load_json(groups_template_path)
    for group in groups_template["groups"]:
        group["memberNames"] = [NAME_BY_ID[member_id] for member_id in group["memberIds"]]
    save_json(groups_template_path, groups_template)

    groups = load_json(BATCH_DIR / "groups.template.json")
    groups["startedAt"] = TODAY
    for group in groups["groups"]:
        group["status"] = "draft-loaded"
        group["notes"].append("基本項目を sourcePage 付きで draft JSON に投入済み。career と UI 確認が残件。")
    save_json(BATCH_DIR / "groups.json", groups)

    roster_template_path = BATCH_DIR / "roster.template.json"
    roster_template = load_json(roster_template_path)
    for slot in roster_template["slots"]:
        slot["name"] = NAME_BY_ID[slot["id"]]
        slot["notes"] = [f"{slot['name']}。sourcePage {slot['sourcePage']}。写真配置済み。"]
    save_json(roster_template_path, roster_template)

    roster = load_json(BATCH_DIR / "roster.template.json")
    for slot in roster["slots"]:
        slot["name"] = NAME_BY_ID[slot["id"]]
        slot["status"] = "draft-loaded"
        slot["jsonCreated"] = True
        slot["photoPlaced"] = True
        slot["sourceChecked"] = True
        slot["reviewed"] = False
        slot["notes"] = [
            f"{slot['name']}。sourcePage {slot['sourcePage']}。基本項目を draft JSON へ投入済み。career 未入力。"
        ]
    save_json(BATCH_DIR / "roster.json", roster)

    worklist_template_path = BATCH_DIR / "worklist.template.tsv"
    with worklist_template_path.open("r", encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
        fieldnames = rows[0].keys()
    for row in rows:
        row["name"] = NAME_BY_ID[row["id"]]
        row["notes"] = f"{row['name']}。sourcePage {row['source_page']}。写真配置済み。"
    with worklist_template_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    with worklist_template_path.open("r", encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
        fieldnames = rows[0].keys()
    for row in rows:
        row["name"] = NAME_BY_ID[row["id"]]
        row["status"] = "draft-loaded"
        row["json_created"] = "yes"
        row["photo_placed"] = "yes"
        row["source_checked"] = "yes"
        row["reviewed"] = "no"
        row["notes"] = f"{row['name']}。sourcePage {row['source_page']}。基本項目を draft JSON へ投入済み。career 未入力。"
    with (BATCH_DIR / "worklist.tsv").open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)

    review_template_path = BATCH_DIR / "review.template.tsv"
    with review_template_path.open("r", encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
        fieldnames = rows[0].keys()
    for row in rows:
        row["notes"] = f"{NAME_BY_ID[row['id']]}。sourcePage {next(record['sourcePage'] for record in RECORDS if record['id'] == row['id'])}。写真配置済み。"
    with review_template_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)
    with review_template_path.open("r", encoding="utf-8", newline="") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
        fieldnames = rows[0].keys()
    for row in rows:
        row["photo"] = "ok"
        row["name"] = "ok"
        row["party"] = "ok"
        row["election"] = "ok"
        row["district_block"] = "ok"
        row["career"] = "todo"
        row["json"] = "ok"
        row["ui"] = "todo"
        row["result"] = "draft-ok"
        row["notes"] = f"{row['notes']} 基本項目は投入済み。career と UI は未確認。"
    with (BATCH_DIR / "review.tsv").open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)

    manifest = load_json(BATCH_DIR / "manifest.json")
    if "namedMembers" in manifest:
        for entry in manifest["namedMembers"]:
            entry["name"] = NAME_BY_ID[entry["id"]]
    manifest["goal"] = "batch-02-50 の50名分について、基本項目の draft JSON を固めたうえで、career と UI レビューを進められる状態にする。"
    manifest["status"] = "draft-loaded"
    manifest["startedAt"] = TODAY
    manifest["completedChunks"] = chunks
    manifest["nextAction"] = "50名分の career を PDF 照合で追記し、review.tsv と UI 確認を進める。g04-hold は政党・選出区分を優先再確認する。"
    manifest["memberIds"] = member_ids
    manifest["jsonCreatedCount"] = len(member_ids)
    manifest["draftCount"] = len(member_ids)
    manifest["validatedAt"] = TODAY
    manifest["operationalFiles"] = [
        "/data/batches/batch-02-50/groups.json",
        "/data/batches/batch-02-50/roster.json",
        "/data/batches/batch-02-50/worklist.tsv",
        "/data/batches/batch-02-50/review.tsv",
    ]
    save_json(BATCH_DIR / "manifest.json", manifest)

    photo_map_path = BATCH_DIR / "photo-map.json"
    photo_map = load_json(photo_map_path)
    for entry in photo_map["entries"]:
        entry["name"] = NAME_BY_ID[entry["id"]]
    save_json(photo_map_path, photo_map)


def main() -> None:
    build_members()
    update_index()
    build_operational_batch_files()


if __name__ == "__main__":
    main()
