#!/usr/bin/env python3
import os
import sys

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1654, 2339
NAVY = "#21364a"
ACCENT = "#2d7d7a"
MUTED = "#66717d"
PALE = "#f1f4f6"
LINE = "#d5dce1"
FONT_PATH = "/System/Library/AssetsV2/com_apple_MobileAsset_Font7/e617c1b15920c6ee2d047ed8724de08521ce5c9a.asset/AssetData/BIZ_UDMincho-regular.ttf"


def font(size):
    if not os.path.exists(FONT_PATH):
        raise RuntimeError("請求書用の日本語フォントが見つかりません。")
    return ImageFont.truetype(FONT_PATH, size)


def create(output):
    image = Image.new("RGB", (WIDTH, HEIGHT), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, WIDTH, 47), fill=NAVY)
    draw.text((116, 112), "請求書", font=font(72), fill=NAVY)
    draw.rectangle((116, 205, 474, 212), fill=ACCENT)

    draw.text((1170, 112), "請求書番号", font=font(25), fill=MUTED)
    draw.text((1240, 158), "請求日", font=font(25), fill=MUTED)
    draw.text((1240, 204), "支払期限", font=font(25), fill=MUTED)
    draw.text((116, 309), "ご請求先", font=font(25), fill=MUTED)
    draw.text((978, 309), "請求元", font=font(25), fill=MUTED)

    draw.rounded_rectangle((116, 625, 1538, 754), radius=14, fill=PALE)
    draw.text((164, 671), "ご請求金額", font=font(30), fill=MUTED)

    table_left, table_right, table_top = 116, 1538, 834
    draw.rectangle((table_left, table_top, table_right, table_top + 68), fill=NAVY)
    headers = [("内容", 150), ("数量", 1000), ("単位", 1135), ("単価", 1270), ("金額", 1455)]
    for label, x in headers:
        draw.text((x, table_top + 18), label, font=font(25), fill="white")
    row_height = 70
    for index in range(1, 7):
        y = table_top + 68 + row_height * index
        if index % 2 == 0:
            draw.rectangle((table_left, y - row_height, table_right, y), fill="#fafbfc")
        draw.line((table_left, y, table_right, y), fill=LINE, width=3)

    summary_left, summary_right = 952, 1538
    summary_top = table_top + 68 + row_height * 6 + 54
    for index, label in enumerate(("小計", "値引き", "消費税", "合計")):
        y = summary_top + index * 70
        draw.line((summary_left, y, summary_right, y), fill=LINE, width=4)
        draw.text((976, y + 20), label, font=font(26 if label != "合計" else 29), fill=NAVY if label == "合計" else MUTED)

    draw.text((116, 1778), "お振込先", font=font(29), fill=NAVY)
    draw.text((860, 1778), "備考", font=font(29), fill=NAVY)
    image.save(output, "PNG", optimize=True)


if __name__ == "__main__":
    output_path = sys.argv[1]
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    create(output_path)
