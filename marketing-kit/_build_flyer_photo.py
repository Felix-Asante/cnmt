#!/usr/bin/env python3
"""
C.N.M.T premium photo flyer — hand-composed.
Original flyer DNA + commercial remittance photography language.
"""

from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "print"
ASSETS = OUT / "_assets"
OUT.mkdir(exist_ok=True)

BRAND = (208, 16, 24)
NAVY = (10, 26, 47)
MUTED = (90, 101, 119)
WHITE = (255, 255, 255)
SOFT = (253, 236, 237)
LIGHT = (246, 247, 250)
LINE = (220, 226, 234)

WA_URL = (
    "https://wa.me/212715617637"
    "?text=Hi%20C.N.M.T%2C%20I%20want%20to%20send%20money%20%E2%80%94%20please%20quote"
)
SITE = "https://cnmt.shop/"

COUNTRIES = [
    ("GB", "UK"),
    ("FR", "France"),
    ("ES", "Spain"),
    ("MA", "Morocco"),
    ("GH", "Ghana"),
    ("NG", "Nigeria"),
    ("SL", "S. Leone"),
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
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rr(d, xy, fill, radius=24, outline=None, width=2):
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=1)
    qr.add_data(WA_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0a1a2f", back_color="#ffffff").convert("RGB")
    img = img.resize((size, size), Image.Resampling.NEAREST)
    b = max(26, size // 5)
    badge = Image.new("RGB", (b, b), BRAND)
    bd = ImageDraw.Draw(badge)
    bd.text((b // 2, b // 2), "CN", fill=WHITE, font=font(max(12, b // 3), True), anchor="mm")
    img.paste(badge, ((size - b) // 2, (size - b) // 2))
    return img


def circular_mask(size: int) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255)
    return m


def soft_circle_portrait(src: Image.Image, diameter: int) -> Image.Image:
    """Crop subject to a soft circular portrait with subtle ring."""
    img = src.convert("RGB")
    # focus upper-body: center crop slightly toward face
    side = min(img.width, int(img.height * 0.82))
    left = (img.width - side) // 2
    top = max(0, int(img.height * 0.04))
    crop = img.crop((left, top, left + side, top + side)).resize((diameter, diameter), Image.Resampling.LANCZOS)
    mask = circular_mask(diameter)
    # soft edge
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(crop, (0, 0))
    out.putalpha(mask)
    # brand ring
    ring = Image.new("RGBA", (diameter + 18, diameter + 18), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse((0, 0, diameter + 17, diameter + 17), outline=(*BRAND, 255), width=6)
    rd.ellipse((5, 5, diameter + 12, diameter + 12), outline=(*WHITE, 255), width=3)
    ring.paste(out, (9, 9), out)
    return ring


def extract_phone(src: Image.Image, target_h: int) -> Image.Image:
    """Pull phone off light studio bg, add soft commercial shadow."""
    img = src.convert("RGBA")
    px = img.load()
    w, h = img.size
    # sample corner color as backdrop
    corners = [px[2, 2], px[w - 3, 2], px[2, h - 3], px[w - 3, h - 3]]
    cr = sum(c[0] for c in corners) // 4
    cg = sum(c[1] for c in corners) // 4
    cb = sum(c[2] for c in corners) // 4
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = abs(r - cr) + abs(g - cg) + abs(b - cb)
            # also treat very light neutrals as bg
            light = r > 200 and g > 200 and b > 200 and abs(r - g) < 22 and abs(g - b) < 22
            if dist < 55 or light:
                px[x, y] = (r, g, b, 0)
            elif dist < 90:
                px[x, y] = (r, g, b, max(0, 255 - (dist - 55) * 6))

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    # if still very wide (bg not keyed), center-crop to phone aspect ~9:19
    if img.width / max(1, img.height) > 0.72:
        nh = img.height
        nw = int(nh * 0.52)
        left = (img.width - nw) // 2
        img = img.crop((left, 0, left + nw, nh))
        mask = Image.new("L", img.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, img.size[0] - 1, img.size[1] - 1), radius=42, fill=255
        )
        img.putalpha(mask)

    tw = int(target_h * img.width / img.height)
    img = img.resize((tw, target_h), Image.Resampling.LANCZOS)

    shadow = Image.new("RGBA", (img.width + 48, img.height + 48), (0, 0, 0, 0))
    alpha = img.split()[-1]
    sh = Image.new("RGBA", img.size, (10, 26, 47, 0))
    sh.putalpha(alpha.point(lambda p: int(p * 0.32)))
    shadow.paste(sh, (18, 22), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    canvas = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, shadow)
    canvas.paste(img, (8, 4), img)
    return canvas


def build(w: int = 1240, h: int = 1754) -> Image.Image:
    # base — soft paper white with intentional brand atmosphere
    base = Image.new("RGB", (w, h), WHITE)
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    # top-left blush (original flyer DNA)
    for i in range(30, 0, -1):
        a = int(42 * (i / 30))
        od.ellipse((-280, -300, 700, 520), fill=(253, 232, 233, a))
    # right cool wash behind photo
    for i in range(24, 0, -1):
        a = int(30 * (i / 24))
        od.ellipse((w - 720, 80, w + 200, 980), fill=(232, 237, 244, a))
    img = Image.alpha_composite(base.convert("RGBA"), ov).convert("RGB")
    d = ImageDraw.Draw(img)
    pad = 64

    # —— Header (original structure) ——
    rr(d, (pad, 48, pad + 64, 112), BRAND, radius=14)
    d.text((pad + 32, 80), "CN", fill=WHITE, font=font(26, True), anchor="mm")
    d.text((pad + 84, 58), "C.N.M.T", fill=NAVY, font=font(40, True))
    d.text((pad + 84, 100), "INTERNATIONAL MONEY TRANSFER", fill=MUTED, font=font(16, True))

    # QR top-right SCAN HERE (inspiration: Loop House)
    qr_small = make_qr(118)
    d.text((w - pad - 59, 42), "SCAN TO CHAT", fill=BRAND, font=font(14, True), anchor="mm")
    img.paste(qr_small, (w - pad - 118, 58))

    # —— Left copy column ——
    y = 160
    d.text((pad, y), "Send money", fill=NAVY, font=font(54, True))
    d.text((pad, y + 62), "with proof", fill=BRAND, font=font(54, True))
    d.text(
        (pad, y + 140),
        "Smooth, clear, and verified —\nevery time you transfer.",
        fill=MUTED,
        font=font(24),
        spacing=6,
    )

    # value stack (FAST / RELIABLE DNA but product-true)
    pills = [
        ("CLEAR RATES", "Visible as you type"),
        ("VERIFIED PAYOUT", "Proof before we send"),
        ("YOU’RE IN CONTROL", "Cancel unpaid anytime"),
    ]
    py = y + 230
    for title, sub in pills:
        rr(d, (pad, py, pad + 360, py + 64), BRAND, radius=12)
        d.text((pad + 18, py + 14), title, fill=WHITE, font=font(18, True))
        d.text((pad + 18, py + 38), sub, fill=(255, 230, 232), font=font(16))
        py += 76

    # —— Hero portrait (right) ——
    portrait = soft_circle_portrait(Image.open(ASSETS / "cnmt-hero-portrait.jpg"), 560)
    img_rgba = img.convert("RGBA")
    # place portrait
    px, pyy = w - portrait.width - 36, 150
    img_rgba.alpha_composite(portrait, (px, pyy))

    # phone overlay — sits under portrait on the right (TransferGo DNA)
    phone_path = ASSETS / "cnmt-phone-clean.jpg"
    if not phone_path.exists():
        phone_path = ASSETS / "cnmt-phone-quote-ui.jpg"
    phone = extract_phone(Image.open(phone_path), 400)
    # anchor under circular portrait, slightly left so it peeks into center
    phone_x = w - phone.width - 70
    phone_y = pyy + portrait.height - 210
    img_rgba.alpha_composite(phone, (phone_x, phone_y))
    img = img_rgba.convert("RGB")
    d = ImageDraw.Draw(img)

    # —— Corridor band ——
    band_y = max(1080, phone_y + phone.height - 40)
    rr(d, (pad, band_y, w - pad, band_y + 168), LIGHT, radius=22)
    d.text((pad + 28, band_y + 18), "SEND TO MULTIPLE COUNTRIES", fill=BRAND, font=font(16, True))
    # chips in two rows
    x, yy = pad + 28, band_y + 52
    for i, (code, name) in enumerate(COUNTRIES):
        label = f"{code} {name}"
        tw = int(d.textlength(label, font=font(18, True))) + 28
        if x + tw > w - pad - 20:
            x = pad + 28
            yy += 44
        rr(d, (x, yy, x + tw, yy + 34), WHITE, radius=17, outline=LINE, width=1)
        d.text((x + 14, yy + 17), label, fill=NAVY, font=font(18, True), anchor="lm")
        x += tw + 10

    # —— Bottom navy CTA (original footer DNA elevated) ——
    foot = min(h - 420, band_y + 196)
    # ensure footer fits
    if h - foot < 380:
        foot = h - 420
    d.rectangle((0, foot, w, h), fill=NAVY)
    # red accent stripe
    d.rectangle((0, foot, w, foot + 8), fill=BRAND)

    d.text((pad, foot + 36), "C.N.M.T  ·  WE’RE ACTIVE", fill=(255, 180, 184), font=font(16, True))
    d.text((pad, foot + 72), "+212 715 617 637", fill=WHITE, font=font(32, True))
    d.text((pad, foot + 118), "+212 627 140 999", fill=WHITE, font=font(24, True))
    d.text((pad, foot + 170), SITE, fill=WHITE, font=font(28, True))
    d.text(
        (pad, foot + 220),
        "WhatsApp quote  ·  Live rates  ·  Proof before payout",
        fill=(168, 179, 196),
        font=font(18),
    )
    d.text(
        (pad, foot + 270),
        "International money transfer for everyone",
        fill=(130, 142, 160),
        font=font(18),
    )

    # large QR on footer right
    qr_big = make_qr(170)
    # white plate
    plate = Image.new("RGB", (194, 194), WHITE)
    pd = ImageDraw.Draw(plate)
    rr(pd, (0, 0, 193, 193), WHITE, radius=18)
    plate.paste(qr_big, (12, 12))
    img.paste(plate, (w - pad - 194, foot + 48))
    d.text((w - pad - 97, foot + 260), "cnmt.shop", fill=(200, 210, 222), font=font(16, True), anchor="mm")

    return img


def main():
    flyer = build(1240, 1754)
    flyer.save(OUT / "flyer-cnmt-photo.jpg", quality=95, optimize=True)
    flyer.save(OUT / "flyer-cnmt-photo.png")
    wa = flyer.resize((1080, int(1754 * 1080 / 1240)), Image.Resampling.LANCZOS)
    wa.save(OUT / "flyer-cnmt-photo-whatsapp.jpg", quality=93, optimize=True)
    # print size
    build(2480, 3508).save(OUT / "flyer-cnmt-photo-print.jpg", quality=95, optimize=True)
    print("Photo flyer written to", OUT)


if __name__ == "__main__":
    main()
