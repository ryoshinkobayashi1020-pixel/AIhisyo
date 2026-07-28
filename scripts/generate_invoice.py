#!/usr/bin/env python3
import json
import os
import sys
import unicodedata
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


def register_font():
    candidates = [
        ("/System/Library/AssetsV2/com_apple_MobileAsset_Font7/e617c1b15920c6ee2d047ed8724de08521ce5c9a.asset/AssetData/BIZ_UDMincho-regular.ttf", 0),
        ("/System/Library/AssetsV2/com_apple_MobileAsset_Font7/54ef167d6c8e99a69a0d41ce252cc5995ba47580.asset/AssetData/YuGothic-Medium.otf", 0),
        ("/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc", 0),
        ("/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", 0),
        ("/System/Library/Fonts/Supplemental/AppleGothic.ttf", 0),
    ]
    for font_path, index in candidates:
        if not os.path.exists(font_path):
            continue
        try:
            pdfmetrics.registerFont(TTFont("InvoiceJP", font_path, subfontIndex=index))
            font = pdfmetrics.getFont("InvoiceJP")
            return "InvoiceJP", set(font.face.charToGlyph)
        except Exception:
            continue
    raise RuntimeError("請求書用の日本語フォントを読み込めませんでした。")


FONT, FONT_GLYPHS = register_font()
PAGE_W, PAGE_H = A4


def clean_text(value):
    normalized = unicodedata.normalize("NFC", str(value or ""))
    return "".join(char for char in normalized if not 0xFE00 <= ord(char) <= 0xFE0F)


