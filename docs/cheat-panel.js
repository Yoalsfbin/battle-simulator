document.addEventListener("DOMContentLoaded", () => {
  initCheatPanel();
});

// ----------------------
// チートパネルの初期化
// ----------------------
function initCheatPanel(panelId = "cheatPanel") {
  const KONAMI_COMMAND = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  const cmd = new Command(KONAMI_COMMAND);

  document.addEventListener("keydown", (e) => {
    cmd.commandDetectionToExecute(e, toggleCheatPanel);
  });

  // パネル表示/非表示切り替え
  function toggleCheatPanel() {
    const panel = document.getElementById(panelId);
    if (!panel) {
      cheatPanel(hero);
      panel = document.getElementById(panelId);
    }
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  }
}

// ----------------------
// チートパネル
// ----------------------
function cheatPanel(hero) {
  // CSS作成
  const style = document.createElement("style");
  style.textContent = `
        #cheatPanel {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            position: fixed;
            top: 50px;
            left: 60vw;
            background: black;
            border: 2px solid white;
            z-index: 9999;
            width: 240px;
            height: auto;
            cursor: move;
        }
        .cheatPanel-content {
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 16px;
            color: white;
        }
        .cheatPanel_title {
            text-align: center;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        .cheat-panel_row {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
        #cheatPanel input {
            width: 60px;
            margin-right: 5px;
            color: white;
            font-size: 1em;
            background: black;
            border: none;
            cursor: text;
            font-family: "DotGothic16", sans-serif;
        }
        #cheatPanel input:focus {
            background: white;
            color: black;
        }
        #cheatPanel button {
            width: 60px;
            color: white;
            font-size: 1em;
            background: inherit;
            border: none;
            cursor: pointer;
            font-family: "DotGothic16", sans-serif;
        }
        #cheatPanel button:hover {
            background: white;
            color: black;
            border-radius: 5px;
        }
        #cheatPanel label {
            display: inline-block;
            width: 70px;
        }
        #cheatPanel #spawnBoss {
            width: 100%;
        }
    `;
  document.head.appendChild(style);

  // GUI作成
  const panel = document.createElement("div");
  panel.id = "cheatPanel";
  panel.innerHTML = `
        <div class="cheatPanel-content">
            <div class="cheatPanel_title">
                <b>チートツール</b>
            </div>
            <div class="cheat-panel_row">
                <label>MaxHP</label>
                <input id="cheatMaxHp" type="number" min="1"/>
                <button id="setHp">設定</button>
            </div>
            <div class="cheat-panel_row">
                <label>HP</label>
                <input id="cheatHp" type="number" min="1"/>
                <button id="setHp">設定</button>
            </div>
            <div class="cheat-panel_row">
                <label>MP</label>
                <input id="cheatMp" type="number" min="0"/>
                <button id="setMp">設定</button>
                </div>
            <div class="cheat-panel_row">
                <label>攻撃力</label>
                <input id="cheatAtk" type="number" min="0"/>
                <button id="setAtk">設定</button>
            </div>
            <div class="cheat-panel_row">
                <button id="spawnBoss">ドラゴンと戦闘</button>
            </div>
        </div>
    `;
  document.body.appendChild(panel);

  // 初期値を入力欄に反映
  document.getElementById("cheatMaxHp").value = hero.maxHp;
  document.getElementById("cheatHp").value = hero.hp;
  document.getElementById("cheatMp").value = hero.mp;
  document.getElementById("cheatAtk").value = hero.attack;

  // ドラッグ処理
  (function enableDrag(el) {
    let isDragging = false;
    let offsetX, offsetY;

    el.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
      isDragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  })(panel);

  // ボタンイベント
  // MaxHP
  document.getElementById("setHp").addEventListener("click", () => {
    const val = parseInt(document.getElementById("cheatMaxHp").value);
    if (!isNaN(val)) {
      hero.maxHp = val;
    }
  });
  // HP
  document.getElementById("setHp").addEventListener("click", () => {
    const val = parseInt(document.getElementById("cheatHp").value);
    if (!isNaN(val)) {
      hero.hp = val;
      document.getElementById("hp1").innerText = hero.hp;
    }
  });

  // MP
  document.getElementById("setMp").addEventListener("click", () => {
    const val = parseInt(document.getElementById("cheatMp").value);
    if (!isNaN(val)) {
      hero.mp = val;
      document.getElementById("mp1").innerText = hero.mp;
    }
  });

  // 攻撃力
  document.getElementById("setAtk").addEventListener("click", () => {
    const val = parseInt(document.getElementById("cheatAtk").value);
    if (!isNaN(val)) {
      hero.attack = val;
    }
  });

  // ドラゴンと戦闘
  document.getElementById("spawnBoss").addEventListener("click", () => {
    // 既存の敵を全削除
    const enemies = document.querySelectorAll(
      ".enemy1, .enemy2, .enemy3, .boss"
    );
    enemies.forEach((e) => e.remove());
    const buttons = document.querySelectorAll("#enemyModal-content button");
    buttons.forEach((b) => b.remove());

    // ボス生成
    generateBossEnemies();
    bossFlg = true;
    enemiesCount = 1;
    maxEnemies = 1;

    textContainer.innerText = "";
    displayText(
      document.querySelector(".boss").dataset.name + "があらわれた！",
      textContainer,
      showModal
    );
  });
}

// ----------------------
// コマンド入力クラス
// ----------------------
class Command {
  #command;
  #commandIndex = 0;

  /**
   * コンストラクタ
   * @param {string[]} command コマンド配列
   */
  constructor(command) {
    this.#command = command;
  }

  // コマンド配列を返す
  get command() {
    return this.#command;
  }

  /**
   * コマンドの入力を検知して関数を実行する
   *
   * @template R
   * @param {KeyboardEvent} e キーボードイベント
   * @param {() => R} callback コマンド検知時に実行される関数
   * @returns {R | undefined} コールバックの戻り値（コマンド成立時のみ）
   */
  commandDetectionToExecute(e, callback) {
    const key = e.key;

    if (key.toLowerCase() === this.#command[this.#commandIndex].toLowerCase()) {
      this.#commandIndex++;
      if (this.#commandIndex === this.#command.length) {
        this.#commandIndex = 0;
        return callback();
      }
    } else {
      this.#commandIndex = 0;
    }
  }
}
