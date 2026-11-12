# 修改歷程｜Seasonal Micro-scene（網頁版季節微景）

日期：2026-11-12  
修改者：GPT-6  
範圍：僅網頁版，**沒有發布 Chrome 擴充功能新版**。

## 原版保護與還原點
- 修改前 main：`737dd9f56bb55ecc1602e05afe089385f86129e3`
- 原版備份分支：[`backup/pre-seasonal-web-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-web-20261112)
- 開發分支：`feature/web-seasonal-micro-scene`
- 下載 ZIP `pet-extension.zip`：**未修改**。
- `version.json`、Chrome 擴充功能檔案、`pet-engine.js`、`pet-picker.js`、角色名冊和圖片：**未修改**。

## 修改前後
| 項目 | 修改前 | 修改後 |
| --- | --- | --- |
| 網頁版季節環境 | 無 | 角色腳邊少量粒子向四周微飄、淡出 |
| 粒子來源 | 無 | 角色底部附近；不從視窗上方落下 |
| 季節 | 無 | 1–2 月梅花；3–4 月櫻花；5 月油桐花；6–8 月夜間螢火蟲；9–11 月楓葉／銀杏；12 月雪 |
| 影響範圍 | 無 | 僅 `index.html` 網頁版 |
| Chrome ZIP | 舊版 | 完全不變 |

## 具體修改檔案
1. `index.html`：只增加 `seasonal-micro-scene.css?v=1` 與 `seasonal-micro-scene.js?v=1` 的引用，附交接註解。
2. `seasonal-micro-scene.css`：新增花瓣／落葉／雪／螢火蟲的微幅移動淡出動畫；`pointer-events:none`；遵守減少動態效果。
3. `seasonal-micro-scene.js`：依本機月份與時段決定季節；使用 `#stage` 裡的 `.qpet` 元素位置作為起點；僅靠近畫面底部 125px 時產生，最多同時六個粒子；背景頁面清除、選角時停止。
4. `CHANGELOG.md`：本交接與還原說明。

## 還原方式（非工程使用者）
若不喜歡季節微景，**只需在 GitHub 的 `index.html` 移除以下兩行引用**，其餘不動，網頁版便不會載入季節特效：

```html
<link rel="stylesheet" href="seasonal-micro-scene.css?v=1">
<script defer src="seasonal-micro-scene.js?v=1"></script>
```

較正式的還原方式：在 GitHub 找到此次合併的 PR，使用 Revert 建立反向提交。**不要整個 main 重設回舊提交**，以免刪掉日後新增的角色素材。保留新增的 CSS/JS 檔也不會再執行，因為入口已移除。

## 交接給 Claude
- 此功能與角色引擎解耦，請不要把季節特效塞回 `pet-engine.js`。
- 玩家下載的 ZIP 是刻意保留的舊版，不要因為網頁版更新而重新打包 ZIP、改擴充功能版本號或更新提示。
- 其他六項候選功能（偷看滑鼠、歡迎回來、被捲動嚇到、一鍵隱藏、指定網站不出現、每隻角色各自調大小）本次完全沒有處理。
- 這份記錄描述程式設計與改動；實際跨瀏覽器視覺效果仍須在網頁版驗收。
