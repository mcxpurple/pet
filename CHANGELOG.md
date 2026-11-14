## 2026-11-14｜事件專屬圖與 clumsy 欄位（僅網頁版）

- `pet-engine.js`：生活事件改為「有專屬圖就用圖，沒有就照舊由程式做動作」。檔名：`trip` 跌倒、`fall` 被丟出去、`dizzy` 搖到暈、`groggy` 爬起迷糊、`startle` 嚇一跳、`peek` 邊邊探頭、`munch` 吃飯提醒、`gawk` 圍觀（玩家拖起任何一隻角色時，其他角色轉頭看、走過去圍觀）。使用專屬圖時不再傾斜或搖晃 idle。
- 名冊新增選用欄位 `clumsy: 高`：小跑跌倒機率 ×3，走路也會偶爾絆倒。
- 事件圖不必寫進名冊，放進 `pets/{角色代號}/` 後重新產生 files.json 即可。
- `index.html`：`pet-engine.js?v=1.0` → `?v=1.1`。
- 未修改 Chrome ZIP 與 version.json；擴充功能另行同步。
- 現有角色都沒有事件圖，行為與先前相同。

---

## 2026-11-14｜新增角色：向羿澧、楚旭延、卓慎璁（暗湧暖域）

- `pets/xiangyili/`：向羿澧 24 張（核心狀態、走路 4 格、擴充 sit／think／phone／watch／appraise／drink／eat／stretch／yawn／heart／wave，含 appraise_1、drink_1、eat_1 變體）。
- `pets/chuxuyan/`：楚旭延 25 張（擴充 camera／sunflower／award／read／drink／eat／feed／sit／disguise／think／phone／stretch／yawn／heart／wave）。
- `pets/zhuoshencong/`：卓慎璁 26 張（擴充 sit／think／read／drink／eat／collect／note／secret／tipsy／phone／stretch／yawn／heart／wave，含 sit_1、eat_1 變體）。
- `roster.yaml`：三人加入「暗湧暖域」分組，排在佟淮蘅之後；附生日與點擊 emoji。
- `files.json`：重新產生。
- 未修改引擎、介面、Chrome ZIP 與版本號；擴充功能讀取線上名冊與圖片，玩家不需重裝。

---

## 2026-11-12｜頁首「選擇角色」灰紫膠囊與「陪伴桌寵」標題（僅網頁）

依玩家從實際 CSS 原型選定的款式，將網頁散步模式頂部原本的「換角色」紙膠帶按鈕，換成灰紫色圓角膠囊「🐾 選擇角色」，維持原本點擊後開啟選角畫面的功能。這是**真實 CSS 樣式，不是以示意圖或背景圖片代替互動按鈕**。

