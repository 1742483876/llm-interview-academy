# -*- coding: utf-8 -*-
"""生成 PWA 图标：渐变背景 + 神经网络节点。纯 PIL 绘制，不依赖外部字体。"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(OUT, exist_ok=True)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def bg(size, c1, c2, radius_ratio=0.22):
    """圆角渐变背景，对角线方向。"""
    img = Image.new("RGB", (size, size), c1)
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2.0 * size)
            px[x, y] = lerp(c1, c2, t)
    # 圆角遮罩
    r = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def neural(img, size, stroke, node, glow):
    """在图上绘制居中的神经网络：三层节点 + 连线。"""
    S = 1024.0  # 逻辑坐标
    sc = size / S
    d = ImageDraw.Draw(img, "RGBA")
    # 三层节点（逻辑坐标）
    layers = [
        [(250, 400), (250, 512), (250, 624)],
        [(512, 340), (512, 512), (512, 684)],
        [(774, 400), (774, 512), (774, 624)],
    ]
    # 连线
    for a in layers[0]:
        for b in layers[1]:
            d.line([(a[0] * sc, a[1] * sc), (b[0] * sc, b[1] * sc)], fill=stroke, width=max(2, int(7 * sc)))
    for a in layers[1]:
        for b in layers[2]:
            d.line([(a[0] * sc, a[1] * sc), (b[0] * sc, b[1] * sc)], fill=stroke, width=max(2, int(7 * sc)))
    # 节点光晕
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer, "RGBA")
    for li, layer in enumerate(layers):
        for (x, y) in layer:
            r = (34 if li == 1 else 27) * sc
            gd.ellipse([(x * sc - r, y * sc - r), (x * sc + r, y * sc + r)], fill=glow)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=14 * sc))
    img.alpha_composite(glow_layer)
    d = ImageDraw.Draw(img, "RGBA")
    # 节点实心
    for li, layer in enumerate(layers):
        for (x, y) in layer:
            r = (30 if li == 1 else 24) * sc
            d.ellipse([(x * sc - r, y * sc - r), (x * sc + r, y * sc + r)], fill=node)
            rr = (12 if li == 1 else 9) * sc
            d.ellipse([(x * sc - rr, y * sc - rr), (x * sc + rr, y * sc + rr)], fill=glow)


def make(size, name, radius_ratio=0.22, square=False):
    c1 = (99, 102, 241)   # indigo
    c2 = (14, 165, 233)   # sky
    if square:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        base = bg(size, c1, c2, radius_ratio=0.0)
        img.alpha_composite(base)
    else:
        img = bg(size, c1, c2, radius_ratio=radius_ratio)
    neural(img, size, stroke=(255, 255, 255, 105), node=(255, 255, 255, 245), glow=(255, 255, 255, 150))
    img.save(os.path.join(OUT, name))
    print("wrote", name, size)


make(192, "icon-192.png")
make(512, "icon-512.png")
make(512, "icon-maskable-512.png", radius_ratio=0.0, square=True)
make(180, "apple-touch-icon.png")
print("done")
