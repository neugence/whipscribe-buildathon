"""Sweep every state of the Challenge 01 prototype, check console errors,
horizontal overflow, and capture screenshots (before/after + states)."""
import sys, pathlib, urllib.parse
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[3]
NEXT = ROOT / "challenges" / "01-mobile-transcript" / "next"
SHOTS = NEXT / "shots"
SHOTS.mkdir(exist_ok=True)

STATES = ["reader", "search", "keyboard", "menu", "selection", "ask", "loading",
          "error", "wrongaccount", "deleted", "empty", "offline", "signup",
          "settings", "download"]

base = (NEXT / "index.html").as_uri()

errors, overflow_failures = [], []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1400, "height": 900}, device_scale_factor=2)
    page = ctx.new_page()
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    def sweep(width, label):
        for st in STATES:
            q = urllib.parse.urlencode({"state": st, "width": width, "shot": "1"})
            page.goto(f"{base}?{q}")
            page.wait_for_timeout(600)
            # overflow check: phone screen should not scroll horizontally
            ov = page.evaluate("""() => {
                const el = document.querySelector('#frameAfter .phone-screen');
                return el ? (el.scrollWidth - el.clientWidth) : -1;
            }""")
            if ov > 1:
                overflow_failures.append(f"{label}/{st}: overflow {ov}px")
            page.screenshot(path=str(SHOTS / f"after-{label}-{st}.png"),
                            clip={"x": 0, "y": 0, "width": 1400, "height": 900})

    sweep("320", "320")
    sweep("390", "390")

    # BEFORE frame at 320
    page.goto(f"{base}?{urllib.parse.urlencode({'view': 'before', 'width': '320', 'shot': '1'})}")
    page.wait_for_timeout(600)
    page.screenshot(path=str(SHOTS / "before-320-reader.png"),
                    clip={"x": 0, "y": 0, "width": 1400, "height": 900})

    # Side-by-side hero
    page.goto(f"{base}?{urllib.parse.urlencode({'view': 'sbs', 'width': '320', 'shot': '1'})}")
    page.wait_for_timeout(600)
    page.screenshot(path=str(SHOTS / "side-by-side-320.png"),
                    clip={"x": 0, "y": 0, "width": 1400, "height": 900})

    # Workbench full view (not shot mode) as hero evidence
    page.goto(base)
    page.wait_for_timeout(800)
    page.screenshot(path=str(SHOTS / "workbench-hero.png"),
                    clip={"x": 0, "y": 0, "width": 1400, "height": 900})

    # Keyboard interaction probe: Escape closes the search sheet
    page.goto(f"{base}?{urllib.parse.urlencode({'state': 'search', 'shot': '1'})}")
    page.wait_for_timeout(400)
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    closed = page.evaluate("""() => {
        const sh = document.querySelector('#afterOverlay .bottom-sheet[data-sheet="search"]');
        return sh && sh.getAttribute('data-open') === '0';
    }""")
    print("Escape closes sheet:", closed)

    # Focus restore probe
    page.goto(f"{base}?{urllib.parse.urlencode({'state': 'menu', 'shot': '1'})}")
    page.wait_for_timeout(400)
    page.evaluate("""() => document.querySelector('#afterOverlay [data-sheet="menu"] [data-close]').click()""")
    page.wait_for_timeout(300)
    active = page.evaluate("() => document.activeElement && document.activeElement.tagName")
    print("Focus after close is on:", active)

    browser.close()

print("\nConsole/page errors:", len(errors))
for e in errors[:10]:
    print("  !", e)
print("Overflow failures:", len(overflow_failures))
for f in overflow_failures[:10]:
    print("  !", f)
print("Screenshots:", len(list(SHOTS.glob('*.png'))))
sys.exit(1 if (errors or overflow_failures or not closed) else 0)
