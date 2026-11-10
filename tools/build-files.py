"""產生 files.json：列出 pets/ 底下每個角色實際擁有的圖片，供網頁版與擴充功能讀取。
新增或刪除角色圖片後，在 repo 根目錄執行：python tools/build-files.py"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pets = os.path.join(ROOT, 'pets')
out = {}
for cid in sorted(os.listdir(pets)):
    d = os.path.join(pets, cid)
    if os.path.isdir(d):
        out[cid] = sorted(f for f in os.listdir(d) if f.endswith('.png'))

roster = open(os.path.join(ROOT, 'roster.yaml'), encoding='utf-8').read()
ids = re.findall(r'^- id:\s*(\S+)', roster, re.M)
for i in ids:
    if i not in out:
        print(f'警告：名冊有 {i}，但 pets/ 底下沒有這個資料夾', file=sys.stderr)
    elif 'idle.png' not in out[i]:
        print(f'警告：{i} 缺少 idle.png，不會出現在選角畫面', file=sys.stderr)

with open(os.path.join(ROOT, 'files.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
    f.write('\n')
print(f'files.json 已更新：{len(out)} 位角色，{sum(map(len, out.values()))} 張圖')
