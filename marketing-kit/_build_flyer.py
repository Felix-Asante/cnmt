#!/usr/bin/env python3
"""Modern C.N.M.T flyer — expert redesign, WhatsApp + print."""

from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "print"
OUT.mkdir(exist_ok=True)

BRAND = (208, 16, 24)
NAVY = (10, 26, 47)
MUTED = (90, 101, 119)
SOFT = (253, 232, 233)
WHITE = (255, 255, 255)
LIGHT = (247, 248, 250)
LINE = (226, 231, 238)

WA_URL = (
    "https://wa.me/212715617637"
    "?text=Hi%20C.N.M.T%2C%20I%20want%20to%20send%20money%20%E2%80%94%20please%20quote"
)
SITE_URL = "https://cnmt.shop/"

COUNTRIES = [
    ("GB", "United Kingdom"),
    ("FR", "France"),
    ("ES", "Spain"),
    ("MA", "Morocco"),
    ("GH", "Ghana"),
    ("NG", "Nigeria"),
    ("SL", "Sierra Leone"),
    ("LR", "Liberia"),
    ("KE", "Kenya"),
    ("UG", "Uganda"),
]


def font(size: int, bold: bool = False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def soft_bg(w: int, h: int) -> Image.Image:
    img = Image.new("RGB", (w, h), WHITE)
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for i in range(28, 0, -1):
        a = int(48 * (i / 28))
        r = int(980 * (i / 28))
        d.ellipse((-260, -280, 780 + r // 3, 560), fill=(253, 232, 233, a))
    for i in range(22, 0, -1):
        a = int(36 * (i / 22))
        d.ellipse((w - 700, -100, w + 180, 480), fill=(232, 237, 244, a))
        d.ellipse((w - 820, h - 640, w + 140, h + 80), fill=(10, 26, 47, max(8, a // 4)))
    return Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")


def make_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=1)
    qr.add_data(WA_URL)
    qr.make(fit=True)
    raw = qr.make_image(fill_color="#0a1a2f", back_color="#ffffff").convert("RGB")
    raw = raw.resize((size, size), Image.Resampling.NEAREST)
    b = max(30, size // 5)
    badge = Image.new("RGB", (b, b), BRAND)
    bd = ImageDraw.Draw(badge)
    bd.text((b // 2, b // 2), "CN", fill=WHITE, font=font(max(14, b // 3), True), anchor="mm")
    raw.paste(badge, ((size - b) // 2, (size - b) // 2))
    return raw


def rr(draw, xy, fill, radius=24, outline=None, width=2):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def build(w: int = 1240, h: int = 1754) -> Image.Image:
    img = soft_bg(w, h)
    d = ImageDraw.Draw(img)
    pad = 80

    # —— Brand ——
    rr(d, (pad, pad, pad + 68, pad + 68), BRAND, radius=16)
    d.text((pad + 34, pad + 34), "CN", fill=WHITE, font=font(28, True), anchor="mm")
    d.text((pad + 90, pad + 12), "C.N.M.T", fill=NAVY, font=font(44, True))
    d.text((pad + 90, pad + 58), "International money transfer", fill=MUTED, font=font(23))

    # —— Hero ——
    y = pad + 120
    d.text((pad, y), "Money that moves", fill=NAVY, font=font(72, True))
    d.text((pad, y + 82), "with proof", fill=BRAND, font=font(72, True))
    d.text(
        (pad, y + 185),
        "Clear rates as you type. Payment verified before payout.\n"
        "Change of mind? Cancel unpaid before you pay.",
        fill=MUTED,
        font=font(27),
        spacing=10,
    )

    # thin accent rule
    d.rectangle((pad, y + 280, pad + 120, y + 286), fill=BRAND)

    # —— Corridors (open, not a heavy card) ——
    y = y + 320
    d.text((pad, y), "SEND TO", fill=BRAND, font=font(20, True))
    d.text((pad, y + 34), "Corridors we support", fill=NAVY, font=font(34, True))

    # wrap chips
    x, yy = pad, y + 95
    gap, chip_h = 12, 52
    for code, name in COUNTRIES:
        label = f"{code}  {name}"
        tw = int(d.textlength(label, font=font(22)))
        bw = tw + 44
        if x + bw > w - pad:
            x = pad
            yy += chip_h + gap
        rr(d, (x, yy, x + bw, yy + chip_h), LIGHT, radius=26)
        # small brand/navy dot
        d.ellipse((x + 14, yy + 18, x + 30, yy + 34), fill=BRAND if code in ("GB", "GH", "MA") else NAVY)
        d.text((x + 40, yy + chip_h // 2), label, fill=NAVY, font=font(22), anchor="lm")
        x += bw + gap

    # —— How it works (fills mid-lower, teaches trust loop) ——
    steps_y = yy + chip_h + 48
    d.text((pad, steps_y), "HOW IT WORKS", fill=BRAND, font=font(20, True))
    steps = [
        ("1", "Quote", "Clear rates\nas you type"),
        ("2", "Pay + proof", "Verified\nbefore payout"),
        ("3", "Track", "Reference\non every send"),
        ("4", "Control", "Cancel unpaid\nbefore you pay"),
    ]
    step_gap = 18
    step_w = (w - 2 * pad - 3 * step_gap) // 4
    sy = steps_y + 42
    for i, (num, title, body) in enumerate(steps):
        sx = pad + i * (step_w + step_gap)
        rr(d, (sx, sy, sx + step_w, sy + 168), LIGHT, radius=22)
        d.text((sx + 22, sy + 28), num, fill=BRAND, font=font(28, True))
        d.text((sx + 22, sy + 68), title, fill=NAVY, font=font(24, True))
        d.text((sx + 22, sy + 106), body, fill=MUTED, font=font(18), spacing=4)

    # —— Dual CTA ——
    cta_y = sy + 168 + 40
    left_w = int((w - 2 * pad - 24) * 0.56)
    cta_h = 250

    # Website block
    rr(d, (pad, cta_y, pad + left_w, cta_y + cta_h), NAVY, radius=28)
    d.text((pad + 36, cta_y + 36), "SEND ONLINE", fill=(168, 179, 196), font=font(20, True))
    d.text((pad + 36, cta_y + 78), SITE_URL, fill=WHITE, font=font(34, True))
    d.text(
        (pad + 36, cta_y + 145),
        "Live quote · TRANS- reference\nProof verified before payout",
        fill=(197, 206, 219),
        font=font(22),
        spacing=8,
    )

    # WhatsApp + QR block
    rx = pad + left_w + 24
    rr(d, (rx, cta_y, w - pad, cta_y + cta_h), WHITE, radius=28, outline=LINE, width=2)
    qr_size = 150
    qr = make_qr(qr_size)
    img.paste(qr, (w - pad - qr_size - 24, cta_y + (cta_h - qr_size) // 2))
    d.text((rx + 24, cta_y + 32), "WHATSAPP", fill=BRAND, font=font(18, True))
    d.text((rx + 24, cta_y + 66), "+212 715 617 637", fill=NAVY, font=font(24, True))
    d.text((rx + 24, cta_y + 102), "+212 627 140 999", fill=NAVY, font=font(20, True))
    d.text((rx + 24, cta_y + 150), "Scan to chat", fill=MUTED, font=font(18))
    d.text((rx + 24, cta_y + 180), "Mon–Sat · 9–18 GMT", fill=MUTED, font=font(17))
    d.text((rx + 24, cta_y + 210), "We’re active", fill=NAVY, font=font(18, True))

    # —— Footer ——
    fy = h - 72
    d.text(
        (pad, fy),
        "Clear rates  ·  Verified payout  ·  Cancel before you pay",
        fill=MUTED,
        font=font(20),
    )
    d.text((w - pad, fy), "C.N.M.T", fill=NAVY, font=font(20, True), anchor="ra")

    return img


def main():
    flyer = build(1240, 1754)
    flyer.save(OUT / "flyer-cnmt-modern.jpg", quality=95, optimize=True)
    flyer.save(OUT / "flyer-cnmt-modern.png")
    wa = flyer.resize((1080, int(1754 * 1080 / 1240)), Image.Resampling.LANCZOS)
    wa.save(OUT / "flyer-cnmt-whatsapp.jpg", quality=92, optimize=True)
    build(2480, 3508).save(OUT / "flyer-cnmt-print.jpg", quality=95, optimize=True)
    print("Wrote flyer variants to", OUT)


if __name__ == "__main__":
    main()
