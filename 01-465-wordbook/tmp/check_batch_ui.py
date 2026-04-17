import json
import sys
import time
import urllib.request


BASE = "http://127.0.0.1:4444"


def post(path, payload):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))


def delete(path):
    req = urllib.request.Request(BASE + path, method="DELETE")
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.status


def js(session_id, script, args=None):
    if args is None:
        args = []
    return post(f"/session/{session_id}/execute/sync", {"script": script, "args": args})["value"]


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: python3 tmp/check_batch_ui.py <start_id> <end_id> <expected_count_text>")

    start_id = int(sys.argv[1])
    end_id = int(sys.argv[2])
    expected_count = sys.argv[3]
    target_ids = [f"hr-{n:04d}" for n in range(start_id, end_id + 1)]

    session = post("/session", {"capabilities": {"alwaysMatch": {"browserName": "Safari"}}})
    session_id = session["value"]["sessionId"]

    try:
        post(f"/session/{session_id}/url", {"url": "http://127.0.0.1:8000/"})
        time.sleep(1.5)

        ready = js(
            session_id,
            """
            return {
              ready: document.readyState,
              count: document.querySelector('#member-count')?.textContent?.trim() || '',
              current: document.querySelector('.member-row.is-active .member-name')?.textContent?.trim() || ''
            };
            """,
        )

        results = []
        flip_check = None

        for index, member_id in enumerate(target_ids):
            clicked = js(
                session_id,
                """
                const id = arguments[0];
                const button = document.querySelector('[data-member-id="' + id + '"]');
                if (!button) return false;
                button.click();
                return true;
                """,
                [member_id],
            )
            time.sleep(0.12)
            snapshot = js(
                session_id,
                """
                return {
                  side: document.querySelector('#flashcard')?.dataset.side || '',
                  activeName: document.querySelector('.member-row.is-active .member-name')?.textContent?.trim() || '',
                  cardName: document.querySelector('.card-name')?.textContent?.trim() || '',
                  photo: document.querySelector('.card-photo-front')?.getAttribute('src') || '',
                  count: document.querySelector('#member-count')?.textContent?.trim() || '',
                  overflow: document.documentElement.scrollWidth > window.innerWidth,
                  width: window.innerWidth
                };
                """,
            )
            snapshot["id"] = member_id
            snapshot["clicked"] = clicked
            results.append(snapshot)

            if index == 0:
                js(session_id, "document.querySelector('#flip-button')?.click(); return true;")
                time.sleep(0.1)
                flip_check = js(
                    session_id,
                    """
                    return {
                      side: document.querySelector('#flashcard')?.dataset.side || '',
                      status: document.querySelector('#card-status')?.textContent?.trim() || '',
                      cardName: document.querySelector('.card-name')?.textContent?.trim() || '',
                      location: document.querySelectorAll('.detail-value')[1]?.textContent?.trim() || ''
                    };
                    """,
                )
                js(session_id, "document.querySelector('#flip-button')?.click(); return true;")
                time.sleep(0.05)

        try:
            js(session_id, "window.resizeTo(430, 1200); return true;")
            time.sleep(0.2)
            narrow = js(
                session_id,
                """
                return {
                  width: window.innerWidth,
                  overflow: document.documentElement.scrollWidth > window.innerWidth,
                  activeName: document.querySelector('.member-row.is-active .member-name')?.textContent?.trim() || '',
                  count: document.querySelector('#member-count')?.textContent?.trim() || ''
                };
                """,
            )
        except Exception as exc:
            narrow = {
                "width": None,
                "overflow": False,
                "activeName": results[-1]["activeName"],
                "count": results[-1]["count"],
                "error": str(exc),
            }

        failures = []
        for item in results:
            if not item["clicked"]:
                failures.append({"id": item["id"], "reason": "button-not-found"})
            if item["cardName"] != item["activeName"]:
                failures.append(
                    {
                        "id": item["id"],
                        "reason": "card-name-mismatch",
                        "cardName": item["cardName"],
                        "activeName": item["activeName"],
                    }
                )
            expected_photo = f"/data/photos/{item['id']}.jpg"
            if item["photo"] != expected_photo:
                failures.append(
                    {
                        "id": item["id"],
                        "reason": "photo-mismatch",
                        "photo": item["photo"],
                        "expected": expected_photo,
                    }
                )
            if item["count"] != expected_count:
                failures.append({"id": item["id"], "reason": "count-mismatch", "count": item["count"]})
            if item["overflow"]:
                failures.append({"id": item["id"], "reason": "overflow", "width": item["width"]})

        if not flip_check or flip_check.get("side") != "back":
            failures.append({"id": target_ids[0], "reason": "flip-failed", "flip": flip_check})
        if narrow.get("overflow"):
            failures.append({"id": target_ids[-1], "reason": "narrow-overflow", "narrow": narrow})

        print(
            json.dumps(
                {
                    "ready": ready,
                    "checkedCount": len(results),
                    "first": results[0],
                    "last": results[-1],
                    "flipCheck": flip_check,
                    "narrow": narrow,
                    "failures": failures,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    finally:
        try:
            delete(f"/session/{session_id}")
        except Exception:
            pass


if __name__ == "__main__":
    main()
