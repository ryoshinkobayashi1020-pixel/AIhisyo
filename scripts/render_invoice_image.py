#!/usr/bin/env python3
import json
import os
import sys
import unicodedata

from PIL import Image, ImageDraw, ImageFont

NAVY = "#21364a"
MUTED = "#66717d"
FONT_PATH = "/System/Library/AssetsV2/com_apple_MobileAsset_Font7/e617c1b15920c6ee2d047ed8724de08521ce5c9a.asset/AssetData/BIZ_UDMincho-regular.ttf"


def font(size):
    if not os.path.exists(FONT_PATH):
        raise RuntimeError("請求書用の日本語フォントが見つかりません。")
    return ImageFont.truetype(FONT_PATH, size)


def clean(value):
    return unicodedata.normalize("NFC", str(value or "")).replace("\ufe0f", "")


def money(value):
    return f"¥{int(float(value or 0)):,}"


def fit_text(draw, value, max_width, initial_size, minimum=18):
    value = clean(value)
    size = initial_size
    while size > minimum and draw.textbbox((0, 0), value, font=font(size))[2] > max_width:
        size -= 1
    return font(size)


def wrap(draw, value, max_width, text_font, max_lines=2):
    lines, current = [], ""
    for char in clean(value):
        trial = current + char
        if current and draw.textbbox((0, 0), trial, font=text_font)[2] > max_width:
            lines.append(current)
            current = char
            if len(lines) >= max_lines:
                break
        else:
            current = trial
    if current and len(lines) < max_lines:
        lines.append(current)
    return lines


def right(draw, x, y, value, text_font, fill=NAVY):
    draw.text((x, y), clean(value), font=text_font, fill=fill, anchor="ra")


def render(payload, template_path, output_path):
    image = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(image)
    client = payload.get("client", {})
    issuer = payload.get("issuer", {})
    bank = payload.get("bank", {})

    right(draw, 1538, 112, payload.get("invoiceNumber", ""), font(27), MUTED)
    right(draw, 1538, 158, payload.get("invoiceDate", ""), font(27), MUTED)
    right(draw, 1538, 204, payload.get("dueDate", ""), font(27), MUTED)

    name = clean(client.get("companyName", ""))
    client_type = client.get("clientType", "company")
    contact = clean(client.get("contactName", ""))
    department = clean(client.get("department", ""))
    y = 360
    if client_type == "individual":
        draw.text((116, y), f"{name} 様", font=fit_text(draw, f"{name} 様", 700, 39), fill=NAVY)
        y += 58
    elif contact:
        draw.text((116, y), name, font=fit_text(draw, name, 700, 39), fill=NAVY)
        y += 55
        draw.text((116, y), f"{department + ' ' if department else ''}{contact} 様", font=font(30), fill=NAVY)
        y += 50
    else:
        draw.text((116, y), f"{name} 御中", font=fit_text(draw, f"{name} 御中", 700, 39), fill=NAVY)
        y += 58
    if client.get("postalCode"):
        draw.text((116, y), f"〒{clean(client.get('postalCode'))}", font=font(25), fill=MUTED)
        y += 39
    address_font = font(25)
    for line in wrap(draw, f"{client.get('address', '')}{client.get('building', '')}", 700, address_font):
        draw.text((116, y), line, font=address_font, fill=MUTED)
        y += 39

    iy = 360
    draw.text((978, iy), clean(issuer.get("companyName", "")), font=fit_text(draw, issuer.get("companyName", ""), 560, 35), fill=NAVY)
    iy += 50
    if issuer.get("postalCode"):
        draw.text((978, iy), f"〒{clean(issuer.get('postalCode'))}", font=font(24), fill=MUTED)
        iy += 38
    for line in wrap(draw, issuer.get("address", ""), 560, font(24)):
        draw.text((978, iy), line, font=font(24), fill=MUTED)
        iy += 36
    representative = f"{issuer.get('representativeTitle', '')} {issuer.get('representativeName', '')}".strip()
    draw.text((978, iy), representative, font=font(24), fill=MUTED)
    if issuer.get("registrationNumber"):
        draw.text((978, iy + 36), f"登録番号：{issuer.get('registrationNumber')}", font=font(22), fill=MUTED)

    right(draw, 1462, 651, f"{money(payload.get('total'))}（税込）", font(52), NAVY)

    row_y = 924
    for item in payload.get("items", [])[:6]:
        description_font = fit_text(draw, item.get("description", ""), 760, 27, 19)
        draw.text((150, row_y), clean(item.get("description", "")), font=description_font, fill=NAVY)
        right(draw, 1040, row_y, item.get("quantity", 1), font(25))
        right(draw, 1174, row_y, item.get("unit", "式"), font(25))
        right(draw, 1372, row_y, money(item.get("unitPrice", 0)), font(25))
        right(draw, 1510, row_y, money(item.get("amount", 0)), font(25))
        row_y += 70

    summary_top = 1376
    values = [
        payload.get("subtotal", 0),
        -float(payload.get("discount", 0) or 0),
        payload.get("tax", 0),
        payload.get("total", 0),
    ]
    for index, value in enumerate(values):
        right(draw, 1510, summary_top + 20 + index * 70, money(value), font(28 if index < 3 else 34))

    draw.text((116, 1830), f"{clean(bank.get('bankName'))} {clean(bank.get('branchName'))}", font=font(27), fill=NAVY)
    draw.text((116, 1872), f"{clean(bank.get('accountType'))} {clean(bank.get('accountNumber'))}", font=font(27), fill=NAVY)
    draw.text((116, 1914), f"口座名義：{clean(bank.get('accountName'))}", font=font(27), fill=NAVY)

    note_y = 1830
    for line in wrap(draw, payload.get("note", ""), 660, font(23), 4):
        draw.text((860, note_y), line, font=font(23), fill=MUTED)
        note_y += 37
    fee_y = 2165
    for line in wrap(draw, payload.get("feeNote", ""), 1400, font(21), 2):
        draw.text((116, fee_y), line, font=font(21), fill=MUTED)
        fee_y += 32
    right(draw, 1538, 2245, issuer.get("companyName", ""), font(22), MUTED)
    image.save(output_path, "PNG", optimize=True)


if __name__ == "__main__":
    payload = json.load(sys.stdin)
    template = sys.argv[1]
    output = sys.argv[2]
    os.makedirs(os.path.dirname(output), exist_ok=True)
    render(payload, template, output)
