import json
s=open('/tmp/pet/seasonal-micro-scene.js',encoding='utf-8').read()
css=open('/tmp/pet/seasonal-micro-scene.css',encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(a[:70],c); s=s.replace(a,b)
rep(s[:s.index("(function () {")+len("(function () {")],"""/*
 * Violet Hour 紫夜星光｜季節水彩微景（擴充功能版）
 * © 2026 mcx_purple. All rights reserved.
 * 由網頁版 seasonal-micro-scene.js 自動移植（tools 見 CHANGELOG 2026-11-13）。
 * 差異：圖片由背景程式取得後畫在 canvas（不受網站安全政策阻擋）；
 *       動物彩蛋的每小時抽選存在 chrome.storage，所有分頁共用；樣式注入 Shadow DOM。
 */
window.QSeasonStart = function (stage, ext) {""")
rep("""  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else init();
})();""","""  const style = document.createElement('style');
  style.textContent = ext.css;
  stage.getRootNode().appendChild(style);
  init();
};""")
rep("""    const stage = document.getElementById('stage');
    if (!stage) return;""","""    if (!stage) return;""")
rep("new URLSearchParams(window.location.search).get('season')","null")
rep("new URLSearchParams(window.location.search).get('animal') === '1'","false")
rep("const ROOT = 'assets/seasonal/';","const ROOT = 'https://mcxpurple.github.io/pet/assets/seasonal/';")
s=s.replace("document.getElementById('picker')","null")
rep("const off = document.hidden ||","const off = !stage.isConnected || document.hidden ||")
rep("return document.hidden || reducedMotion.matches ||","return !stage.isConnected || document.hidden || reducedMotion.matches ||")
s=s.replace("new Image()","new ExtImage()")
rep("""  let activeTheme = '';""","""  function ExtImage() { this.naturalWidth = 0; this.onload = null; this.onerror = null; this._src = ''; }
  Object.defineProperty(ExtImage.prototype, 'src', {
    get() { return this._src; },
    set(url) {
      this._src = url;
      ext.load(url).then(bmp => { this.naturalWidth = bmp.width; this.onload && this.onload(); })
        .catch(() => { this.onerror && this.onerror(); });
    }
  });

  let activeTheme = '';""")
rep("el = document.createElement(ground ? 'img' : 'span');","el = ground ? ext.canvas(item.file) : document.createElement('span');")
rep("""        el.alt = '';
        el.draggable = false;
        el.src = item.file;""","""        el.draggable = false;""")
rep("""        const artwork = document.createElement('img');""","""        const artwork = ext.canvas(item.file);""")
rep("""        artwork.alt = '';
        artwork.draggable = false;
        artwork.style.pointerEvents = 'none';
        artwork.src = item.file;""","""        artwork.draggable = false;
        artwork.style.pointerEvents = 'none';""")
rep("""    const el = document.createElement('img');
    el.src = animalImage.src;
    el.alt = '';""","""    const el = ext.canvas(animalImage.src);""")
a=s.index("      // 每個小時窗口各抽一次")
b=s.index("animalQueue.shift();\n      }",a)+len("animalQueue.shift();\n      }")
s=s[:a]+"""      // 擴充功能：每小時抽選由 content.js 存在 chrome.storage，所有分頁共用同一次出場。
      if (ext.animalReady() && !animalBlocked() && !currentAnimal && spawnAnimal(stage, false)) {
        ext.animalShown();
      }"""+s[b:]
open('/tmp/ext2/pet-extension/seasonal.js','w',encoding='utf-8').write("window.QSeasonCSS = "+json.dumps(css,ensure_ascii=False)+";\n"+s)
