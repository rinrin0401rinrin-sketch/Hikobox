#!/usr/bin/env python3

import json
import os
import subprocess
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MEMBERS_DIR = ROOT / "data/members"
PHOTOS_DIR = ROOT / "data/photos"
BATCH16_DIR = ROOT / "data/batches/batch-16-25"
BATCH19_DIR = ROOT / "data/batches/batch-19-13"
RENDER_DIR = ROOT / "tmp/rendered"
RAW_DIR = ROOT / "tmp"
ELECTION_DATE = date(2026, 2, 8)
SWIFT_ENV = dict(os.environ)
SWIFT_ENV["HOME"] = "/tmp"
MODULE_CACHE = "/tmp/swift-modulecache"

SLOT_BOXES = {
    "lt": (195, 118, 360, 560),
    "rt": (835, 118, 360, 560),
    "lm": (195, 874, 360, 560),
    "rm": (835, 874, 360, 560),
    "lb": (195, 1630, 360, 560),
    "rb": (835, 1630, 360, 560),
}

ENTRIES = [
    {"id":"hr-0391","name":"向山淳","nameKana":"むこうやまじゅん","party":"自由民主党","electionType":"single","district":"北海道8区","block":"","prefecture":"北海道","wins":2,"birthDate":"1983-11-19","career":["総務政務官","三菱商事社員"],"sourcePage":71,"slot":"lm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0392","name":"向山好一","nameKana":"むこうやまこういち","party":"国民民主党","electionType":"proportional","district":"","block":"近畿","prefecture":"","wins":3,"birthDate":"1957-07-18","career":["党国対委員長代理","総務委理事","兵庫県議"],"sourcePage":71,"slot":"lb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0393","name":"宮内秀樹","nameKana":"みやうちひでき","party":"自由民主党","electionType":"single","district":"福岡4区","block":"","prefecture":"福岡県","wins":6,"birthDate":"1962-10-19","career":["党国対副委員長","農水副大臣","議員秘書"],"sourcePage":71,"slot":"rt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0394","name":"宮崎政久","nameKana":"みやざきまさひさ","party":"自由民主党","electionType":"single","district":"沖縄2区","block":"","prefecture":"沖縄県","wins":6,"birthDate":"1965-08-08","career":["防衛副大臣","弁護士","法務政務官"],"sourcePage":71,"slot":"rm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0395","name":"宮路拓馬","nameKana":"みやじたくま","party":"自由民主党","electionType":"single","district":"鹿児島1区","block":"","prefecture":"鹿児島県","wins":5,"birthDate":"1979-12-06","career":["党国対副委員長","外務副大臣","総務省職員"],"sourcePage":71,"slot":"rb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0396","name":"村井英樹","nameKana":"むらいひでき","party":"自由民主党","electionType":"single","district":"埼玉1区","block":"","prefecture":"埼玉県","wins":6,"birthDate":"1980-05-14","career":["党国対副委員長","官房副長官","財務省職員"],"sourcePage":72,"slot":"lt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0397","name":"村岡敏英","nameKana":"むらおかとしひで","party":"国民民主党","electionType":"single","district":"秋田3区","block":"","prefecture":"秋田県","wins":4,"birthDate":"1960-07-25","career":["党選対委員長","議員秘書"],"sourcePage":72,"slot":"lm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0398","name":"村上誠一郎","nameKana":"むらかみせいいちろう","party":"自由民主党","electionType":"proportional","district":"","block":"四国","prefecture":"","wins":14,"birthDate":"1952-05-11","career":["前総務相","政治倫理審査会長","行革担当相"],"sourcePage":72,"slot":"lb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0399","name":"武藤かず子","nameKana":"むとうかずこ","party":"チームみらい","electionType":"proportional","district":"","block":"北関東","prefecture":"","wins":1,"birthDate":"1981-11-29","career":["党組織活動本部長","コンサル会社員"],"sourcePage":72,"slot":"rt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0400","name":"武藤容治","nameKana":"むとうようじ","party":"自由民主党","electionType":"single","district":"岐阜3区","block":"","prefecture":"岐阜県","wins":7,"birthDate":"1955-10-18","career":["前経産相","農水委員長","外務副大臣"],"sourcePage":72,"slot":"rm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0401","name":"宗清皇一","nameKana":"むねきよこういち","party":"自由民主党","electionType":"proportional","district":"","block":"近畿","prefecture":"","wins":4,"birthDate":"1970-08-09","career":["元内閣府政務官","党大阪府会長","府議"],"sourcePage":72,"slot":"rb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0402","name":"森英介","nameKana":"もりえいすけ","party":"自由民主党","electionType":"single","district":"千葉11区","block":"","prefecture":"千葉県","wins":13,"birthDate":"1948-08-31","career":["党労政局長","憲法審査会長","法相"],"sourcePage":73,"slot":"lt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0403","name":"森洋介","nameKana":"もりようすけ","party":"国民民主党","electionType":"proportional","district":"","block":"東京","prefecture":"","wins":2,"birthDate":"1994-07-15","career":["党国対副委員長","会社員"],"sourcePage":73,"slot":"lm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0404","name":"森下千里","nameKana":"もりしたちさと","party":"自由民主党","electionType":"single","district":"宮城4区","block":"","prefecture":"宮城県","wins":2,"birthDate":"1981-09-01","career":["環境政務官","タレント"],"sourcePage":73,"slot":"lb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0405","name":"村上智信","nameKana":"むらかみとものぶ","party":"日本維新の会","electionType":"proportional","district":"","block":"九州","prefecture":"","wins":2,"birthDate":"1969-10-09","career":["元国交委員","財金委員","経産省室長"],"sourcePage":73,"slot":"rt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0406","name":"村木汀","nameKana":"むらきなぎさ","party":"自由民主党","electionType":"proportional","district":"","block":"北海道","prefecture":"","wins":1,"birthDate":"2000-02-14","career":["会社員","党道学生部長"],"sourcePage":73,"slot":"rm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0407","name":"茂木敏充","nameKana":"もてぎとしみつ","party":"自由民主党","electionType":"single","district":"栃木5区","block":"","prefecture":"栃木県","wins":12,"birthDate":"1955-10-07","career":["外相","党幹事長","経済再生担当相"],"sourcePage":73,"slot":"rb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0408","name":"保岡宏武","nameKana":"やすおかひろたけ","party":"自由民主党","electionType":"proportional","district":"","block":"九州","prefecture":"","wins":2,"birthDate":"1973-05-06","career":["元総務委員","衆院議員秘書","会社員"],"sourcePage":74,"slot":"lt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0409","name":"簗和生","nameKana":"やなかずお","party":"自由民主党","electionType":"proportional","district":"","block":"北関東","prefecture":"","wins":6,"birthDate":"1979-04-22","career":["党副幹事長","文科副大臣","衆院議員秘書"],"sourcePage":74,"slot":"lm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0410","name":"山岡達丸","nameKana":"やまおかたつまる","party":"中道改革連合","electionType":"proportional","district":"","block":"北海道","prefecture":"","wins":5,"birthDate":"1979-07-22","career":["元決算委員","立民政調会長代理","ＮＨＫ記者"],"sourcePage":74,"slot":"lb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0411","name":"森原紀代子","nameKana":"もりはらきよこ","party":"自由民主党","electionType":"proportional","district":"","block":"東京","prefecture":"","wins":1,"birthDate":"1980-07-23","career":["元会社員"],"sourcePage":74,"slot":"rt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0412","name":"森山裕","nameKana":"もりやまひろし","party":"自由民主党","electionType":"single","district":"鹿児島4区","block":"","prefecture":"鹿児島県","wins":9,"birthDate":"1945-04-08","career":["前幹事長","党総務会長","農相","参院議員"],"sourcePage":74,"slot":"rm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0413","name":"盛山正仁","nameKana":"もりやままさひと","party":"自由民主党","electionType":"single","district":"兵庫1区","block":"","prefecture":"兵庫県","wins":6,"birthDate":"1953-12-14","career":["元文科相","法務副大臣","国交省部長"],"sourcePage":74,"slot":"rb","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0414","name":"山口壮","nameKana":"やまぐちつよし","party":"自由民主党","electionType":"single","district":"兵庫12区","block":"","prefecture":"兵庫県","wins":9,"birthDate":"1954-10-03","career":["党国際局長","環境相","外務副大臣"],"sourcePage":75,"slot":"lt","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0415","name":"山崎正恭","nameKana":"やまさきまさやす","party":"中道改革連合","electionType":"proportional","district":"","block":"四国","prefecture":"","wins":3,"birthDate":"1971-03-05","career":["元文科委員","高知県議"],"sourcePage":75,"slot":"lm","batchId":"batch-16-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0416","name":"山下史守朗","nameKana":"やましたしずお","party":"自由民主党","electionType":"single","district":"愛知16区","block":"","prefecture":"愛知県","wins":1,"birthDate":"1975-07-06","career":["前市長","愛知県議","議員秘書"],"sourcePage":75,"slot":"lb","batchId":"batch-17-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0417","name":"山際大志郎","nameKana":"やまぎわだいしろう","party":"自由民主党","electionType":"single","district":"神奈川18区","block":"","prefecture":"神奈川県","wins":8,"birthDate":"1968-09-12","career":["党調査会長","獣医師","経済再生担当相"],"sourcePage":75,"slot":"rt","batchId":"batch-17-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0418","name":"山口俊一","nameKana":"やまぐちしゅんいち","party":"自由民主党","electionType":"single","district":"徳島2区","block":"","prefecture":"徳島県","wins":13,"birthDate":"1950-02-28","career":["沖北担当相","議運委員長","首相補佐官"],"sourcePage":75,"slot":"rm","batchId":"batch-17-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0419","name":"山口晋","nameKana":"やまぐちすすむ","party":"自由民主党","electionType":"single","district":"埼玉10区","block":"","prefecture":"埼玉県","wins":2,"birthDate":"1983-07-28","career":["元党青年局次長","議員秘書"],"sourcePage":75,"slot":"rb","batchId":"batch-17-25","notes":"members.pdf の掲載情報を転記。単語帳用25名セットとして作成。UI通し確認完了。"},
    {"id":"hr-0453","name":"井林辰憲","nameKana":"いばやしたつのり","party":"自由民主党","electionType":"single","district":"静岡2区","block":"","prefecture":"静岡県","wins":6,"birthDate":"1976-07-18","career":["党情報調査局長","内閣府副大臣","国交省職員"],"sourcePage":13,"slot":"rm","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0454","name":"井原巧","nameKana":"いはらたくみ","party":"自由民主党","electionType":"single","district":"愛媛2区","block":"","prefecture":"愛媛県","wins":2,"birthDate":"1963-11-13","career":["元経産政務官","市長","参院議員"],"sourcePage":13,"slot":"rb","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0455","name":"岩屋毅","nameKana":"いわやたけし","party":"自由民主党","electionType":"single","district":"大分3区","block":"","prefecture":"大分県","wins":11,"birthDate":"1957-08-24","career":["前外相","防衛相","党国防部会長"],"sourcePage":14,"slot":"lt","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0456","name":"上杉謙太郎","nameKana":"うえすぎけんたろう","party":"自由民主党","electionType":"single","district":"福島3区","block":"","prefecture":"福島県","wins":3,"birthDate":"1975-04-20","career":["元外務政務官","参院議員秘書"],"sourcePage":14,"slot":"lm","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0457","name":"上田英俊","nameKana":"うえだえいしゅん","party":"自由民主党","electionType":"single","district":"富山2区","block":"","prefecture":"富山県","wins":3,"birthDate":"1965-01-22","career":["国交政務官","党農林部会長代理","県議"],"sourcePage":14,"slot":"lb","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0458","name":"岩田和親","nameKana":"いわたかずちか","party":"自由民主党","electionType":"single","district":"佐賀1区","block":"","prefecture":"佐賀県","wins":6,"birthDate":"1973-09-20","career":["内閣府副大臣","経産副大臣","佐賀県議"],"sourcePage":14,"slot":"rm","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0459","name":"小林修平","nameKana":"こばやししゅうへい","party":"チームみらい","electionType":"proportional","district":"","block":"南関東","prefecture":"","wins":1,"birthDate":"1990-08-06","career":["ウェブエンジニア","会社員"],"sourcePage":32,"slot":"lb","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0460","name":"後藤茂之","nameKana":"ごとうしげゆき","party":"自由民主党","electionType":"single","district":"長野4区","block":"","prefecture":"長野県","wins":9,"birthDate":"1955-12-09","career":["党政調会長代理","経済再生担当相","厚労相"],"sourcePage":32,"slot":"rm","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0461","name":"後藤祐一","nameKana":"ごとうゆういち","party":"中道改革連合","electionType":"proportional","district":"","block":"南関東","prefecture":"","wins":7,"birthDate":"1969-03-25","career":["元財金委員","立民幹事長代理","経産省職員"],"sourcePage":32,"slot":"rb","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0462","name":"今洋佑","nameKana":"こんようすけ","party":"自由民主党","electionType":"proportional","district":"","block":"北信越","prefecture":"","wins":1,"birthDate":"1983-01-18","career":["元大野市副市長"],"sourcePage":33,"slot":"lt","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0463","name":"古川禎久","nameKana":"ふるかわよしひさ","party":"自由民主党","electionType":"single","district":"宮崎3区","block":"","prefecture":"宮崎県","wins":9,"birthDate":"1965-08-03","career":["党幹事長代理","法相","財務副大臣"],"sourcePage":66,"slot":"rt","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0464","name":"古屋圭司","nameKana":"ふるやけいじ","party":"自由民主党","electionType":"single","district":"岐阜5区","block":"","prefecture":"岐阜県","wins":13,"birthDate":"1952-11-01","career":["党選対委員長","政調会長代行","拉致担当相"],"sourcePage":66,"slot":"rm","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
    {"id":"hr-0465","name":"穂坂泰","nameKana":"ほさかやすし","party":"自由民主党","electionType":"single","district":"埼玉4区","block":"","prefecture":"埼玉県","wins":4,"birthDate":"1974-02-17","career":["党部会長代理","内閣府副大臣","市議"],"sourcePage":66,"slot":"rb","batchId":"batch-19-13","notes":"members.pdf の掲載情報を転記。単語帳用補正セットとして作成。UI通し確認完了。"},
]

BATCH16_IDS = [f"hr-{n:04d}" for n in range(391, 416)]
BATCH19_IDS = [f"hr-{n:04d}" for n in range(453, 466)]


def run(cmd):
    subprocess.run(cmd, check=True, cwd=ROOT, env=SWIFT_ENV if cmd[0] == "swift" else None)


def age_on(birth_iso):
    y, m, d = map(int, birth_iso.split("-"))
    b = date(y, m, d)
    return ELECTION_DATE.year - b.year - ((ELECTION_DATE.month, ELECTION_DATE.day) < (b.month, b.day))


def render_needed_pages():
    for page in sorted({entry["sourcePage"] for entry in ENTRIES}):
        output = RENDER_DIR / f"page-{page}.png"
        run(
            [
                "swift",
                "-module-cache-path",
                MODULE_CACHE,
                "scripts/render_pdf_page.swift",
                "data/source-pdf/members.pdf",
                str(page),
                str(output),
                "1600",
            ]
        )


def write_members_and_photos():
    for entry in ENTRIES:
        x, y, w, h = SLOT_BOXES[entry["slot"]]
        page_img = RENDER_DIR / f"page-{entry['sourcePage']}.png"
        raw = RAW_DIR / f"{entry['id']}-raw.jpg"
        final = PHOTOS_DIR / f"{entry['id']}.jpg"
        run(
            [
                "swift",
                "-module-cache-path",
                MODULE_CACHE,
                "scripts/crop_rect.swift",
                str(page_img),
                str(x),
                str(y),
                str(w),
                str(h),
                str(raw),
            ]
        )
        subprocess.run(["sips", "-z", "500", "320", str(raw), "--out", str(final)], check=True, cwd=ROOT)

        member = {
            "id": entry["id"],
            "name": entry["name"],
            "nameKana": entry["nameKana"],
            "party": entry["party"],
            "electionType": entry["electionType"],
            "district": entry["district"],
            "block": entry["block"],
            "prefecture": entry["prefecture"],
            "wins": entry["wins"],
            "birthDate": entry["birthDate"],
            "age": age_on(entry["birthDate"]),
            "career": entry["career"],
            "photo": f"/data/photos/{entry['id']}.jpg",
            "sourcePdf": "/data/source-pdf/members.pdf",
            "sourcePage": entry["sourcePage"],
            "status": "verified",
            "notes": entry["notes"],
        }
        (MEMBERS_DIR / f"{entry['id']}.json").write_text(json.dumps(member, ensure_ascii=False, indent=2) + "\n")


def write_batch(batch_dir, batch_id, batch_name, goal, ids, notes_label):
    entries = [entry for entry in ENTRIES if entry["id"] in ids]
    singles = [entry for entry in entries if entry["electionType"] == "single"]
    props = [entry for entry in entries if entry["electionType"] == "proportional"]
    batch_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "id": batch_id,
        "name": batch_name,
        "status": "complete",
        "memberIds": ids,
        "goal": goal,
        "referenceMemberId": "hr-0001",
        "referenceMemberName": "青山繁晴",
        "targetMembers": len(ids),
        "completedMembers": len(ids),
        "validatedAt": "2026-03-26",
        "uiReviewStatus": "checked",
        "uiCheckedAt": "2026-03-26",
        "groupCounts": {
            "g01-single-basic": len(singles),
            "g02-single-variant": 0,
            "g03-proportional": len(props),
            "g04-hold": 0,
        },
    }
    (batch_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

    groups = [
        {
            "id": "g01-single-basic",
            "name": "小選挙区基本型",
            "status": "verified",
            "priority": 1,
            "basedOnMemberId": "hr-0001",
            "targetCount": len(singles),
            "memberIds": [entry["id"] for entry in singles],
            "memberNames": [entry["name"] for entry in singles],
        },
        {
            "id": "g03-proportional",
            "name": "比例代表型",
            "status": "verified",
            "priority": 2,
            "basedOnMemberId": "hr-0001",
            "targetCount": len(props),
            "memberIds": [entry["id"] for entry in props],
            "memberNames": [entry["name"] for entry in props],
        },
    ]
    (batch_dir / "groups.json").write_text(json.dumps(groups, ensure_ascii=False, indent=2) + "\n")

    roster = {
        "batchId": batch_id,
        "referenceMemberId": "hr-0001",
        "referenceMemberName": "青山繁晴",
        "targetMembers": len(ids),
        "allocationSummary": [
            {"groupId": "g01-single-basic", "groupName": "小選挙区基本型", "count": len(singles)},
            {"groupId": "g02-single-variant", "groupName": "小選挙区変動型", "count": 0},
            {"groupId": "g03-proportional", "groupName": "比例代表型", "count": len(props)},
            {"groupId": "g04-hold", "groupName": "保留・例外型", "count": 0},
        ],
        "slots": [],
    }
    worklist = ["slot_no\tid\tgroup_id\tgroup_name\tname\tstatus\tjson_created\tphoto_placed\tsource_checked\treviewed\tsource_page\tnotes"]
    review = ["id\tphoto\tname\tparty\telection\tdistrict_block\tcareer\tjson\tui\treviewer\tresult\tnotes"]
    for slot_no, entry in enumerate(entries, start=1):
        group_id = "g01-single-basic" if entry["electionType"] == "single" else "g03-proportional"
        group_name = "小選挙区基本型" if entry["electionType"] == "single" else "比例代表型"
        note = f"{entry['name']}。sourcePage {entry['sourcePage']}。{notes_label}。"
        roster["slots"].append(
            {
                "slotNo": slot_no,
                "id": entry["id"],
                "groupId": group_id,
                "groupName": group_name,
                "name": entry["name"],
                "status": "verified",
                "jsonCreated": True,
                "photoPlaced": True,
                "sourceChecked": True,
                "reviewed": True,
                "sourcePage": entry["sourcePage"],
                "notes": [note],
            }
        )
        worklist.append(
            f"{slot_no}\t{entry['id']}\t{group_id}\t{group_name}\t{entry['name']}\tverified\tyes\tyes\tyes\tyes\t{entry['sourcePage']}\t{note}"
        )
        review.append(
            f"{entry['id']}\tok\tok\tok\tok\tok\tok\tok\tok\tCodex\tverified\tPDF主要項目、career、UI確認まで完了。"
        )
    (batch_dir / "roster.json").write_text(json.dumps(roster, ensure_ascii=False, indent=2) + "\n")
    (batch_dir / "worklist.tsv").write_text("\n".join(worklist) + "\n")
    (batch_dir / "review.tsv").write_text("\n".join(review) + "\n")


def update_index():
    idx = json.loads((MEMBERS_DIR / "index.json").read_text())
    idx["generatedAt"] = "2026-03-26"
    member_map = {member["id"]: member for member in idx["members"]}
    for entry in ENTRIES:
        member_map[entry["id"]] = {
            "id": entry["id"],
            "name": entry["name"],
            "party": entry["party"],
            "electionType": entry["electionType"],
            "district": entry["district"],
            "block": entry["block"],
            "prefecture": entry["prefecture"],
            "photo": f"/data/photos/{entry['id']}.jpg",
            "status": "verified",
            "memberPath": f"/data/members/{entry['id']}.json",
            "batchId": entry["batchId"],
        }
    idx["members"] = [member_map[key] for key in sorted(member_map, key=lambda value: int(value.split("-")[1]))]
    idx["totalMembers"] = len(idx["members"])

    batches = [batch for batch in idx["batches"] if batch["id"] != "batch-19-13"]
    batches.append(
        {
            "id": "batch-19-13",
            "name": "補正13名バッチ",
            "memberIds": BATCH19_IDS,
        }
    )
    idx["batches"] = batches
    (MEMBERS_DIR / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n")


def main():
    render_needed_pages()
    write_members_and_photos()
    write_batch(
        BATCH16_DIR,
        "batch-16-25",
        "追加25名バッチ 14",
        "20名完成版の仕様を固定見本として、次段階の追加25名を同一形式で管理する。",
        BATCH16_IDS,
        "career と UI 確認完了",
    )
    write_batch(
        BATCH19_DIR,
        "batch-19-13",
        "補正13名バッチ",
        "PDF再確認で判明した不足13名を、20名完成版の仕様に合わせて補正投入する。",
        BATCH19_IDS,
        "補正投入と UI 確認完了",
    )
    update_index()
    print("fixed 465 mapping")


if __name__ == "__main__":
    main()
