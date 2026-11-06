#!/usr/bin/env python3
"""Render the deployment diagrams used in DEPLOYMENT.md and the #227 pull request.

    python3 docs/images/deployment/make_diagrams.py

Everything is drawn with Pillow so the diagrams can be regenerated whenever the
topology changes — the PNGs in this folder are build output, this file is the
source.
"""

import os
import textwrap

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

BG = "#ffffff"
INK = "#0f172a"
MUTED = "#64748b"
LINE = "#cbd5e1"

REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
MONO = "/System/Library/Fonts/Supplemental/Courier New.ttf"

ACCENTS = {
    "main": "#f97316",
    "root": "#4f46e5",
    "matrixmystics": "#0d9488",
    "nginx": "#7c3aed",
    "ci": "#0891b2",
    "box": "#475569",
    "bad": "#dc2626",
    "good": "#059669",
}


def font(size, bold=False, mono=False):
    path = MONO if mono else (BOLD if bold else REGULAR)
    return ImageFont.truetype(path, size)


def rounded(draw, box, fill, outline, radius=14, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def center_text(draw, xy, text, fnt, fill):
    left, top, right, bottom = draw.textbbox((0, 0), text, font=fnt)
    draw.text((xy[0] - (right - left) / 2, xy[1] - (bottom - top) / 2 - top), text, font=fnt, fill=fill)


def arrow(draw, start, end, fill, width=3, head=12):
    draw.line([start, end], fill=fill, width=width)
    import math

    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    for sign in (1, -1):
        draw.line(
            [
                end,
                (
                    end[0] - head * math.cos(angle - sign * 0.42),
                    end[1] - head * math.sin(angle - sign * 0.42),
                ),
            ],
            fill=fill,
            width=width,
        )


def label(draw, xy, text, fnt, fill, anchor="mm"):
    left, top, right, bottom = draw.textbbox((0, 0), text, font=fnt)
    w, h = right - left, bottom - top
    x, y = xy
    if anchor[0] == "m":
        x -= w / 2
    elif anchor[0] == "r":
        x -= w
    if anchor[1] == "m":
        y -= h / 2
    draw.text((x, y - top), text, font=fnt, fill=fill)
    return w, h


def box(draw, x, y, w, h, title, lines, accent, badge=None):
    rounded(draw, (x, y, x + w, y + h), "#ffffff", accent, radius=16, width=2)
    draw.rounded_rectangle((x, y, x + 8, y + h), radius=4, fill=accent)
    label(draw, (x + 26, y + 18), title, font(21, bold=True), INK, anchor="la")
    if badge:
        badge_w = draw.textlength(badge, font=font(15, bold=True, mono=True)) + 22
        draw.rounded_rectangle(
            (x + w - badge_w - 18, y + 16, x + w - 18, y + 46),
            radius=8,
            fill=accent,
        )
        center_text(draw, (x + w - badge_w / 2 - 18, y + 31), badge, font(15, bold=True, mono=True), "#ffffff")
    offset = 54
    for line in lines:
        label(draw, (x + 26, y + offset), line, font(16), MUTED, anchor="la")
        offset += 26


def canvas(width, height, title, subtitle):
    img = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, width - 1, height - 1), outline="#e2e8f0", width=2)
    label(draw, (40, 34), title, font(30, bold=True), INK, anchor="la")
    label(draw, (40, 76), subtitle, font(17), MUTED, anchor="la")
    return img, draw