def iter_text_values(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from iter_text_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from iter_text_values(child)
    elif isinstance(value, str):
        yield value


def validate_payload_text(payload):
    unsupported = []
    for value in iter_text_values(payload):
        for char in clean_text(value):
            if char in "\n\r\t" or ord(char) < 32:
                continue
            if ord(char) not in FONT_GLYPHS and char not in unsupported:
                unsupported.append(char)
    if unsupported:
        display = " ".join(f"「{char}」(U+{ord(char):04X})" for char in unsupported[:8])
        raise ValueError(f"請求書用フォントで表示できない文字が含まれています：{display}")


def money(value):
    return f"¥{int(Decimal(str(value or 0))):,}"


def text(c, x, y, value, size=9, color=colors.HexColor("#27313d"), align="left", bold=False):
    c.setFillColor(color)
    c.setFont(FONT, size)
    value = clean_text(value)
    if align == "right":
        c.drawRightString(x, y, value)
    elif align == "center":
        c.drawCentredString(x, y, value)
    else:
        c.drawString(x, y, value)


def wrap(value, limit):
    value = clean_text(value)
    lines, current = [], ""
    for char in value:
        width = 2 if ord(char) > 255 else 1
        current_width = sum(2 if ord(c) > 255 else 1 for c in current)
        if current and current_width + width > limit:
            lines.append(current)
            current = char
        else:
            current += char
    if current:
        lines.append(current)
    return lines or [""]


def generate(payload, output_path):
    validate_payload_text(payload)
    c = canvas.Canvas(output_path, pagesize=A4, pageCompression=1)
    c.setTitle(f"請求書 {payload.get('invoiceNumber', '')}")
    margin = 42
    navy = colors.HexColor("#21364a")
    accent = colors.HexColor("#2d7d7a")
    muted = colors.HexColor("#66717d")
    pale = colors.HexColor("#f1f4f6")
    line = colors.HexColor("#d5dce1")

    c.setFillColor(navy)
    c.rect(0, PAGE_H - 17, PAGE_W, 17, stroke=0, fill=1)
    text(c, margin, PAGE_H - 65, payload.get("title", "請求書"), 24, navy)
    c.setStrokeColor(accent)
    c.setLineWidth(2.4)
    c.line(margin, PAGE_H - 75, 170, PAGE_H - 75)

    info_x = PAGE_W - margin
    text(c, info_x, PAGE_H - 49, f"請求書番号  {payload.get('invoiceNumber', '')}", 8.5, muted, "right")
    text(c, info_x, PAGE_H - 64, f"請求日      {payload.get('invoiceDate', '')}", 8.5, muted, "right")
    text(c, info_x, PAGE_H - 79, f"支払期限    {payload.get('dueDate', '')}", 8.5, muted, "right")

    client = payload.get("client", {})
    issuer = payload.get("issuer", {})
    y = PAGE_H - 118
    text(c, margin, y, "ご請求先", 8, muted)
    y -= 23
    company = client.get("companyName", "")
    contact = client.get("contactName", "")
    department = client.get("department", "")
    client_type = client.get("clientType", "company")
    if client_type == "individual":
        text(c, margin, y, f"{company} 様", 13, navy)
    elif contact:
        text(c, margin, y, company, 13, navy)
        y -= 19
        text(c, margin, y, f"{department + ' ' if department else ''}{contact} 様", 10.5, navy)
    else:
        text(c, margin, y, f"{company} 御中", 13, navy)
    y -= 20
    if client.get("postalCode"):
        text(c, margin, y, f"〒{client.get('postalCode')}", 8.5, muted)
        y -= 14
    for address_line in wrap(f"{client.get('address', '')}{client.get('building', '')}", 46)[:2]:
        text(c, margin, y, address_line, 8.5, muted)
        y -= 14

    issuer_x = 352
    issuer_y = PAGE_H - 118
    text(c, issuer_x, issuer_y, "請求元", 8, muted)
    issuer_y -= 23
    text(c, issuer_x, issuer_y, issuer.get("companyName", ""), 11.5, navy)
    issuer_y -= 17
    if issuer.get("postalCode"):
        text(c, issuer_x, issuer_y, f"〒{issuer.get('postalCode')}", 8.3, muted)
        issuer_y -= 14
    for issuer_line in wrap(issuer.get("address", ""), 32)[:2]:
        text(c, issuer_x, issuer_y, issuer_line, 8.3, muted)
        issuer_y -= 14
    text(c, issuer_x, issuer_y, f"{issuer.get('representativeTitle', '')} {issuer.get('representativeName', '')}".strip(), 8.3, muted)
    issuer_y -= 14
    if issuer.get("registrationNumber"):
        text(c, issuer_x, issuer_y, f"登録番号：{issuer.get('registrationNumber')}", 8.3, muted)

    total = payload.get("total", 0)
    amount_y = PAGE_H - 250
    c.setFillColor(pale)
    c.roundRect(margin, amount_y - 21, PAGE_W - margin * 2, 46, 5, stroke=0, fill=1)
    text(c, margin + 16, amount_y - 1, "ご請求金額", 10, muted)
    text(c, PAGE_W - margin - 16, amount_y - 4, f"{money(total)}（税込）", 19, navy, "right")

    table_top = amount_y - 50
    table_x = margin
    table_w = PAGE_W - margin * 2
    col_content = table_x + 12
    col_qty = table_x + table_w - 188
    col_unit = table_x + table_w - 136
    col_price = table_x + table_w - 80
    col_amount = table_x + table_w - 10
    c.setFillColor(navy)
    c.rect(table_x, table_top - 24, table_w, 24, stroke=0, fill=1)
    text(c, col_content, table_top - 16, "内容", 8.5, colors.white)
    text(c, col_qty, table_top - 16, "数量", 8.5, colors.white, "right")
    text(c, col_unit, table_top - 16, "単位", 8.5, colors.white, "right")
    text(c, col_price, table_top - 16, "単価", 8.5, colors.white, "right")
    text(c, col_amount, table_top - 16, "金額", 8.5, colors.white, "right")

    row_y = table_top - 24
    items = payload.get("items", [])[:8]
    for index, item in enumerate(items):
        height = 35
        if index % 2 == 1:
            c.setFillColor(colors.HexColor("#fafbfc"))
            c.rect(table_x, row_y - height, table_w, height, stroke=0, fill=1)
        c.setStrokeColor(line)
        c.line(table_x, row_y - height, table_x + table_w, row_y - height)
        content_lines = wrap(item.get("description", ""), 39)[:2]
        text(c, col_content, row_y - 14, content_lines[0], 8.6, navy)
        if len(content_lines) > 1:
            text(c, col_content, row_y - 27, content_lines[1], 7.8, muted)
        text(c, col_qty, row_y - 20, item.get("quantity", 1), 8.5, navy, "right")
        text(c, col_unit, row_y - 20, item.get("unit", "式"), 8.5, navy, "right")
        text(c, col_price, row_y - 20, money(item.get("unitPrice", 0)), 8.5, navy, "right")
        text(c, col_amount, row_y - 20, money(item.get("amount", 0)), 8.5, navy, "right")
        row_y -= height

    summary_x = PAGE_W - margin - 210
    summary_y = row_y - 18
    labels = [
        ("小計", payload.get("subtotal", 0)),
        ("値引き", payload.get("discount", 0) * -1 if payload.get("discount", 0) else 0),
        ("消費税", payload.get("tax", 0)),
        ("合計", payload.get("total", 0)),
    ]
    for idx, (label, value) in enumerate(labels):
        if label == "値引き" and not payload.get("discount", 0):
            continue
        c.setStrokeColor(line)
        c.line(summary_x, summary_y - 5, PAGE_W - margin, summary_y - 5)
        text(c, summary_x + 8, summary_y - 20, label, 8.8, muted if label != "合計" else navy)
        text(c, PAGE_W - margin - 4, summary_y - 20, money(value), 9.2 if label != "合計" else 12, navy, "right")
        summary_y -= 28

    footer_y = 128
    bank = payload.get("bank", {})
    text(c, margin, footer_y + 65, "お振込先", 9, navy)
    text(c, margin, footer_y + 45, f"{bank.get('bankName', '')} {bank.get('branchName', '')}", 8.7, navy)
    text(c, margin, footer_y + 30, f"{bank.get('accountType', '')} {bank.get('accountNumber', '')}", 8.7, navy)
    text(c, margin, footer_y + 15, f"口座名義：{bank.get('accountName', '')}", 8.7, navy)

    note_x = 310
    text(c, note_x, footer_y + 65, "備考", 9, navy)
    note_lines = wrap(payload.get("note", ""), 39)[:3]
    for idx, note_line in enumerate(note_lines):
        text(c, note_x, footer_y + 45 - idx * 14, note_line, 7.8, muted)

    fee_lines = wrap(payload.get("feeNote", ""), 82)[:2]
    for idx, fee_line in enumerate(fee_lines):
        text(c, margin, 58 - idx * 12, fee_line, 7.2, muted)
    text(c, PAGE_W - margin, 30, "合同会社良心", 7.2, muted, "right")

    c.showPage()
    c.save()


if __name__ == "__main__":
    payload = json.load(sys.stdin)
    output = sys.argv[1]
    os.makedirs(os.path.dirname(output), exist_ok=True)
    generate(payload, output)
