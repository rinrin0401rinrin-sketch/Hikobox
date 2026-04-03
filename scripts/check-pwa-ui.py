import json
import sys
import time
import urllib.request
import urllib.error


BASE = "http://127.0.0.1:4444"
TARGET = "http://127.0.0.1:8000/"


def post(path, payload):
    last_error = None
    for attempt in range(4):
        req = urllib.request.Request(
            BASE + path,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code not in (404, 500) or attempt == 3:
                raise
            time.sleep(0.35)
        except urllib.error.URLError as error:
            last_error = error
            if attempt == 3:
                raise
            time.sleep(0.35)

    raise last_error


def delete(path):
    req = urllib.request.Request(BASE + path, method="DELETE")
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.status


def js(session_id, script, args=None):
    if args is None:
        args = []
    return post(f"/session/{session_id}/execute/sync", {"script": script, "args": args})["value"]


def main():
    session = post("/session", {"capabilities": {"alwaysMatch": {"browserName": "Safari"}}})
    session_id = session["value"]["sessionId"]

    try:
        post(f"/session/{session_id}/url", {"url": TARGET})
        time.sleep(1.8)

        overview = js(
            session_id,
            """
            return {
              ready: document.readyState,
              tabCount: document.querySelectorAll('[data-tab]').length,
              activeTab: document.querySelector('.tab-button.is-active')?.textContent?.trim() || '',
              selectedName: document.querySelector('#detail-title')?.textContent?.trim() || '',
              tiles: document.querySelectorAll('.member-tile').length,
              hasCard: Boolean(document.querySelector('.card-photo-front')),
              buildBadge: document.querySelector('#build-badge')?.textContent?.trim() || '',
              frontHasName: Boolean(document.querySelector('.card-face-front .front-card-name')),
              frontHasKana: Boolean(document.querySelector('.card-face-front .front-card-kana')),
            };
            """,
        )

        js(session_id, "document.querySelector('[data-tab=\"proportional\"]')?.click(); return true;")
        time.sleep(0.4)
        proportional = js(
            session_id,
            """
            return {
              activeTab: document.querySelector('.tab-button.is-active')?.textContent?.trim() || '',
              heading: document.querySelector('#browse-title')?.textContent?.trim() || '',
              tiles: document.querySelectorAll('.member-tile').length,
              blockValue: document.querySelector('[data-control=\"proportional-block\"]')?.value || ''
            };
            """,
        )

        js(session_id, "document.querySelector('[data-tab=\"search\"]')?.click(); return true;")
        time.sleep(0.4)
        js(
            session_id,
            """
            const input = document.querySelector('[data-control="search-query"]');
            input.value = 'あおやま';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            document.querySelector('[data-control="search-apply"]')?.click();
            return true;
            """,
        )
        time.sleep(0.6)
        search = js(
            session_id,
            """
            return {
              activeTab: document.querySelector('.tab-button.is-active')?.textContent?.trim() || '',
              heading: document.querySelector('#browse-title')?.textContent?.trim() || '',
              selectedName: document.querySelector('#detail-title')?.textContent?.trim() || '',
              tiles: document.querySelectorAll('.member-tile').length,
              firstTile: document.querySelector('.member-tile .member-name')?.textContent?.trim() || '',
              summary: document.querySelector('#browse-summary')?.textContent?.trim() || ''
            };
            """,
        )

        js(
            session_id,
            """
            const input = document.querySelector('[data-control="search-query"]');
            input.value = '__no_match__';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            document.querySelector('[data-control="search-apply"]')?.click();
            return true;
            """,
        )
        time.sleep(0.6)
        empty_search = js(
            session_id,
            """
            return {
              tiles: document.querySelectorAll('.member-tile').length,
              emptyText: document.querySelector('.empty-state')?.textContent?.trim() || '',
              detailTitle: document.querySelector('#detail-title')?.textContent?.trim() || ''
            };
            """,
        )

        js(
            session_id,
            """
            const input = document.querySelector('[data-control="search-query"]');
            input.value = 'あおやま';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            document.querySelector('[data-control="search-apply"]')?.click();
            return true;
            """,
        )
        time.sleep(0.6)

        js(
            session_id,
            """
            document.querySelector('#flip-button')?.click();
            return document.querySelector('#flashcard')?.dataset.side || '';
            """,
        )
        time.sleep(0.2)
        flip = js(
            session_id,
            """
            return {
              side: document.querySelector('#flashcard')?.dataset.side || '',
              detailLabels: Array.from(document.querySelectorAll('.detail-label')).slice(0, 4).map((node) => node.textContent.trim()),
              hasBackKana: Boolean(document.querySelector('.back-name-kana')),
            };
            """,
        )

        try:
            js(session_id, "window.resizeTo(390, 844); return true;")
            time.sleep(0.3)
            narrow = js(
                session_id,
                """
                return {
                  width: window.innerWidth,
                  overflow: document.documentElement.scrollWidth > window.innerWidth,
                  controls: Array.from(document.querySelectorAll('.card-controls button')).map((node) => node.textContent.trim()),
                };
                """,
            )
        except Exception as exc:
            narrow = {"error": str(exc)}

        js(session_id, f"window.location.href = {json.dumps(TARGET)}; return true;")
        time.sleep(1.2)
        restored = js(
            session_id,
            """
            return {
              activeTab: document.querySelector('.tab-button.is-active')?.textContent?.trim() || '',
              selectedName: document.querySelector('#detail-title')?.textContent?.trim() || '',
              query: document.querySelector('[data-control="search-query"]')?.value || ''
            };
            """,
        )

        result = {
            "overview": overview,
            "proportional": proportional,
            "search": search,
            "emptySearch": empty_search,
            "flip": flip,
            "narrow": narrow,
            "restored": restored,
        }

        print(json.dumps(result, ensure_ascii=False, indent=2))

        failures = []
        if overview["tabCount"] != 3:
            failures.append("tab-count")
        if not overview["hasCard"]:
            failures.append("missing-card-photo")
        if "テスト版" not in overview["buildBadge"]:
            failures.append("build-badge")
        if overview["frontHasName"] or overview["frontHasKana"]:
            failures.append("front-photo-only")
        if overview["selectedName"] != "単語帳カード":
            failures.append("detail-header-title")
        if proportional["activeTab"] != "比例代表":
            failures.append("proportional-tab")
        if search["activeTab"] != "検索":
            failures.append("search-tab")
        if search["tiles"] < 1 or "青山" not in search["firstTile"]:
            failures.append("search-result")
        if empty_search["tiles"] != 0 or "見つかりません" not in empty_search["emptyText"]:
            failures.append("empty-search")
        if flip["side"] != "back":
            failures.append("flip")
        if not flip["hasBackKana"]:
            failures.append("back-kana")
        if narrow.get("overflow"):
            failures.append("narrow-overflow")
        if restored["activeTab"] != "検索" or "あおやま" not in restored["query"]:
            failures.append("state-restore")

        if failures:
            raise SystemExit(f"UI smoke test failed: {', '.join(failures)}")
    finally:
        try:
            delete(f"/session/{session_id}")
        except Exception:
            pass


if __name__ == "__main__":
    sys.exit(main())
