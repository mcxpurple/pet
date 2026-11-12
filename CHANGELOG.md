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

## 2026-11-12｜季節微景高度微調（GPT-6）
- 玩家回饋：原本粒子只在腳邊，飄散高度不夠。
- `seasonal-micro-scene.js`：花瓣、落葉、雪花的向上位移從 17–43px 改為 65–110px；夜間螢火蟲從 12–34px 改為 45–85px。
- `index.html`：網頁季節腳本快取參數從 `?v=1` 改為 `?v=2`，確保載入更新後的動畫。
- 保持不變：粒子上限、出現頻率、起始位置、Chrome 下載 ZIP、`version.json`、角色引擎與角色素材。
- 單獨還原本次高度調整：把 `--dy` 的範圍改回舊值，並將網頁季節腳本快取參數更新；也可 Revert 本次兩個程式提交。

## 2026-11-12｜第二批前置：網頁版收藏手帳 UI（GPT-6）

> 此提交**只有選角畫面美術改版**，不是第二批角色功能上線。使用者在定稿時指定：刪除左側紫色格紋紙膠帶，金色活頁扣要從上到下整排；保留上方資料夾與既有互動。

### 更動範圍
- `index.html`（選角區外觀 DOM）：在 `#picker` 增加 `.nb-book` 版面容器、左側九個金色活頁扣、右側分頁／書籤、貓郵戳與頁面底部的向量花枝／貓圖案；選角互動的 JavaScript 完全不變；新增 `notebook-ui.css?v=1` 連結。
- `notebook-ui.css`（新檔）：僅用 `#picker` 範圍的 CSS 覆蓋既有 `vh-ui.css` 樣式；奶油紙張、霧紫封皮、拍立得、方格底、已選色標、全域大小切換、票券式開始散步、390px 手機版排版，以及 focus 可見狀態。
- **沒有修改** `pet-engine.js`、`pet-picker.js`、`vh-ui.css`、`seasonal-micro-scene.js`、`seasonal-micro-scene.css`、`pet-extension.zip`、`version.json`、`install.html`、`roster.yaml`、`files.json`、`pets/`。

### 備份與安全還原
- 本批開始前 main 提交：`5fb8bb7bb180ddb5e116a0dd6c5cd097a1d19dfb`。
- 備份分支：[backup/pre-web-batch2-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-web-batch2-20261112)。
- 開發分支：`feature/web-batch2-notebook-ui`。
- 合併後如要撤銷整個 UI，**只 Revert 本次 UI 的 GitHub PR / 合併提交**，不要 Reset 整個 main（避免遺失之後角色素材及變更）。
- 若手動還原，`index.html` 必須同時移除 `notebook-ui.css` 的引用及 `nb-*` 包裝／裝飾元素；僅移除 CSS 連結不等於完整回復舊版。
- 原樣下載的 Chrome ZIP 保留作為使用者指定的舊版回退基準。

### 交接給 Claude
- 這次僅改網頁美術；擴充功能仍使用舊 UI 的副本，**未重新打包**。
- 所有新 CSS 都在 `notebook-ui.css`，不要直接覆蓋共用的 `vh-ui.css`，除非明天確認要同步擴充功能。
- 未完成的第二批功能：秋季楓葉 SVG 與粒子圖層、偷看滑鼠、歡迎回來、每隻角色各自大小（包含拍立得旁的「⋯」浮層）。
- 其餘預留由 Claude 處理：被捲動嚇到、一鍵隱藏、指定網站不出現、擴充功能同步與 ZIP 重打包。
- **特別注意**：個別大小的「⋯」按鈕本次沒有做成空殼，之後應與功能一起上線；浮層由拍立得旁向下展開。
- 視覺效能：沒有持續性裝飾動畫；所有花枝／貓剪影用內嵌 SVG，沒有外部新素材。
- 驗收：靜態程式碼與 DOM 結構已比對；真實瀏覽器的手機尺寸與視覺需在網頁部署後人工確認。


## 2026-11-12｜網頁版手帳 UI 精簡（依玩家實際網頁截圖標 X）

### 修改範圍
- `index.html`：移除 `.nb-rings` 活頁扣、重複的 `.fd-tabs`「選擇角色」頁籤、`.nb-postmark` 郵戳、`.nb-flower` 花枝、`.nb-cat` 貓剪影；`notebook-ui.css` 快取參數升至 `?v=2`。
- `notebook-ui.css`：刪除上述裝飾樣式和選角方格右下角的 `.scard > .in::after` 花形、開始散步票券左邊的 `.tk::before` 裝飾；移除原本為左側扣環預留的非對稱內距，桌面改 `38px 25px 27px 25px`、手機改 `32px 16px 20px 16px`；保持右側紫色書籤／標籤、紙張紋理、拍立得與票券式按鈕。
- `CHANGELOG.md`：本交接與單獨還原指引。

### 說明
- **這次只做視覺刪減**；`pet-engine.js`、`pet-picker.js`、`vh-ui.css` 與網頁操作流程不變；第二批互動功能尚未加入。
- 保護 `pet-extension.zip`、`version.json`、`install.html`、`roster.yaml`、`files.json`、`pets/`。
- 修改前 main：`605a889192f3013b7163a3ea3e95aae75f8999ff`。
- 備份：[backup/pre-remove-notebook-rings-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-remove-notebook-rings-20261112)。
- 本次 PR 合併後，如需回復此 UI 精簡，可單獨 Revert 本次 PR；不要 Reset main，避免覆蓋後續修改。
- 此次依據是真實網站的玩家截圖修正；**不以 AI 生圖充當 HTML/CSS 渲染驗收**。