- `index.html`：頁首小字 `Q版桌寵` → `陪伴桌寵`；瀏覽器頁籤標題同步改為 `陪伴桌寵`。僅將 `#switch` 的字樣與類別改成 `pet-switch-pill`，子元素為 🐾 emoji 及「選擇角色」，保留原 `id="switch"`、`hidden` 和點擊事件 `$('switch').onclick = openPicker`。移除只為舊紙膠帶使用的 header 定位覆寫。
- `notebook-ui.css`：以網頁限定 `.vh header .pet-switch-pill` 加入已選定的灰紫漸層、奶白字、圓角、淺色外框、立體陰影及小尺寸 paw emoji；保留 focus／active 操作，窄螢幕略縮減內距。
- `index.html` 快取只將 `notebook-ui.css?v=5` 提升至 `?v=6`。
- **明確不修改「開始散步」**：`#go.tk` 的 HTML、文字 `開始散步 / let's walk`、圖案 🐾、CSS、尺寸和動畫皆保持原樣。也不修改選角功能、大小選單、角色引擎、四季微景、素材、Chrome ZIP 或版本號。
- 施工前備份：[`backup/pre-select-character-pill-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-select-character-pill-20261112)，基準 `main` SHA `df6b9e2e17e0ba170cc0a4874a7e731fac8d884f`。還原時 Revert 本次 PR 即可；勿 Reset 整個 main。
- GitHub 靜態檢查／差異比對後上線；真實頁面顯示與窄螢幕仍須用瀏覽器確認。

---

## 2026-11-12｜個別大小狀態顯示於拍立得膠囊（僅網頁版）

依玩家需求，已選角色拍立得右下角原本固定的「⋯」現在會顯示個別大小設定：
- **標準（1 倍）**：仍顯示「⋯」。
- **小（0.85 倍）**：改顯示「小」。
- **大（1.15 倍）**：改顯示「大」。
- 在大小選單選取後會立即更新文字；關閉／重新開啟選角畫面、切換作品、已儲存倍率再次讀取時也顯示正確。按鈕 title／無障礙名稱附帶目前大小。
- `pet-picker.js`：只更動原本 opt-in `scaleControls: true` 的已選拍立得按鈕文字；大小選單的選項與倍率公式維持不變，未啟用 opt-in 的舊版 Picker 走原邏輯。
- `notebook-ui.css`：保留原膠囊大小、顏色、框線與位置，只對帶 `data-scale` 的「小／大」按鈕調整字級與置中。
- `index.html`：僅提高網頁快取參數 `pet-picker.js?v=0.10` → `?v=0.11`、`notebook-ui.css?v=4` → `?v=5`。
- 沒有更新 `pet-engine.js`、`pet-extension.zip`、`version.json`、`pets/` 或季節微景程式；Chrome 擴充功能日後另行同步，不於本次重新打包 ZIP。
- 備份分支：[backup/pre-size-indicator-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-size-indicator-20261112)，起點 main `81e6c49bcb152b40b3caed896f93ce5422887166`。若需復原，只 Revert 本次 PR，勿 Reset 整個 main。
- JS 語法與模擬 DOM 狀態測試由本次任務確認；真實瀏覽器視覺仍需實機驗收。

---

## 2026-11-12｜季節粒子「飛行路徑轉向＋圖片本體獨立旋轉」（僅網頁版）

玩家回饋前一版僅看起來像整顆粒子沿直線轉角，要求「圖片本身可旋轉、路徑也可旋轉」。本版明確拆成兩層獨立動畫，飛出畫面前均持續動作。

- `seasonal-micro-scene.js`：對**所有會飄升的 PNG**（完整花朵、單片花瓣、楓葉、銀杏、台灣欒樹花及蒴果、芒草穗與飛絮、雪晶及碎片、小雪球、蒲公英種子）改用外層 `<span class="qseason-particle qseason-flight">` 包住內層 `<img class="qseason-sprite qseason-art-spin" alt="" draggable="false">`。兩層都不能攔截滑鼠。
- **外層路徑**：每顆隨機左右曲線方向／曲線幅度，沿飛行過程 25%、50%、75%、100% 依序調整水平座標和傾斜角度；保留原本從腳邊出發、依角色高度飄升與整體淡入淡出。最終飛行高度與水平幅度沿用上一版。
- **內層本體**：獨立於外層路徑，沿整段動畫隨機順時針／逆時針旋轉；花瓣、種子、碎片、飛絮等輕素材總旋轉約 360°–900°，完整花／葉／穗約 180°–420°，每顆起始角度不同。整段 4–5.5 秒持續旋轉，沒有中途停止。
- `dandelion-puff.png` 完整蒲公英絨球**仍在腳邊靜止淡出**，不套用飛行路徑。**CSS 螢火蟲完全不變**，沿用原飛行高度、大小與光暈。動物圖既有依進場方向的 `scaleX(-1)` 左右翻轉保留，**不加入飛行或本體自轉**；正面坐姿的台灣黑熊維持原狀。
- `seasonal-micro-scene.css`：新增 `qseason-curved-flight` 和 `qseason-image-spin`，分別在外層／內層執行；移除舊版只針對花朵的 `qseason-flower-scatter`。維持 `prefers-reduced-motion` 關閉規則。
- `index.html`：只升級季節快取 CSS `?v=5` → `?v=6`、JS `?v=8` → `?v=9`。未更新任何 PNG。

**保護範圍**：`pet-engine.js`、`pet-picker.js`、`pet-extension.zip`、`version.json`、`pets/`、動物彩蛋抽選常數（20%／60 分鐘）、互動動作及螢火蟲程式皆不修改。

**備份與還原**：修改前建立 [`backup/pre-seasonal-dual-spin-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-dual-spin-20261112)，起始 main 為 `ad4eb790d7a37ec647a5e6f9660684224ce7bf0b`。使用 GitHub Revert 本次 PR 即可撤銷；勿 Reset 整個 main 以免覆寫後續更新。程式語法及模擬 DOM 測試後合併；實際瀏覽器畫面仍需測試。

---

## 2026-11-12｜網頁版花朵與花瓣隨機旋轉（GPT-6）

依玩家提供的第二段網頁錄影提出的要求：完整花朵與單片花瓣不只在消失時微轉角度，而是在整段飄升期間**持續緩慢旋轉**，以增加飄散感。

