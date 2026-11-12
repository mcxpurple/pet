# Violet Hour｜台灣四季水彩美術素材（網頁版已接入）

> 2026-11-12 美術素材收件區。**水彩素材已上傳並接入網頁版桌寵**，但不影響 Chrome 擴充版。
> 程式仍使用專案根目錄的 `seasonal-micro-scene.js`、`seasonal-micro-scene.css`。Chrome ZIP、角色素材不在此。

## 美術工作流程

1. `previews/` 先存四季完整設定圖，只作確認畫風與品種；請勿直接從有紙紋的合成圖裁切成正式粒子。
2. 每張正式素材單獨繪製或生成。原始尺寸建議 **1024×1024px**，**透明 PNG（RGBA）**，單一主體，保留四周透明留白；不用文字、背景、框線、投影或畫面邊緣截斷。
3. 水彩風：柔和、低飽和、植物形態可辨，清楚分辨花蕊、葉型和穗芒。花材可有 `-full`（整朵）與 `-petal`（花瓣）兩個版本；葉片／草穗依實際形態命名。**同一植物的完整花與單片花瓣必須色彩一致。**
4. 個別檢查去背邊緣與縮成約 15–32px 後的可讀性，確認美術方向，再由程式接到季節動畫。正式使用時可另外優化為透明 WebP，**不用現在就轉檔**。
5. `animals/` 為偶發 Q 版地面彩蛋，**不當作會從空中飄落的花瓣**。網頁版已啟用：開始散步後 3 可見分鐘第一次抽選，往後每 60 可見分鐘抽一次，抽中機率 20%。

## 命名與分類（建議固定使用小寫英文字母 + 連字號）

### spring/ 春季：四組
- `taiwan-cherry-full.png`、`taiwan-cherry-petal.png`：台灣山櫻花
- `tung-flower-full.png`、`tung-flower-petal.png`：油桐花
- `taiwan-lily-full.png`、`taiwan-lily-petal.png`：台灣百合
- `taiwan-azalea-full.png`、`taiwan-azalea-petal.png`：台灣原生杜鵑花材（具體品種繪製時確認）

### summer/ 夏季：四組；螢火蟲現由 CSS 處理，不需要上傳圖片
- `poinciana-full.png`、`poinciana-petal.png`：鳳凰花
- `lotus-full.png`、`lotus-petal.png`：蓮花
- `daylily-full.png`、`daylily-petal.png`：金針花
- `hibiscus-full.png`、`hibiscus-petal.png`：扶桑花／朱槿

### autumn/ 秋季：四組
- `maple-leaf.png`、`maple-fragment.png`：楓葉及碎葉
- `ginkgo-leaf.png`：銀杏完整葉片；`ginkgo-fragment.png` 尚未上傳、不進候選清單，避免 404。
- `taiwan-rain-tree-flower.png`、`taiwan-rain-tree-pod.png`：台灣欒樹黃花、粉紅蒴果
- `silvergrass-plume.png`、`silvergrass-fluff.png`：芒草穗與輕飄絮穗（不是整把草在空中飛）

### 共用素材：春／夏／秋（三季共用；冬季停用）
- `dandelion-puff.png`：蒲公英（Taraxacum spp.）單顆成熟白色絨球，附短花梗，無飛散種子；日系透明水彩，單一主體。
- `dandelion-seed.png`：單枚蒲公英冠毛種子，白色傘狀冠毛、細柄與褐色瘦果完整相連；不畫成羽毛或雪花。
- 以上兩張直接放在 **`assets/seasonal/`**，不複製到各季資料夾。**春、夏、秋皆可使用；冬季不出現**。已接入網頁季節動畫：`dandelion-puff.png` 只在腳邊短暫停留，`dandelion-seed.png` 隨一般粒子飄散。

### winter/ 冬季：四組
- `plum-full.png`、`plum-petal.png`：梅花
- `camellia-full.png`、`camellia-petal.png`：山茶花（Camellia japonica），**深胭脂紅／酒紅／低飽和莓果紅**；完整花為多層寬厚、自然層疊的圓潤花冠、中央柔金黃雄蕊；單片花瓣為寬厚略彎、圓潤末端及細微折面，深酒紅基部向暗玫瑰紅邊緣漸層。**不使用乳白淡粉茶花**，與淡粉白五瓣梅花作明確區隔
- `snowflake.png`：完整水彩雪晶，已啟用
- `snowflake-fragment.png`：雪晶碎片，已啟用
- `snowball-small.png`：小雪球，已啟用
- `snowball.png`：大雪球，保留未用