def topology():
    img, draw = canvas(
        1440,
        880,
        "tenali.fun — one nginx, three apps, three ports",
        "Every public path is a reverse proxy. nginx never serves a build; each app owns its own checkout, build and systemd unit.",
    )

    box(
        draw,
        420,
        120,
        600,
        120,
        "nginx :443  (TLS · Let's Encrypt)",
        [
            "terminates TLS, then proxies each path to the app that owns it",
            "one prefix per path — /summership/ · /matrixmystics/ · /",
        ],
        ACCENTS["nginx"],
        badge="sites-available/tenali",
    )

    apps = [
        ("/                →  127.0.0.1:4003", "root app", ["branch tenali-root", "VITE_BASE_PATH=/", "tenali-root.service"], "root"),
        ("/summership/     →  127.0.0.1:4001", "main app", ["branch main", "VITE_BASE_PATH=/summership/", "tenali.service"], "main"),
        ("/matrixmystics/  →  127.0.0.1:4004", "Matrix Mystics", ["branch matrix-mystics", "VITE_BASE_PATH=/matrixmystics/", "tenali-matrixmystics.service"], "matrixmystics"),
    ]

    x = 60
    for path_line, title, lines, key in apps:
        accent = ACCENTS[key]
        w = 420
        box(draw, x, 380, w, 190, title, lines, accent, badge=f":{apps.index((path_line, title, lines, key)) + 0 or 0}" if False else None)
        label(draw, (x + 26, 352), path_line, font(18, bold=True, mono=True), accent, anchor="la")
        arrow(draw, (x + w / 2, 240), (x + w / 2, 380), accent, width=3)
        x += w + 40

    label(
        draw,
        (60, 620),
        "Each app is the same Express server: its own React build, its own /<type>-api routes, its own Socket.IO.",
        font(17),
        MUTED,
        anchor="la",
    )
    label(
        draw,
        (60, 652),
        "One prefix, one owner: nginx strips /summership/ and /matrixmystics/ before forwarding, so every app is mounted at the root of its own port.",
        font(17),
        MUTED,
        anchor="la",
    )

    rounded(draw, (60, 700, 1380, 830), "#f8fafc", "#e2e8f0", radius=14, width=2)
    label(draw, (88, 724), "Why the prefix is stripped, and why it matters", font(19, bold=True), INK, anchor="la")
    label(
        draw,
        (88, 762),
        "location /matrixmystics/ { proxy_pass http://127.0.0.1:4004/; }   ← the trailing slash replaces the matched prefix with /",
        font(16, mono=True),
        ACCENTS["matrixmystics"],
        anchor="la",
    )
    label(
        draw,
        (88, 794),
        "/matrixmystics/matrix-api/question  →  :4004  /matrix-api/question   (the app never learns its public path)",
        font(16, mono=True),
        MUTED,
        anchor="la",
    )

    img.save(os.path.join(HERE, "topology.png"))


def deploy_flow():
    img, draw = canvas(
        1440,
        760,
        "Deploy flow — the script that runs is the script that was reviewed",
        "Before every run the workflow copies server/deploy/ from the repository to the droplet, so no unversioned script can drift on the box.",
    )

    steps = [
        ("git push", ["to main or", "matrix-mystics"], "ci"),
        ("GitHub Actions", ["plan job picks", "the app"], "ci"),
        ("SSH to droplet", ["tar server/deploy/", "→ /home/tenali/deploy/"], "ci"),
        ("deploy.sh deploy <app>", ["checkout · build ·", "unit · restart"], "box"),
        ("app live", ["4001 · 4003 · 4004", "behind nginx"], "good"),
    ]

    x = 60
    for title, lines, key in steps:
        accent = ACCENTS[key]
        w = 240
        h = 150
        box(draw, x, 200, w, h, title, lines, accent)
        if x + w < 1200:
            arrow(draw, (x + w + 6, 275), (x + w + 34, 275), "#94a3b8", width=3)
        x += w + 40

    rounded(draw, (60, 420, 1380, 700), "#f8fafc", "#e2e8f0", radius=14, width=2)
    label(draw, (88, 446), "What the script guarantees", font(19, bold=True), INK, anchor="la")
    rows = [
        ("reviewable", "the script, the units and the nginx template are committed files — how we deploy is a pull request, not an edit on the box"),
        ("repeatable", "one row per app: branch, checkout, port, base path, unit — a fourth app is a row plus one .service file"),
        ("reversible", "the nginx config is backed up and rolled back automatically if nginx -t fails; a bad deploy is git reset --hard + restart"),
    ]
    y = 486
    for name, text in rows:
        label(draw, (88, y), name, font(17, bold=True), ACCENTS["box"], anchor="la")
        label(draw, (230, y), textwrap.shorten(text, 140), font(16), MUTED, anchor="la")
        y += 46

    img.save(os.path.join(HERE, "deploy-flow.png"))