- `seasonal-micro-scene.js`：每次生成花朵／花瓣時，以素材檔名 `-full.png`、`-petal.png`、`-flower.png` 識別可旋轉主體；個別抽起始角度（-100°～100°）、順時針／逆時針方向及旋轉幅度。完整花朵約轉 **55°～170°**，單片花瓣約轉 **145°～320°**，每顆角度獨立隨機。
- `seasonal-micro-scene.css`：僅替花朵與花瓣加 `.qseason-flower-spin` 及 `qseason-flower-scatter`，持續旋轉仍沿用原本水平飄移、升高、淡入淡出、4～5.5 秒存活及透明度；不修改花朵的 PNG。
- 其他效果維持：楓葉／銀杏／芒草／雪花使用原本粒子動畫，蒲公英絨球仍只停在腳邊，蒲公英種子仍飛高；**螢火蟲的大小差異、光暈及飛高設定不動**。尊重 `prefers-reduced-motion`。
- `index.html`：只將季節 CSS 快取 `?v=4` → `?v=5`、JS `?v=7` → `?v=8`。
- **完全不動**動物彩蛋 20%／60 分鐘抽選、點擊互動和四隻動物的進退場，以及 `pet-engine.js`、`pet-picker.js`、`pet-extension.zip`、`version.json`、`pets/` 與所有素材 PNG。
- 備份分支：[`backup/pre-seasonal-flower-rotation-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-flower-rotation-20261112)；基準 `main` SHA `16c32a9095ffbd7d7be4340b301ebe624c9dab10`。
- 還原：在 GitHub Revert 本次旋轉 PR，無須重設 `main`。JS 語法與邏輯模擬可驗證；Chrome 網頁實際視覺仍需開啟網站驗收。

---

## 2026-11-12｜網頁版季節微景：響應式密度、淡色清晰度、蒲公英與螢火蟲增高

依玩家實際錄影回饋：原本所有視窗最多六顆、每 950–1650ms 才嘗試生成、約 2.7–4.1 秒就淡出，寬螢幕顯得稀疏；淡色水彩素材因透明留白及低不透明度而不易辨識。

### 此次修改
- `seasonal-micro-scene.js`：在 `particleSettings()` 根據 **`window.innerWidth`** 每次 tick 重算（視窗縮放後不需重載），所有桌寵共用上限，不依角色數倍增：
  - 寬度 ≤600px：同時最多 6 顆，間隔 800–1200ms。
  - 寬度 601–1100px：最多 8 顆，間隔 650–950ms。
  - 寬度 1101–1600px：最多 10 顆，間隔 500–850ms。
  - 寬度 >1600px：最多 12 顆，間隔 450–750ms。
- 粒子存活延長至 **4–5.5 秒**；一般水彩的最高不透明度從 52–83% 提至 **80–95%**；淡色品種（油桐、台灣百合、台灣杜鵑、蓮花、梅花、雪晶、蒲公英）提至 **95–100%**，並略放大畫面盒子 **12%**。一般整朵／整葉約 22–36px，花瓣／碎片約 17–28px，淡色品種依此再稍放大；沒有重新輸出 PNG。
- `dandelion-seed.png` **單顆種子**上升至角色高度 **120–180%**，最多 400px，左右飄移可達 ±72px；`dandelion-puff.png` **整顆絨球**仍只停在腳邊淡出，不跟著飛。
- 夏夜 CSS 螢火蟲上升至角色高度 **85–170%**（至少 75px、最多 400px），左右漂移可達 ±65px；光點尺寸採 **70% 小光點（2.5–4.7px）／30% 較大光點（4.8–7.5px）**，每個光暈半徑隨光點大小同步變動。
- `seasonal-micro-scene.css`：移除水彩圖既有的 `drop-shadow`，尊重無額外陰影需求；只保留螢火蟲自身發光的 CSS 光暈。
- `index.html`：**只**更新季節檔案快取：CSS `?v=3`→`?v=4`、JS `?v=6`→`?v=7`。追加本 CHANGELOG。

### 保護與還原
- **完全不動**季節動物的 `ANIMAL_CHANCE = 0.2`、`ANIMAL_INTERVAL_MIN = 60`、3 分鐘首次抽選、隱藏分頁暫停、四隻動物的動畫／點擊行為；不改 `pet-engine.js`、`pet-picker.js`、`pet-extension.zip`、`version.json`、`pets/` 及任何 PNG。
- 備份：[backup/pre-seasonal-density-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-density-20261112)，基準 SHA `b8d0546da35cb5d9361101a4913bb27d8a015fdc`。
- 只需 Revert 本次密度調整的 PR 即可回復，不要 Reset 整個 main。
- 功能由靜態／模擬測試檢查；真實瀏覽器背景對比與 Console 仍需部署後人工驗收。

---

## 2026-11-12｜網頁版季節水彩 PNG 與台灣動物彩蛋（GPT-6）

**範圍**：`seasonal-micro-scene.js`、`seasonal-micro-scene.css`、`assets/seasonal/README.md`、`index.html` 的季節快取參數及本 CHANGELOG。**保持不變**：`pet-engine.js`、`pet-picker.js`、`pet-extension.zip`、`version.json`、`pets/`；此任務沒有修改動物 PNG。

### 水彩季節微景
- 捨棄原本 `✿/❀` 字形及秋季楓葉／銀杏 SVG，改為 `assets/seasonal/` 已完成的透明水彩 PNG；每顆使用 `img`（`alt=""`、`draggable=false`、`pointer-events:none`），只預載目前季節圖。`new Image()` 載入成功才加入候選，錯誤圖不加入候選；`ginkgo-fragment.png` 尚缺，故完全不列入設定且不請求。
- 全季仍共享最多 **6 顆**粒子；保留每 950–1650ms 嘗試一顆、每顆 2700–4100ms、原腳邊起點、X 位移 ±42px、依桌寵高度 70%–120% 向上飄升與淡出；圖片約 **15–32px**，完整花／葉偏上限、花瓣／碎片偏下限。飛散類候選分組抽樣：`-petal/-fragment/-fluff/-seed` 約 75%、完整花／葉／穗約 25%。
- 春／夏／秋加入蒲公英：`dandelion-puff.png` 以少量機率只在腳邊停留淡出；`dandelion-seed.png` 才隨粒子飄散。`snowball.png`（大）保留不啟用，改用 `snowball-small.png`；加入 `snowflake-fragment.png`。夏季夜間 CSS 螢火蟲尺寸仍為 3–5.5px，19:00–05:59 出現。

| 時段 | 粒子素材目錄／名稱 | 動物素材 |
| --- | --- | --- |
| 1–2 月 | winter/plum-full、plum-petal、camellia-full、camellia-petal | formosan-black-bear.png |
| 3–4 月 | spring/taiwan-cherry-full/petal、taiwan-azalea-full/petal、taiwan-lily-full/petal＋dandelion | taiwan-blue-magpie.png |
| 5 月 | spring/tung-flower-full/petal（權重 5）、taiwan-lily-full/petal＋dandelion | taiwan-blue-magpie.png |
| 6–8 月白天 | summer/poinciana-full/petal、lotus-full/petal、daylily-full/petal、hibiscus-full/petal＋dandelion | taiwan-sika-deer.png |
| 6–8 月夜間 | 原 CSS firefly（不請求花圖） | taiwan-sika-deer.png |
| 9–11 月 | autumn/maple-leaf、maple-fragment、ginkgo-leaf、taiwan-rain-tree-flower、taiwan-rain-tree-pod、silvergrass-plume、silvergrass-fluff＋dandelion | leopard-cat.png |
| 12 月 | winter/snowflake、snowflake-fragment、snowball-small、camellia-full/petal | formosan-black-bear.png |

### 動物彩蛋（僅網頁）
- 存在 `seasonal-micro-scene.js` 頂部的可調常數：**`ANIMAL_CHANCE = 0.2`**、**`ANIMAL_INTERVAL_MIN = 60`**、`ANIMAL_FIRST_DELAY_MS = 3 * 60 * 1000`。開始散步後累計 3 分鐘可見時間抽首次，之後每 60 可見分鐘再抽 20%；抽中後在該 60 分鐘窗口挑一個隨機時間點出場一次。隱藏分頁暫停可見時鐘；選角、拖曳、缺圖或已有動物在場會延後已抽中的那次，直到可出場為止。
- 每次只預載**當季一隻**動物的 PNG，藍鵲／鹿／石虎原始圖偏向左方，向右進場時以 `scaleX(-1)` 翻轉；黑熊正面不翻轉。動物高度為桌寵實際像素高度的 50%，依圖像透明下緣個別校正站地位置；z-index 位於粒子 (-1) 之上、桌寵 (1) 之下，不修改角色引擎或打斷角色動作。
- 程式驅動行為：藍鵲四次跳躍／左右張望／斜飛離；梅花鹿走入／低頭約兩秒／走出；石虎匍匐慢行／停兩秒／衝離；黑熊坐姿淡入／左右輕晃／淡出。正常出場約 7.5–9.5 秒。點擊動物冒一個共用 qfx 風格愛心，550ms 提早離場。動畫在分頁隱藏時暫停，prefers-reduced-motion 時不播放。

### 測試、快取與還原
- `?season=spring`、`?season=summer`、`?season=autumn`、`?season=winter`、`?season=firefly`：強制季節素材、相應動物品種，無額外切換介面。`?animal=1`：開始散步且圖載入後強制當季動物出場一次、**3 秒**後離場，可與 `?season=` 並用（例如 `?season=autumn&animal=1`）。
- `index.html` 只改季節資源快取：`seasonal-micro-scene.css?v=2` → `?v=3`、`seasonal-micro-scene.js?v=5` → `?v=6`。
- 備份分支：[`backup/pre-seasonal-art-link-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-art-link-20261112)；[`backup/pre-seasonal-animals-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-animals-20261112)。起點 main SHA `d436f1a1f85b5f1ca33fa796a81f4ac340d3aa66`。
- 還原：在 GitHub **Revert 本次 PR 的季節相關提交**，並更新／還原 `index.html` 中兩個 `?v=` 參數；不要 Reset 整個 main。若只停用動物功能，可只 Revert 動物程式／樣式相關提交而保留水彩素材。
- 程式內部 JS 語法、季節清單與時鐘邏輯做靜態／模擬檢查；**尚無真實 Chrome 深淺背景畫面、Console 或 GitHub Pages 佈署的視覺驗收**，部署後須由玩家實機確認。不得以生成圖片當作網頁驗收。

---

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

---

## 2026-11-12｜第二批網頁版功能（GPT-6，給 Claude 的交接）

**狀態**：完成網頁端程式更新；維持 `pet-extension.zip` 不變，未發行擴充功能新版。
**開工前備份**：[backup/pre-batch2-features-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-batch2-features-20261112)；另有較早的 [backup/pre-web-batch2-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-web-batch2-20261112)。
**本次功能分四個獨立提交**，功能完成後才合併到 main，合併時保留個別提交（不可 squash）。
**原始介面**：保留先前已通過玩家截圖修正的手帳 UI。此批不新增任何 AI 生成圖片，所有特效與選單均由程式繪製。

### 功能1｜季節楓葉 SVG／粒子圖層（提交 `2ba580507`）

- 修改檔案及主要行數（本批代碼所在範圍，後續請以原始碼為準）：
  - `seasonal-micro-scene.js` L55–69：楓葉由 🍁 emoji 換為暖紅 `#d9673a` 內嵌 SVG，大小 12–17px；銀杏維持。
  - `seasonal-micro-scene.js` L81–94：楓葉／銀杏 SVG 避免再設定 fontSize，新增 `stage.insertBefore(el, stage.firstChild)` 以放在角色後方。
  - `seasonal-micro-scene.css` L7／L31：保留粒子 `z-index:0`，兩種 SVG 皆有 `width:100%;height:100%`。
  - `index.html` L15、L19：快取參數 CSS `?v=2`、JS `?v=3`。
- 新 API／opts：無；localStorage：無。
- 擴充功能注意：這兩個季節檔案是**網頁獨立載入**，不在 `pet-engine.js`；Chrome 同步時是否引入季節微景由 Claude 另行決定，別把它重複加進引擎。
- 單獨還原：Revert 提交 `2ba580507`；若已更新快取路徑，還原後需再調整季節檔案的 `?v=`。

### 功能2｜偷看滑鼠（提交 `870efafe3`）

- 修改檔案：`pet-engine.js` L115、L522–547、L566–583。
- 新增引擎選項：`new QPet.World(stage,{watchMouse:true})`，**預設 true**；設 `false` 不註冊監聽。
- `World.watchPointer(e)`：在 `document` 監聽 `pointermove`，100ms 節流；排除觸控、睡覺、拖曳／拋出、`peek`、`follow`、`goal` 等。水平距離 250px 內、最近 1.5 秒移動才觸發。站立角色轉頭 1–2 秒，30% 冒音符或驚嘆號；走路角色僅有 20% 停下，其餘繼續。角色各自冷卻 6–12 秒。
- 新 API：選項 `opts.watchMouse`；internal `World.watchPointer(e)`；新增 `Pet.mouseLookReadyAt` 狀態。
- localStorage：**無**，不記錄滑鼠座標。
- 擴充功能注意：不要將 `pointermove` 綁到 `stage`，因為 `stage` 是 `pointer-events:none`；要綁 `document`；舊的 `new QPet.World(stage,{max})` 呼叫相容。
- 單獨還原：Revert 提交 `870efafe3`；如 Git 顯示共享 `pet-engine.js` 的衝突，僅處理此功能的 listener／`watchPointer`／每隻角色冷卻欄位，其他功能不得刪除。

### 功能3｜歡迎回來（提交 `bb7db39b7`）

- 修改檔案：`pet-engine.js` L424–427、L526–536、L610–650。
- 新增引擎選項：`opts.welcome` 預設 **true**，`opts.welcomeAfter` 預設 **600 秒**。
- `World.welcomeBack()`／`World.welcomePet(p,index,total,group)`：`visibilitychange` 隱藏時計算離開起點，重新可見時只觸發一次；少於門檻不觸發。睡眠中先 `rouse()` 約 2 秒後用 `next` 銜接；醒著的角色跑到中段左右分散，先顯示愛心，再使用 `wave` 或 `click`，透過 `next` 返回站立；多隻角色間錯開 300–800ms，`touch()` 重置入睡計時。拖曳或拋出時不強行覆蓋。
- 為使 `click` 可於歡迎結束時接下一步，`case 'click'` 完成分支只新增 `!this.done()` 判斷；舊的無 `next` 情況仍走路。
- 新 API：`opts.welcome`、`opts.welcomeAfter`，內部 `World.welcomeBack()`／`World.welcomePet()`。
- localStorage：**無**，`awayAt` 是每個 World 的暫存時間。
- 擴充功能注意：需要 `document.visibilitychange`；Chrome popup/背景頁與網頁不同，Claude 應確認實際分頁失焦／返回判定，並避免和原有吃飯提醒互相覆蓋；不依賴 `index.html` 元素 id。
- 單獨還原：Revert `bb7db39b7`；保留原本 `mealCheck()` 監聽，勿刪除吃飯提醒。

### 功能4｜每隻角色個別大小（提交 `e1065a238`）

- 影響檔案／範圍：
  - `pet-engine.js` L10–12、L132–140、L511–523、L550–564：讀取保存的倍率、加入 `getPetScale(id)`／`setPetScale(id,factor)`、修改 `Pet.resize()`；最終高度約束 `SIZE_MIN/SIZE_MAX`（100–240px），`ground()` 照常調整腳底。
  - `pet-picker.js` L11–34、L43–124：**只在 opt-in 模式**替已選中的拍立得外框旁加「⋯」膠囊，點擊展開向下的三段大小選單；舊的 `QPet.picker(o)` 不帶選項時布局不變。
  - `index.html` L17–18、L122–130：引擎、選角快取由 `?v=0.8` 升 `?v=0.9`；網頁呼叫 `QPet.picker` 時傳入倍率回呼，保留原有全域大小按鈕；`notebook-ui.css` 快取 `?v=3`。
  - `notebook-ui.css` L257–307：只針對網頁 `#picker` 加入膠囊與向下浮層（手機 390px 有縮窄樣式）；不碰共用 `vh-ui.css`。
- 新 API：`world.getPetScale(id)` 回傳倍率；`world.setPetScale(id, 0.85 | 1 | 1.15)` 即時改尺寸並儲存，成功回傳 true；原有 `world.setSize('小'|'中'|'大')` 完整保留。
- localStorage：`pet_size_each`，格式 `{"角色id":0.85,"另一id":1.15}`，標準 1 預設不必存；所有存取均 try/catch，非法資料會回到預設。
- 倍率公式：視窗高度 × 全域大小比例 × 名冊 size/120 × 個別倍率，結果再限制 100–240px。
- 擴充功能注意：`pet-engine.js` API 可共用；`pet-picker.js` 的浮層**預設不開啟**，需傳 `scaleControls:true`、`getPetScale`、`onPetScale` 三項。視覺採 `notebook-ui.css` 網頁專屬樣式，Claude 若要在 Chrome popup 使用，需要再同步對應 CSS。選角元件必須有 `#grid`、`#group`、`#picked`，但 engine 的縮放 API **不依賴**這些 id。
- 單獨還原：Revert `e1065a238`。請注意本提交也更新了季節快取參數；如回退後季節特效仍要保留新 SVG，需保持快取路徑指向最新季節檔案。已存在的 localStorage 資料不必手動清理，舊版程式不使用它。

### 檢查與驗收
- 完成靜態 JS 語法檢查，與以假 DOM／Canvas 環境跑 1、2、4 隻角色的邏輯檢查：倍率即時生效、腳底對齊、localStorage 保存／壞資料容錯、觸控忽略、100ms 滑鼠節流、睡眠迷糊醒來後的歡迎動作、拍立得浮層觸發與舊 Picker 向下相容，均通過。
- **未取得真實瀏覽器畫面或 Console**：390px 版面視覺、角色拖曳／相遇／探頭等完整現場操作、主機 GitHub Pages 佈署狀態，仍待使用者在 Chrome 開啟網頁後確認；不可誤報為已完成實際瀏覽器驗收。
- `pet-extension.zip` 和 `version.json` 需在合併後透過 SHA／git diff 再確認零改動。

### 未處理，由 Claude 後續接手
1. 被捲動嚇到。
2. 一鍵隱藏所有角色。
3. 指定網站不出現桌寵。
4. 同步上述新引擎／UI 至 Chrome 擴充功能、重新打包 ZIP、更新版本／發布。**本次沒有做任何下載版更新**。



## 2026-11-12｜個別大小選單圖層修正（網頁版，GPT-6）

玩家提供**實際網頁截圖**，指出拍立得「⋯」的向下選單被下方「已選」與「角色大小」蓋住，無法順利點擊。本次直接修程式，不以生成圖片當作實際 UI。

- `pet-picker.js`：將開啟的 `.pol-size-menu` 從 `.pol-slot` 內移至網頁選角容器 `#picker` 的直屬子元素（portal），令浮層脫離 `.sheet` 捲動區與兄弟元素的 stacking context；根據「⋯」膠囊 `getBoundingClientRect()` 定位在下方，水平夾住螢幕邊界。已加入捲動／縮放定位更新；修正「點擊浮層內按鈕不該被外部點擊事件搶先關閉」及 Escape／點擊外面關閉。
- `notebook-ui.css`：新增 `#picker > .pol-size-menu.is-portal` 的 `position:fixed; z-index:10000`，不更換原有色彩、三段大小按鈕及拍立得設計。
- `index.html`：`pet-picker.js?v=0.10`、`notebook-ui.css?v=4`，確保瀏覽器載入最新檔。
- **沒有修改** `pet-engine.js`、`vh-ui.css`、`pet-extension.zip`、`version.json`、`install.html`、`roster.yaml`、`files.json`、`pets/`。
- 自動化模擬 DOM 互動測試已通過：浮層確實移到 `#picker` 直下、下方定位、水平防溢、大小按鈕可點、外部與 Escape 關閉、捲動跟隨、舊版未啟用選單時選角布局維持；**真實瀏覽器顯示仍需玩家開啟網頁確認**。
- 修改前備份：[backup/pre-size-popup-layer-fix-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-size-popup-layer-fix-20261112)。
- **個別還原**：在 GitHub Revert 本次 PR（只影響選單層級及相關快取），不需要回復第二批其他功能。明天 Claude 同步擴充功能時，若引入個別大小 UI，應一併同步此 `pet-picker.js` portal 修正；它依賴網頁的 `#picker` 上層與 `notebook-ui.css` 樣式，未啟用時不影響共用引擎。


## 2026-11-12｜摸頭操作提示補充（僅網頁文字）

- 玩家已實際成功觸發摸頭，但原本介面「滑鼠在頭上來回能摸摸牠」不夠具體。
- `index.html`：選角說明改成清楚標示「雙擊空白處呼喚」、「按住角色拖曳」及「不用按滑鼠，在角色頭部快速左右來回刷動約 3 次」；保留最多四隻等原資訊。
- 不變：`pet-engine.js` 摸頭判定（900ms 內至少三次方向折返）、`pet-picker.js`、全部 CSS、角色素材、`pet-extension.zip`、`version.json`、`install.html`。
- 備份：[`backup/pre-headpat-help-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-headpat-help-20261112)；只需 Revert 本次說明 PR 即可單獨還原。
- 交接 Claude：明天若同步擴充功能的選角頁，請一併補上相同的摸頭操作提示；這次不修改 ZIP。


## 2026-11-12｜季節微景跟隨角色大小（網頁版，GPT-6）

玩家實際操作網頁後回饋：季節落葉與花瓣相對桌寵偏小。本次只調整季節圖案的**尺寸計算**，讓不同全域與個別角色倍率自動對應合適的粒子尺寸，不用改引擎、角色素材或圖片。

- `seasonal-micro-scene.js` L31–43：在 `spawn(stage, type, pet)` 讀取 `pet.offsetHeight` 作為角色的實際 CSS 像素高度（不受目前角色翻轉、旋轉等 transform 影響）；必要時回退至 `getBoundingClientRect().height`。新增局部 `relativeSize(low, high, minPx, maxPx)`，先以角色高度乘隨機比例，再依尺寸上下限裁切。
- L45–56：梅花、櫻花、桐花改成角色高度的 **10%～14%**，限制 **15～30px**。
- L62–76：楓葉、銀杏 SVG 改成角色高度的 **11%～15%**，限制 **16～32px**；SVG 本身、顏色、圖層均不變。
- L78–82：雪花改成角色高度的 **8%～12%**，限制 **12～26px**。
- L57–61：螢火蟲仍為 **3～5.5px**，刻意不跟著放大，避免光球過大。
- L84–103：保留原本隨角色腳邊生成、升起淡出、最多六顆、`stage.insertBefore(el, stage.firstChild)` 的角色後方圖層設定。
- `index.html` L19：網頁季節 JS 快取升至 `seasonal-micro-scene.js?v=4`；季節 CSS 無需改動（維持 `?v=2`）。
- 新 engine API、opts、localStorage：**無**；`pet-engine.js`、`pet-picker.js`、`seasonal-micro-scene.css` 不更動。
- 自動化測試：JS 語法與模擬 DOM 的六種季節粒子／100、120、180、240px 角色高度、比例上下限與螢火蟲固定尺寸，共 **42 種案例通過**。尚未以實際瀏覽器畫面驗收視覺，不使用 AI 生成圖片假充實際畫面。
- 版本保護：`pet-extension.zip`、`version.json`、`install.html`、`roster.yaml`、`files.json`、`pets/` 不修改；合併後核對 SHA。
- 備份分支：[`backup/pre-seasonal-proportional-20261112`](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-proportional-20261112)。
- 單獨還原：在 GitHub Revert 本次 PR；或僅還原 `seasonal-micro-scene.js` 的尺寸公式，並更新 `index.html` 的季節 JS 快取字串。**不要 Reset main**，以免刪除後續素材及功能。
- Claude 交接：季節微景依舊是**網頁版獨立檔案**，不在共享引擎中；如明天同步 Chrome 擴充功能，評估是否要另行引入這套季節 JS。角色引擎原本全域／個別大小已反映在 `.qpet` 的 `offsetHeight`，不必增加新的 World 介面。



## 2026-11-12｜季節飄升高度跟著角色尺寸縮放（網頁版，GPT-6）

玩家實際將角色調成「大」後，觀察到粒子尺寸雖變大，向上飄升距離仍固定，效果只在角色肩膀附近。這次只修**飄升垂直距離**，保留前一批粒子尺寸公式及所有其他桌寵行為。

- `seasonal-micro-scene.js`：沿用 `spawn(stage,type,pet)` 已有的 `petHeight = pet.offsetHeight || rect.height`，將原本固定的 `--dy`（一般 65～110px、螢火蟲 45～85px）改為每顆粒子依角色高度計算。
  - 花瓣／楓葉／銀杏／雪花：飄升 **角色高度的 70%～120%**，最低 70px，最高 285px。角色 120px 約 84～144px、角色 240px 約 168～285px；上限讓部分粒子比頭頂高約 20～35px，其餘在肩膀至頭頂自然分布。
  - 螢火蟲：飄升 **角色高度的 45%～110%**，最低 45px，最高 270px；依舊是較低、較柔和的光點飄動，光點尺寸不變。
- `index.html`：季節 JS 快取 `seasonal-micro-scene.js?v=4` → `?v=5`。
- 保留：從角色腳邊生成、飄往角色附近、偏移 X、淡出時間、粒子最多六顆、角色後方圖層（`stage.insertBefore`），SVG／字形／粒子尺寸比例和其他 UI 全部不變。
- 新 API、localStorage、opts：**無**；Chrome ZIP 及版本號均不修改。
- 程式語法與依最終 70～120%／45～110% 公式進行的模擬檢查通過；**尚未宣稱真實 Chrome 畫面驗收**。
- 修改前備份：[backup/pre-seasonal-height-scale-20261112](https://github.com/mcxpurple/pet/tree/backup/pre-seasonal-height-scale-20261112)。
- 單獨還原：Revert 本次 PR；不要 Reset main。Claude 後續同步擴充功能時，如有引入季節獨立檔，應同步本次垂直距離比例。

## 2026-11-13｜擴充功能 v0.8.0 同步與新功能（Claude）
修改前 main：`cde4dfc`｜備份分支：`backup/pre-ext-080-20261113`

### 共用引擎 pet-engine.js（v0.9 → v1.0，向下相容）
- 個別大小改為可注入儲存：`opts.petScales` 初始值、`opts.saveScales(map)` 自訂儲存；未提供時沿用 localStorage `pet_size_each`（網頁版行為不變）
- 新增 `world.setPetScales(map)`：一次套用全部個別大小、不觸發儲存
- 新增被捲動嚇到：`world.startle()` → 每隻 `Pet.startle()`，定住彈一下、有 click 圖用 click 圖、冒驚嘆號，接著小跑幾步或左右張望；每隻冷卻 20–40 秒；睡覺、拖曳、吃東西等狀態不觸發
- index.html 引擎快取 `?v=1.0`

### 網頁版外觀
- notebook-ui.css：「開始散步」票根去除虛線，右側改灰紫（同右上角膠囊），腳印改灰階；index.html 腳印包進 `<i>`；快取 `?v=7`
- install.html：名稱改陪伴桌寵

### 擴充功能 pet-extension.zip（0.7.0 → 0.8.0）
- 名稱改「陪伴桌寵」；新增權限 activeTab（讀取目前分頁網址，無額外警告）；新增快捷鍵指令 toggle-pets（Alt+Shift+P）
- 同步網頁版引擎與 pet-picker.js：偷看滑鼠、歡迎回來、個別大小
- 新增 seasonal.js：由網頁版 seasonal-micro-scene.js 自動移植，差異為圖片經背景程式取得後畫在 canvas（不受網站安全政策阻擋）、樣式注入 Shadow DOM、動物彩蛋每小時抽選改存 chrome.storage `animal: {win, due}`，所有分頁共用（時鐘為實際時間，非分頁可見時間）
- content.js：個別大小存 chrome.storage `sizeEach`；指定網站不出現 `blockSites`（主機名稱，www. 視為同站）；快速捲動偵測（0.3 秒內超過約 1.2 個視窗高度）
- background.js：快捷鍵切換 `enabled`
- 主畫面：新配色（網頁版收藏手帳的奶油紙＋霧紫，不使用虛線）、快捷鍵提示、目前網站隱藏／恢復與已隱藏清單、目前角色的個別大小按鈕、票根按鈕；說明文字對齊網頁版
- 擴充功能 storage 鍵：pick、enabled、size、sizeEach、blockSites、animal、meal

### 還原
- 整批：在 GitHub 對本次提交按 Revert，或把 main 的檔案從備份分支 `backup/pre-ext-080-20261113` 取回
- 只還原網頁票根外觀：Revert notebook-ui.css 與 index.html 的 `<i>🐾</i>` 變更

## 2026-11-13｜動物彩蛋改為不分季節隨機（網頁版＋擴充功能 0.8.1，Claude）
- seasonal-micro-scene.js：`ANIMALS`（季節對應）與 `ANIMAL_FOOT_PADDING` 合併為 `ANIMAL_LIST`，每筆 `{ file, move, foot }`；四張動物圖首次即全部預載，每次出場隨機抽一隻
- 新增動物：PNG 放進 assets/seasonal/animals/，在 `ANIMAL_LIST` 加一行；move 可選 magpie｜deer｜cat｜bear；改完執行 `python3 tools/port-seasonal.py` 產生擴充功能版 seasonal.js，再重新打包 ZIP
- tools/port-seasonal.py：由網頁版自動產生擴充功能版 seasonal.js（路徑寫在檔內，執行前請依環境調整）
- index.html 季節快取 `?v=11`；擴充功能 0.8.1、version.json 更新
- 補充（同日）：動物清單移到 `assets/seasonal/animals.json`，網頁版與擴充功能每次開啟時讀取；讀不到時使用程式內 `ANIMAL_FALLBACK` 四隻。新增動物只要上傳 PNG＋在 animals.json 加一筆，不用改程式、不用重裝。擴充功能由 background.js 新增 `json` 訊息（僅限 mcxpurple.github.io/pet/ 網址）代為讀取
- 補充（同日）：新增兩種出場方式 `frog`（三跳進場、鼓身體兩次、兩跳離場）與 `flutter`（波浪飄飛、上下壓扁模擬拍翅、在角色附近空中停留、往上飄走；圖為側面朝左，依飛行方向翻轉）。animals.json 的 move 現可填 magpie｜deer｜cat｜bear｜frog｜flutter
