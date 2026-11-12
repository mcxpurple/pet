# Violet Hour｜台灣四季水彩美術素材（籌備中）

> 2026-11-12 美術素材收件區。**目前未連接正式桌寵網頁**，本資料夾與以下建議檔名不表示素材已製作或上線。
> 程式仍使用專案根目錄的 `seasonal-micro-scene.js`、`seasonal-micro-scene.css`。Chrome ZIP、角色素材不在此。

## 美術工作流程

1. `previews/` 先存四季完整設定圖，只作確認畫風與品種；請勿直接從有紙紋的合成圖裁切成正式粒子。
2. 每張正式素材單獨繪製或生成。原始尺寸建議 **1024×1024px**，**透明 PNG（RGBA）**，單一主體，保留四周透明留白；不用文字、背景、框線、投影或畫面邊緣截斷。
3. 水彩風：柔和、低飽和、植物形態可辨，清楚分辨花蕊、葉型和穗芒。花材可有 `-full`（整朵）與 `-petal`（花瓣）兩個版本；葉片／草穗依實際形態命名。**同一植物的完整花與單片花瓣必須色彩一致。**
4. 個別檢查去背邊緣與縮成約 15–32px 後的可讀性，確認美術方向，再由程式接到季節動畫。正式使用時可另外優化為透明 WebP，**不用現在就轉檔**。
5. `animals/` 為偶發 Q 版地面彩蛋的預留區，**不當作會從空中飄落的花瓣**。動物出現規則仍待設計，不會自行啟用。

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
- `ginkgo-leaf.png`、`ginkgo-fragment.png`：銀杏葉及小葉
- `taiwan-rain-tree-flower.png`、`taiwan-rain-tree-pod.png`：台灣欒樹黃花、粉紅蒴果
- `silvergrass-plume.png`、`silvergrass-fluff.png`：芒草穗與輕飄絮穗（不是整把草在空中飛）

### 共用素材：春／夏／秋（三季共用；冬季停用）
- `dandelion-puff.png`：蒲公英（Taraxacum spp.）單顆成熟白色絨球，附短花梗，無飛散種子；日系透明水彩，單一主體。
- `dandelion-seed.png`：單枚蒲公英冠毛種子，白色傘狀冠毛、細柄與褐色瘦果完整相連；不畫成羽毛或雪花。
- 以上兩張直接放在 **`assets/seasonal/`**，不複製到各季資料夾。**春、夏、秋皆可使用；冬季不出現**。只是素材與規格預留，尚未修改動畫觸發邏輯。

### winter/ 冬季：四組
- `plum-full.png`、`plum-petal.png`：梅花
- `camellia-full.png`、`camellia-petal.png`：山茶花（Camellia japonica），**深胭脂紅／酒紅／低飽和莓果紅**；完整花為多層寬厚、自然層疊的圓潤花冠、中央柔金黃雄蕊；單片花瓣為寬厚略彎、圓潤末端及細微折面，深酒紅基部向暗玫瑰紅邊緣漸層。**不使用乳白淡粉茶花**，與淡粉白五瓣梅花作明確區隔
- `snowflake.png`：水彩雪晶
- `snowball.png`：小雪球（新增提案；請避免畫成玻璃球）

### animals/ 台灣原生動物 Q 版彩蛋：每季一種（暫不接入）
- `taiwan-blue-magpie.png`：春，台灣藍鵲
- `taiwan-sika-deer.png`：夏，台灣梅花鹿；**不使用猴子**
- `leopard-cat.png`：秋，石虎
- `formosan-black-bear.png`：冬，台灣黑熊

## 素材數量與狀態
- 春夏秋冬各 8 張，共 **32 張**；動物彩蛋 **4 張**；跨三季共用蒲公英 **2 張**；合計規劃 **38 張**。
- 此處為檔名及美術規格清單，**不代表 PNG 已上傳或季節功能已接入**。
- 蒲公英與冬季茶花的正式生圖提示詞由作者單張確認，網頁端僅在素材驗收後另行整合。

### previews/ 美術確認
- `seasonal-master-v01.png`：四季全體設定圖，**此處不是正式動畫素材**。
- 後續有修訂可用 `seasonal-master-v02.png`，避免覆寫誤認。

## 上傳

GitHub → 選擇 `assets/seasonal/` 對應季節資料夾 → **Add file → Upload files**。請先上傳已核准的單張透明 PNG；若先放全體圖，請只放在 `previews/`。第三方素材須確認可用於公開網站與再散布。

### 交接備註
- 本次只建素材目錄／規格，**沒有修改** `index.html`、`pet-engine.js`、`seasonal-micro-scene.js/css`、`pet-extension.zip`、`version.json`、`pets/`。
- 不要直接把本資料夾中的檔案視作已上線資源；接入新素材必須等玩家核准，分支測試後更新季節 JS／CSS 與快取版本。
- 建置前備份：`backup/pre-seasonal-art-folders-20261112`。