def request_lifecycle():
    img, draw = canvas(
        1440,
        820,
        "Request lifecycle — why /matrixmystics/ reaches the right app",
        "Two rules decide whether a request is answered by the Matrix Mystics app or by the SPA fallback of some other app.",
    )

    # The good path
    label(draw, (60, 130), "CORRECT  —  nginx proxies", font(20, bold=True), ACCENTS["good"], anchor="la")
    steps = [
        ("browser", "GET /matrixmystics/\nmatrix-api/question"),
        ("nginx", "location /matrixmystics/\nproxy_pass …:4004/"),
        ("express :4004", "sees /matrix-api/question\n→ JSON answer"),
    ]
    x = 60
    for i, (title, lines) in enumerate(steps):
        w = 400
        accent = ACCENTS["good"] if i == 0 else ACCENTS["nginx"] if i == 1 else ACCENTS["matrixmystics"]
        rounded(draw, (x, 170, x + w, 290), "#ffffff", accent, radius=14, width=2)
        label(draw, (x + 22, 190), title, font(19, bold=True), INK, anchor="la")
        for j, line in enumerate(lines.split("\n")):
            label(draw, (x + 22, 226 + j * 24), line, font(15, mono=True), MUTED, anchor="la")
        if i < len(steps) - 1:
            arrow(draw, (x + w + 6, 230), (x + w + 34, 230), "#94a3b8")
        x += w + 40

    # The bad path
    label(draw, (60, 350), "WRONG  —  nginx serves files, or the app redirects its own root", font(20, bold=True), ACCENTS["bad"], anchor="la")
    bad = [
        ("static mount", "root /home/tenali/tenali-matrixmystics/client/dist;\n→ /matrixmystics/api/... answers with index.html"),
        ("app-owned redirect", "SUBPATH_REDIRECT=/matrixmystics\n→ /matrixmystics/ → 302 → /matrixmystics/ → …"),
    ]
    x = 60
    for title, lines in bad:
        w = 620
        rounded(draw, (x, 390, x + w, 500), "#fff1f2", ACCENTS["bad"], radius=14, width=2)
        label(draw, (x + 22, 408), title, font(18, bold=True), ACCENTS["bad"], anchor="la")
        for j, line in enumerate(lines.split("\n")):
            label(draw, (x + 22, 442 + j * 24), line, font(15, mono=True), MUTED, anchor="la")
        x += w + 40

    rounded(draw, (60, 560, 1380, 780), "#f8fafc", "#e2e8f0", radius=14, width=2)
    label(draw, (88, 586), "How this repository prevents both", font(19, bold=True), INK, anchor="la")
    checks = [
        ("nginx", "every location is a proxy_pass — a root/alias mount would freeze one app's bundle (the June-2 stale-shell incident)"),
        ("units", "every unit sets SUBPATH_REDIRECT=/ so the app never redirects the prefix that nginx already owns"),
        ("tests", "server/__tests__/deploymentArtifacts.test.js fails the build if a location stops proxying, or a unit loses its port"),
    ]
    y = 626
    for name, text in checks:
        label(draw, (88, y), name, font(17, bold=True, mono=True), ACCENTS["box"], anchor="la")
        label(draw, (230, y), text, font(16), MUTED, anchor="la")
        y += 46

    img.save(os.path.join(HERE, "request-lifecycle.png"))


if __name__ == "__main__":
    topology()
    deploy_flow()
    request_lifecycle()
    print("wrote topology.png, deploy-flow.png, request-lifecycle.png")
