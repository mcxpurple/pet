# Violet Hour｜台灣四季水彩美術素材（籌備中）

> 2026-11-12 美術素材收件區。**目前未連接正式桌寵網頁**，本資料夾與以下建議檔名不表示素材已製作或上線。
> 程式仍使用專案根目錄的 `seasonal-micro-scene.js`、`seasonal-micro-scene.css`。Chrome ZIP、角色素材不在此。

## 美術工作流程

1. `previews/` 先存四季完整設定圖，只作確認畫風與品種；請勿直接從有紙紋的合成圖裁切成正式粒子。
2. 每張正式素材單獨繪製或生成。原始尺寸建議 **1024×1024px**，**透明 PNG（RGBA）**，單一主體，保留四周透明留白；不用文字、背景、框線、投影或畫面邊緣截斷。
3. 水彩風：柔和、低飽和、植物形態可辨，清楚分辨花蕊、葉型和穗芒。花材可有 `-full`（整朵）與 `-petal`（花瓣）兩個版本；葉片／草穗依實際形態命名。
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

### winter/ 冬季：四組
- `plum-full.png`、`plum-petal.png`：梅花
- `camellia-full.png`、`camellia-petal.png`：茶花
- `snowflake.png`：水彩雪晶
- `snowball.png`：小雪球（新增提案；請避免畫成玻璃球）

### animals/ 台灣原生動物 Q 版彩蛋：每季一種（暫不接入）
- `taiwan-blue-magpie.png`：春，台灣藍鵲
- `taiwan-sika-deer.png`：夏，台灣梅花鹿；**不使用猴子**
- `leopard-cat.png`：秋，石虎
- `formosan-black-bear.png`：冬，台灣黑熊

### previews/ 美術確認
- `seasonal-master-v01.png`：四季全體設定圖，**此處不是正式動畫素材**。
- 後續有修訂可用 `seasonal-master-v02.png`，避免覆寫誤認。

## 上傳

GitHub → 選擇 `assets/seasonal/` 對應季節資料夾 → **Add file → Upload files**。請先上傳已核准的單張透明 PNG；若先放全體圖，請只放在 `previews/`。第三方素材須確認可用於公開網站與再散布。

### 交接備註
- 本次只建素材目錄／規格，**沒有修改** `index.html`、`pet-engine.js`、`seasonal-micro-scene.js/css`、`pet-extension.zip`、`version.json`、`pets/`。
- 不要直接把本資料夾中的檔案視作已上線資源；接入新素材必須等玩家核准，分支測試後更新季節 JS／CSS 與快取版本。
- 建置前備份：`backup/pre-seasonal-art-folders-20261112`。
