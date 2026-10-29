#!/usr/bin/env python3
"""Generate C.N.M.T WhatsApp marketing kit visual assets."""

from __future__ import annotations

import math
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
BRAND = "#d01018"
NAVY = "#0a1a2f"
MUTED = "#5a6577"
SOFT = "#fde8e9"
BG = "#ffffff"
LIGHT = "#f7f8fa"
BORDER = "#e8ecf2"

WA_URL = (
    "https://wa.me/212715617637"
    "?text="
    "Hi%20C.N.M.T%2C%20I%20want%20to%20send%20money%20%E2%80%94%20please%20quote%20GBP%E2%86%92GHS"
)
PHONE = "+212 715 617 637"
PHONE2 = "+212 627 140 999"
EMAIL = "support@cnmt.shop"
BRAND_NAME = "C.N.M.T"


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, box, fill, radius=24, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_mark(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0):
    s = int(64 * scale)
    rounded_rect(draw, (x, y, x + s, y + s), hex_rgb(BRAND), radius=int(14 * scale))
    draw.text(
        (x + s // 2, y + s // 2),
        "CN",
        fill=hex_rgb(BG),
        font=font(int(26 * scale), bold=True),
        anchor="mm",
    )
    draw.text(
        (x + s + int(16 * scale), y + s // 2),
        BRAND_NAME,
        fill=hex_rgb(NAVY),
        font=font(int(36 * scale), bold=True),
        anchor="lm",
    )


def bg_canvas(w: int, h: int) -> Image.Image:
    img = Image.new("RGB", (w, h), hex_rgb(BG))
    draw = ImageDraw.Draw(img, "RGBA")
    # soft brand radial approximations
    for i in range(18, 0, -1):
        a = int(40 * (i / 18))
        r = int(420 * (i / 18))
        draw.ellipse((-120 - r // 4, -100 - r // 4, 380 + r // 2, 320 + r // 2), fill=(253, 232, 233, a))
    for i in range(14, 0, -1):
        a = int(28 * (i / 14))
        r = int(360 * (i / 14))
        draw.ellipse((w - 420 - r // 3, -80, w + 80, 300 + r // 2), fill=(232, 237, 244, a))
    return img.convert("RGB")


def make_qr(path: Path, box_size: int = 16, border: int = 2) -> Image.Image:
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=box_size, border=border)
    qr.add_data(WA_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=NAVY, back_color=BG).convert("RGB")
    # brand center badge
    w, h = img.size
    badge = Image.new("RGB", (int(w * 0.22), int(h * 0.22)), hex_rgb(BRAND))
    bd = ImageDraw.Draw(badge)
    bd.text((badge.size[0] // 2, badge.size[1] // 2), "CN", fill=hex_rgb(BG), font=font(max(18, badge.size[0] // 3), bold=True), anchor="mm")
    # round-ish by pasting centered
    img.paste(badge, ((w - badge.size[0]) // 2, (h - badge.size[1]) // 2))
    img.save(path, quality=95)
    return img


def branded_qr_poster(qr_img: Image.Image, out: Path):
    W, H = 1080, 1350
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 72, 72, 1.15)
    d.text((72, 180), "Scan to send\non WhatsApp", fill=hex_rgb(NAVY), font=font(64, bold=True))
    d.text((72, 340), "Clear rates · Verified payout · Cancel before you pay", fill=hex_rgb(MUTED), font=font(28))
    qr = qr_img.resize((680, 680), Image.Resampling.NEAREST)
    frame = Image.new("RGB", (720, 720), hex_rgb(BG))
    fd = ImageDraw.Draw(frame)
    rounded_rect(fd, (0, 0, 719, 719), hex_rgb(BG), radius=36, outline=hex_rgb(BORDER), width=3)
    frame.paste(qr, (20, 20))
    img.paste(frame, ((W - 720) // 2, 420))
    d.text((W // 2, 1180), PHONE, fill=hex_rgb(NAVY), font=font(34, bold=True), anchor="mm")
    d.text((W // 2, 1235), "WhatsApp · Message to get a quote", fill=hex_rgb(MUTED), font=font(26), anchor="mm")
    img.save(out, quality=95)


def card(out: Path, eyebrow: str, title: str, lines: list[str], cta: str = "Message on WhatsApp →"):
    W, H = 1080, 1080
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 64, 64, 1.0)
    d.text((64, 180), eyebrow.upper(), fill=hex_rgb(BRAND), font=font(28, bold=True))
    # wrap title
    y = 230
    for part in title.split("\n"):
        d.text((64, y), part, fill=hex_rgb(NAVY), font=font(56, bold=True))
        y += 68
    y += 20
    for line in lines:
        rounded_rect(d, (64, y, W - 64, y + 78), hex_rgb(LIGHT), radius=16)
        d.text((92, y + 39), line, fill=hex_rgb(NAVY), font=font(30), anchor="lm")
        y += 96
    rounded_rect(d, (64, H - 160, W - 64, H - 72), hex_rgb(BRAND), radius=18)
    d.text(((W) // 2, H - 116), cta, fill=hex_rgb(BG), font=font(32, bold=True), anchor="mm")
    img.save(out, quality=95)


def welcome_card(out: Path):
    card(
        out,
        "Welcome",
        "International money\ntransfer for everyone",
        [
            "🇬🇧 → 🇬🇭  Clear rates as you type",
            "Every transfer gets a reference",
            "Verified before payout",
            "Cancel unpaid anytime before you pay",
        ],
        "Chat C.N.M.T on WhatsApp →",
    )


def corridor_card(out: Path):
    W, H = 1080, 1080
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 64, 64, 1.0)
    d.text((64, 180), "CORRIDOR", fill=hex_rgb(BRAND), font=font(28, bold=True))
    d.text((64, 230), "GBP → GHS", fill=hex_rgb(NAVY), font=font(72, bold=True))
    d.text((64, 320), "Rates stay visible as you type", fill=hex_rgb(MUTED), font=font(30))
    # summary panel
    rounded_rect(d, (64, 400, W - 64, 780), hex_rgb(BG), radius=24, outline=hex_rgb(BORDER), width=2)
    rows = [
        ("You send", "£250.00"),
        ("They get", "GH₵4,850.00"),
        ("Fees", "Included"),
        ("Promo example", "SAVE10 · off what you pay"),
    ]
    y = 440
    for label, val in rows:
        d.text((100, y), label, fill=hex_rgb(MUTED), font=font(28))
        d.text((W - 100, y), val, fill=hex_rgb(NAVY), font=font(30, bold=True), anchor="ra")
        y += 70
    rounded_rect(d, (64, H - 160, W - 64, H - 72), hex_rgb(BRAND), radius=18)
    d.text((W // 2, H - 116), "WhatsApp for today’s live quote →", fill=hex_rgb(BG), font=font(30, bold=True), anchor="mm")
    img.save(out, quality=95)


def trust_card(out: Path):
    card(
        out,
        "Trust loop",
        "Money that moves\nwith proof",
        [
            "1. Send request → get TRANS- reference",
            "2. Pay + upload proof",
            "3. We verify before payout",
            "4. Track status anytime",
        ],
        "Start on WhatsApp →",
    )


def cancel_card(out: Path):
    card(
        out,
        "You’re in control",
        "Change of mind?\nCancel before you pay",
        [
            "Only while pending payment",
            "Optional reason if you want",
            "No scary lock-in before payout",
            "Support with your reference",
        ],
        f"WhatsApp {PHONE}",
    )


def rate_of_day_template(out: Path):
    W, H = 1080, 1080
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 64, 64, 1.0)
    d.text((64, 180), "RATE CARD · EDIT DAILY", fill=hex_rgb(BRAND), font=font(26, bold=True))
    d.text((64, 240), "Today’s corridor", fill=hex_rgb(NAVY), font=font(56, bold=True))
    rounded_rect(d, (64, 360, W - 64, 560), hex_rgb(NAVY), radius=24)
    d.text((W // 2, 430), "🇬🇧 GBP  →  🇬🇭 GHS", fill=hex_rgb(BG), font=font(44, bold=True), anchor="mm")
    d.text((W // 2, 510), "1 GBP = ____ GHS", fill=hex_rgb(SOFT), font=font(40, bold=True), anchor="mm")
    d.text((64, 620), "Fill the blank before posting.", fill=hex_rgb(MUTED), font=font(28))
    d.text((64, 670), "Fees stay visible · Proof verified before payout", fill=hex_rgb(MUTED), font=font(26))
    rounded_rect(d, (64, H - 160, W - 64, H - 72), hex_rgb(BRAND), radius=18)
    d.text((W // 2, H - 116), "Message to lock your quote →", fill=hex_rgb(BG), font=font(30, bold=True), anchor="mm")
    img.save(out, quality=95)


def how_to_pay_card(out: Path):
    card(
        out,
        "How to pay",
        "Pay with your\nreference",
        [
            "Use the exact amount quoted",
            "Put TRANS-… in the payment note",
            "Upload screenshot / PDF proof",
            "We verify before payout",
        ],
        "Need help? WhatsApp with your reference",
    )


def business_card(out: Path):
    # 1050x600 ≈ business card landscape @ print-ish
    W, H = 1050, 600
    img = Image.new("RGB", (W, H), hex_rgb(BG))
    d = ImageDraw.Draw(img)
    rounded_rect(d, (0, 0, W - 1, H - 1), hex_rgb(BG), radius=0, outline=hex_rgb(BORDER), width=2)
    # left brand panel
    d.rectangle((0, 0, 360, H), fill=hex_rgb(NAVY))
    d.rectangle((0, 0, 16, H), fill=hex_rgb(BRAND))
    d.text((40, 80), "CN", fill=hex_rgb(BRAND), font=font(72, bold=True))
    d.text((40, 170), BRAND_NAME, fill=hex_rgb(BG), font=font(40, bold=True))
    d.text((40, 240), "International money\ntransfer for everyone", fill=hex_rgb("#c5cedb"), font=font(24))
    d.text((400, 90), "WhatsApp", fill=hex_rgb(BRAND), font=font(24, bold=True))
    d.text((400, 130), PHONE, fill=hex_rgb(NAVY), font=font(36, bold=True))
    d.text((400, 200), "Also", fill=hex_rgb(MUTED), font=font(22))
    d.text((400, 235), PHONE2, fill=hex_rgb(NAVY), font=font(28, bold=True))
    d.text((400, 300), EMAIL, fill=hex_rgb(MUTED), font=font(24))
    d.text((400, 360), "Mon–Sat · 9:00–18:00 GMT", fill=hex_rgb(MUTED), font=font(22))
    d.text((400, 430), "Clear rates · Verified payout", fill=hex_rgb(NAVY), font=font(24, bold=True))
    d.text((400, 480), "Scan QR or message to send", fill=hex_rgb(MUTED), font=font(22))
    # mini qr
    qr = make_temp_qr(180)
    img.paste(qr, (W - 220, H - 220))
    img.save(out, quality=95)


def make_temp_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=8, border=1)
    qr.add_data(WA_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color=NAVY, back_color=BG).convert("RGB").resize((size, size), Image.Resampling.NEAREST)
    return img


def a6_flyer(out: Path, qr_img: Image.Image):
    # A6-ish 1240x1748 @ ~150dpi
    W, H = 1240, 1748
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 80, 80, 1.3)
    d.text((80, 220), "Send money\nwith proof", fill=hex_rgb(NAVY), font=font(78, bold=True))
    d.text((80, 420), "Clear rates in. Verified payout out.\nCancel anytime before you pay.", fill=hex_rgb(MUTED), font=font(32))
    bullets = [
        "Live quote GBP → GHS",
        "TRANS- reference on every transfer",
        "Upload payment proof",
        "Track status on WhatsApp / web",
        "Human support with your reference",
    ]
    y = 560
    for b in bullets:
        rounded_rect(d, (80, y, W - 80, y + 70), hex_rgb(LIGHT), radius=14)
        d.text((110, y + 35), "●  " + b, fill=hex_rgb(NAVY), font=font(28), anchor="lm")
        y += 86
    qr = qr_img.resize((520, 520), Image.Resampling.NEAREST)
    img.paste(qr, ((W - 520) // 2, H - 720))
    d.text((W // 2, H - 160), PHONE, fill=hex_rgb(NAVY), font=font(36, bold=True), anchor="mm")
    d.text((W // 2, H - 100), "Scan · Chat · Send", fill=hex_rgb(BRAND), font=font(30, bold=True), anchor="mm")
    img.save(out, quality=95)


def profile_avatar(out: Path):
    s = 1080
    img = Image.new("RGB", (s, s), hex_rgb(NAVY))
    d = ImageDraw.Draw(img)
    # brand circle
    d.ellipse((180, 180, 900, 900), fill=hex_rgb(BRAND))
    d.text((s // 2, s // 2 - 20), "CN", fill=hex_rgb(BG), font=font(220, bold=True), anchor="mm")
    d.text((s // 2, 980), BRAND_NAME, fill=hex_rgb(BG), font=font(48, bold=True), anchor="mm")
    img.save(out, quality=95)


def profile_banner(out: Path):
    W, H = 1640, 720  # WhatsApp-ish cover proportion
    img = bg_canvas(W, H)
    d = ImageDraw.Draw(img)
    draw_mark(d, 72, 80, 1.2)
    d.text((72, 220), "Money that moves with proof", fill=hex_rgb(NAVY), font=font(58, bold=True))
    d.text((72, 310), "Clear rates · Verified payout · Cancel before you pay", fill=hex_rgb(MUTED), font=font(30))
    rounded_rect(d, (72, 420, 620, 520), hex_rgb(BRAND), radius=16)
    d.text((346, 470), "WhatsApp " + PHONE, fill=hex_rgb(BG), font=font(28, bold=True), anchor="mm")
    img.save(out, quality=95)


def status_cta_bars():
    """Add thin CTA bars under status stills into status/ready/."""
    src = ROOT / "status"
    out_dir = ROOT / "status" / "ready"
    out_dir.mkdir(exist_ok=True)
    captions = {
        "01-hook.jpg": "Money that moves with proof",
        "02-quote.jpg": "Rates stay visible as you type",
        "03-pay.jpg": "Verified before payout",
        "04-verify.jpg": "Track with your reference",
        "05-cancel.jpg": "Cancel unpaid before you pay",
        "06-cta.jpg": "Message C.N.M.T to send →",
    }
    for name, caption in captions.items():
        path = src / name
        if not path.exists():
            continue
        base = Image.open(path).convert("RGB")
        # fit to 1080x1920 story by letterboxing
        target = Image.new("RGB", (1080, 1920), hex_rgb(NAVY))
        # scale landscape to width
        ratio = 1080 / base.width
        nh = int(base.height * ratio)
        resized = base.resize((1080, nh), Image.Resampling.LANCZOS)
        y0 = (1920 - nh) // 2 - 40
        target.paste(resized, (0, max(80, y0)))
        d = ImageDraw.Draw(target)
        d.rectangle((0, 0, 1080, 100), fill=hex_rgb(NAVY))
        d.text((540, 55), BRAND_NAME, fill=hex_rgb(BG), font=font(36, bold=True), anchor="mm")
        d.rectangle((0, 1720, 1080, 1920), fill=hex_rgb(BRAND))
        d.text((540, 1790), caption, fill=hex_rgb(BG), font=font(34, bold=True), anchor="mm")
        d.text((540, 1855), PHONE, fill=hex_rgb(SOFT), font=font(26), anchor="mm")
        target.save(out_dir / name.replace(".jpg", "-status.jpg"), quality=92)


def main():
    (ROOT / "qr").mkdir(exist_ok=True)
    (ROOT / "cards").mkdir(exist_ok=True)
    (ROOT / "print").mkdir(exist_ok=True)
    (ROOT / "profile").mkdir(exist_ok=True)

    qr_plain = ROOT / "qr" / "whatsapp-qr.png"
    qr_img = make_qr(qr_plain, box_size=14)
    branded_qr_poster(qr_img, ROOT / "qr" / "whatsapp-qr-poster.jpg")
    # printable high-res qr only
    make_qr(ROOT / "qr" / "whatsapp-qr-print.png", box_size=20)

    welcome_card(ROOT / "cards" / "01-welcome.jpg")
    corridor_card(ROOT / "cards" / "02-corridor-gbp-ghs.jpg")
    trust_card(ROOT / "cards" / "03-trust-loop.jpg")
    how_to_pay_card(ROOT / "cards" / "04-how-to-pay.jpg")
    cancel_card(ROOT / "cards" / "05-cancel-control.jpg")
    rate_of_day_template(ROOT / "cards" / "06-rate-of-day-template.jpg")

    business_card(ROOT / "print" / "business-card.jpg")
    a6_flyer(ROOT / "print" / "a6-flyer-counter.jpg", qr_img)

    profile_avatar(ROOT / "profile" / "whatsapp-avatar.jpg")
    profile_banner(ROOT / "profile" / "whatsapp-banner.jpg")

    status_cta_bars()
    print("Assets built under", ROOT)


if __name__ == "__main__":
    main()
