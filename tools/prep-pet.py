"""把去背完成的角色圖整理成桌寵規格：畫布 450×600、腳底基準線距底部 3px、頭部大小以 idle 為準。

用法（在 repo 根目錄）：
  python tools/prep-pet.py <來源資料夾> <角色代號> [動作=倍率 ...]

  來源資料夾：放該角色全部去背 PNG 的資料夾，檔名即狀態名稱（idle.png、walk.png、sit_1.png…）
  角色代號：輸出到 pets/<角色代號>/
  動作=倍率：選用。某張圖的頭比 idle 大或小時手動補正，例：sleep=0.9 puppy=0.9

規則：
  - idle 縮放到高度 590px（頂端 7px、腳底 597px），其餘圖片沿用同一比例，頭部大小自然一致。
  - 圖片超出畫布時再額外縮小，並印出提醒。
  - 水平位置以頭部中心置中，避免道具把角色推歪。
  - walk.png 為 4 格拼圖：自動切成 walk_1～walk_4，4 格共用同一比例縮放至與 idle 同高。
  - 處理完請執行 python tools/build-files.py 更新 files.json。
需要：pip install pillow numpy scipy
"""
import os, sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage

W, H, BASE, TOP = 450, 600, 597, 7


def clean(im):
    """移除去背後殘留的小雜點"""
    arr = np.array(im)
    m = arr[..., 3] > 24
    lab, n = ndimage.label(m)
    if n > 1:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        keep = sizes >= max(400, sizes.max() * 0.002)
        arr[..., 3] = np.where(keep[lab - 1] & m, arr[..., 3], 0)
    return Image.fromarray(arr)


def bbox(im):
    a = np.array(im.getchannel('A')) > 24
    ys, xs = np.where(a)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def head_cx(im, bb):
    a = np.array(im.getchannel('A')) > 24
    x0, y0, x1, y1 = bb
    xs = np.where(a[y0:y0 + int((y1 - y0) * 0.18), x0:x1])[1]
    return x0 + (xs.min() + xs.max()) / 2 if len(xs) else (x0 + x1) / 2


def place(im, scale, name, notes):
    bb = bbox(im); x0, y0, x1, y1 = bb
    cx = head_cx(im, bb)
    w, h = (x1 - x0) * scale, (y1 - y0) * scale
    s = scale
    if h > BASE - 1 or w > W - 4:
        f = min((BASE - 1) / h, (W - 4) / w); s = scale * f
        notes.append(f'{name}：超出畫布，額外縮小 {f:.3f}')
    nw, nh = max(1, round((x1 - x0) * s)), max(1, round((y1 - y0) * s))
    crop = im.crop(bb).resize((nw, nh), Image.LANCZOS)
    left = min(max(round(W / 2 - (cx - x0) * s), 2), W - 2 - nw)
    can = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    can.alpha_composite(crop, (left, BASE - nh))
    return can


def split_walk(im):
    col = (np.array(im.getchannel('A')) > 24).any(0)
    runs, start = [], None
    for x, v in enumerate(col):
        if v and start is None: start = x
        if not v and start is not None: runs.append((start, x)); start = None
    if start is not None: runs.append((start, len(col)))
    runs = [r for r in runs if r[1] - r[0] > 30]
    while len(runs) > 4:   # 同一格內被切開的部分合併回去
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = int(np.argmin(gaps)); runs[i] = (runs[i][0], runs[i + 1][1]); del runs[i + 1]
    return [im.crop((a, 0, b, im.height)) for a, b in runs]


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    src, cid = sys.argv[1], sys.argv[2]
    fix = dict((k, float(v)) for k, v in (a.split('=') for a in sys.argv[3:]))
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, 'pets', cid); os.makedirs(out, exist_ok=True)
    idle = clean(Image.open(os.path.join(src, 'idle.png')).convert('RGBA'))
    b = bbox(idle); scale = (BASE - TOP) / (b[3] - b[1])
    notes = []
    for p in sorted(glob.glob(os.path.join(src, '*.png'))):
        name = os.path.basename(p)[:-4]
        im = clean(Image.open(p).convert('RGBA'))
        if name == 'walk':
            frames = [clean(f) for f in split_walk(im)]
            if len(frames) != 4: notes.append(f'walk：切出 {len(frames)} 格，請檢查拼圖')
            ws = (BASE - TOP) / max(bbox(f)[3] - bbox(f)[1] for f in frames)
            for i, f in enumerate(frames, 1):
                place(f, ws, f'walk_{i}', notes).save(os.path.join(out, f'walk_{i}.png'), optimize=True)
        else:
            place(im, scale * fix.get(name, 1), name, notes).save(os.path.join(out, name + '.png'), optimize=True)
    print(f'{cid}：完成，輸出到 pets/{cid}/')
    for n in notes: print('  ' + n)


if __name__ == '__main__':
    main()
