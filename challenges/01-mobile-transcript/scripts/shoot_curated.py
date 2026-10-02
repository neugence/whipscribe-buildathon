"""Re-shoot the curated evidence set at 1x scale for committing."""
import pathlib, urllib.parse
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[3]
NEXT = ROOT / "challenges" / "01-mobile-transcript" / "next"
SHOTS = NEXT / "shots"
SHOTS.mkdir(exist_ok=True)
base = (NEXT / "index.html").as_uri()

# (filename, query) — curated, one per claimed feature
SET = [
    ("01-reader-320.png",        {"state": "reader", "width": "320", "shot": "1"}),
    ("02-reader-390.png",        {"state": "reader", "width": "390", "shot": "1"}),
    ("03-before-320.png",        {"view": "before", "width": "320", "shot": "1"}),
    ("04-side-by-side-320.png",  {"view": "sbs", "width": "320", "shot": "1"}),
    ("05-search-keyboard.png",   {"state": "keyboard", "width": "390", "shot": "1"}),
    ("06-menu-4items.png",       {"state": "menu", "width": "390", "shot": "1"}),
    ("07-selection-ask.png",     {"state": "ask", "width": "390", "shot": "1"}),
    ("08-processing.png",        {"state": "loading", "width": "320", "shot": "1"}),
    ("09-load-failure.png",      {"state": "error", "width": "320", "shot": "1"}),
    ("10-wrong-account.png",     {"state": "wrongaccount", "width": "320", "shot": "1"}),
    ("11-deleted.png",           {"state": "deleted", "width": "320", "shot": "1"}),
    ("12-empty-transcript.png",  {"state": "empty", "width": "320", "shot": "1"}),
    ("13-offline.png",           {"state": "offline", "width": "320", "shot": "1"}),
    ("14-export-sheet.png",      {"state": "download", "width": "390", "shot": "1"}),
    ("15-signup-boundary.png",   {"state": "signup", "width": "320", "shot": "1"}),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1200, "height": 860}, device_scale_factor=1)
    page = ctx.new_page()
    for name, q in SET:
        page.goto(f"{base}?{urllib.parse.urlencode(q)}")
        page.wait_for_timeout(500)
        page.screenshot(path=str(SHOTS / name), clip={"x": 0, "y": 0, "width": 1200, "height": 860})
    browser.close()
print("done:", len(SET))