### animals/ 台灣原生動物 Q 版彩蛋：每季一種（僅網頁版已接入）
- `taiwan-blue-magpie.png`：春，台灣藍鵲
- `taiwan-sika-deer.png`：夏，台灣梅花鹿；**不使用猴子**
- `leopard-cat.png`：秋，石虎
- `formosan-black-bear.png`：冬，台灣黑熊

## 素材數量與狀態
- 已上傳 **37 張 PNG**：春 8、夏 8、秋 7、冬 8、動物 4、蒲公英 2；其中大雪球保留未用，實際使用 **36 張**。
- 石虎 `leopard-cat.png` 已為 **256×256、RGBA PNG**，無須重複縮放。
- 蒲公英與冬季茶花的正式生圖提示詞由作者單張確認，網頁端僅在素材驗收後另行整合。

### previews/ 美術確認
- `seasonal-master-v01.png`：四季全體設定圖，**此處不是正式動畫素材**。
- 後續有修訂可用 `seasonal-master-v02.png`，避免覆寫誤認。

## 上傳

GitHub → 選擇 `assets/seasonal/` 對應季節資料夾 → **Add file → Upload files**。請先上傳已核准的單張透明 PNG；若先放全體圖，請只放在 `previews/`。第三方素材須確認可用於公開網站與再散布。

### 交接備註
- 本次已修改網頁版 `seasonal-micro-scene.js/css` 及 `index.html` 的季節快取參數；**沒有修改** `pet-engine.js`、`pet-picker.js`、`pet-extension.zip`、`version.json`、`pets/`。
- 素材已串接；網頁實際深淺背景與 Console 仍需部署後人工驗收。
- 建置前備份：`backup/pre-seasonal-art-folders-20261112`。

## 網頁版季節對應與測試（2026-11-12）

| 月份 | 水彩素材／效果 | 動物 |
| --- | --- | --- |
| 1–2 | 梅花、酒紅山茶 | 台灣黑熊 |
| 3–4 | 山櫻、台灣杜鵑、台灣百合、蒲公英 | 台灣藍鵲 |
| 5 | 油桐（五倍權重）、台灣百合、蒲公英 | 台灣藍鵲 |
| 6–8 白天 | 鳳凰花、蓮、金針、扶桑、蒲公英 | 台灣梅花鹿 |
| 6–8 19:00–05:59 | CSS 螢火蟲 | 台灣梅花鹿 |
| 9–11 | 楓、銀杏、台灣欒樹、芒草、蒲公英 | 石虎 |
| 12 | 雪晶、雪晶碎片、小雪球、酒紅山茶 | 台灣黑熊 |

- 每次抽粒子：`-petal/-fragment/-fluff/-seed` 約 75%，`-full`／整葉／整穗約 25%；先以 `new Image()` 只預載當季素材，載入成功才加入候選，失敗則剔除；粒子與動物各自獨立。
- 粒子上限共 6，依角色高度約 15–32px；保留腳邊起始點、飄升、淡出、prefers-reduced-motion 關閉規則。
- 動物機率常數 `ANIMAL_CHANCE = 0.2`，間隔 `ANIMAL_INTERVAL_MIN = 60` 在 `seasonal-micro-scene.js` 頂部；第一次於開始散步 3 可見分鐘後抽選，在每小時內隨機出現一次；選角或拖曳時延後。
- 測試：`?season=spring|summer|autumn|winter|firefly` 強制季節及動物品種；`?animal=1` 讓動物在開始散步後出現一次、3 秒後離場，可同時使用；正式不新增切換 UI。
- 安全備份分支：`backup/pre-seasonal-art-link-20261112` 和 `backup/pre-seasonal-animals-20261112`。
- 還原：Revert 本次季節功能的兩組提交／合併 PR，或只還原季節 JS/CSS、README 與 index 的兩個快取字串；勿 Reset 整個 main。
