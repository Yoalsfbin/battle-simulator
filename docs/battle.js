//勇者のパラメータ
var hero = {
  name: "ゆうしゃ",
  maxHp: 100,
  hp: 100,
  mp: 30,
  attack:15,
};

//音楽をループで再生する
// playAudio("battle_bgm");

//勇者の名前
document.getElementById("name").innerText = hero.name;

//勇者HP表示
document.getElementById("hp1").innerText = hero.hp;

//勇者MP表示
document.getElementById("mp1").innerText = hero.mp;

// 重複のない敵の名前を格納する配列
var uniqueEnemyNames = [];

var text = "";
var enemiesFlg = false;
var bossFlg = false;

//敵を１−３体ランダムで表示
var enemiesCount = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
var maxEnemies = enemiesCount;
if (Math.random() < 1 / 26) {
  // たまに強い敵が出る
  generateBossEnemies();
  bossFlg = true;
} else {
  generateEnemies(enemiesCount);
}

if (enemiesCount != 1) {
  uniqueEnemyNames = extractUniqueValues(uniqueEnemyNames);
  var buttonContents = document.querySelectorAll('#enemyModal-content button');
  buttonContents.forEach(function (button) {
    var enemyNameWithId = button.innerText;
    var enemyNameSliced = enemyNameWithId.slice(0, -1); // 最後の1文字を削除する
    if (uniqueEnemyNames.includes(enemyNameSliced)) {
      // ボタンのテキストから最後の1文字を削除
      button.innerText = enemyNameSliced;
    }
  })
};


if (bossFlg) {
  text = document.querySelector('.boss').dataset.name + "があらわれた！"
} else {
  if (enemiesCount == 1) {
  text = document.querySelector('.enemy1').dataset.name + "があらわれた！"
  } else {
    text = "まもののむれががあらわれた！";
    enemiesFlg = true;
  };
}

const textContainer = document.getElementById('msg');
displayText(text, textContainer, showModal); 

var targetId = ""



//関数↓
// オーディオを再生する
function playAudio(audioId) {
  var audio = document.getElementById(audioId);
  audio.play();
}

// オーディオを停止する
function stopAudio(audioId) {
  var audio = document.getElementById(audioId);
  audio.pause();
}

async function enemyButtonClickHandler(event) {
  // クリックされたボタンのIDを取得
  targetId = event.target.id;
  var enemyName = document.getElementById(targetId).innerText;
  var enemyNo = "";
  var enemyHp = "";
  if (bossFlg) {
    enemyHp = document.querySelector('.boss').dataset.hp
  } else {
    enemyNo = targetId.replace("enemyButton", "")
    enemyHp = document.querySelector('.enemy' + enemyNo).dataset.hp
  }
  
  closeModal();
  document.getElementById("enemyModal").style.display = "none";
  document.getElementById("magicModal").style.display = "none";

  textContainer.innerText = "";
  var attackLog = hero.name + "のこうげき！";
  
  await displayTextAndWait(attackLog, textContainer);

  setTimeout(async function () {
    var attackDamage = heroDamageCalculate();
    if (Math.random() < 1 / 16) {
      attackDamage = attackDamage * 2;
      attackLog = "かいしんのいちげき！！" + enemyName + "に" + attackDamage + "のダメージをあたえた！";
    } else {
      attackLog = enemyName + "に" + attackDamage + "のダメージをあたえた！";
    }
    
    await displayTextAndWait(attackLog, textContainer);

    query = "";
    if (bossFlg) {
      query = ".boss"
    } else {
      query = '.enemy' + enemyNo;
    }

    document.querySelector(query).dataset.hp = enemyHp - attackDamage;
    if (document.querySelector(query).dataset.hp < 1) {
      if (document.getElementById(targetId).parentNode) {
        document.getElementById(targetId).parentNode.removeChild(document.getElementById(targetId));
      }
      if (document.querySelector(query).parentNode) {
        document.querySelector(query).parentNode.removeChild(document.querySelector(query))
        await displayTextAndWait(enemyName + "をたおした！", textContainer);
        enemiesCount--;
        if (enemiesCount != 0) {
          processBattle("attack"); // バトル処理を再開
        } else {
          var result = ""
          if (enemiesFlg) {
            // stopAudio("battle_bgm");
            result = "まもののむれをやっつけた！"
            await displayTextAndWait(result, textContainer);
          } 
        }
        return; // 処理を終了して、次のループに進まないようにする
      }
    }
    processBattle("attack"); // 敵を倒していない場合は次の敵の攻撃メッセージに進む
  }, 200);
}

// 敵の攻撃を処理する関数
async function processBattle(kind) {
  var enemiesLeft = enemiesCount;
  var query = "";

  if (bossFlg) {
    query = "bossButton";
    maxEnemies = 1;
    enemiesLeft = 1;
  } else {
    query = "enemyButton" 
  };

  for (let index = 0; index < maxEnemies; index++) {
    var enemyIndex = index + 1;
    if (!bossFlg) {
      query = "enemyButton" + enemyIndex;
    }
    if (document.getElementById(query) === null) {
      // 次のループに進む
      continue;
    }
    enemyName = document.getElementById(query).innerText;
    var damage = enemyDamageCalculate(enemyIndex);
    if (kind == "defend") {
      damage = Math.ceil(damage / 2);
    }
    var battleLog = ""

    if (bossFlg) {
      if (Math.random() < 1 / 3) {
        damage = 40;
        battleLog = enemyName + "はほのおをはいた！！あつい！！" + hero.name + "は" + damage + "のダメージをうけた！";
      } else {
        battleLog = enemyName + "のこうげき！" + hero.name + "は" + damage + "のダメージをうけた！";
      }
    } else {
      if (Math.random() < 1 / 32) {
        damage = damage * 2;
        battleLog = enemyName + "のこうげき！つうこんのいちげき！！" + hero.name + "は" + damage + "のダメージをうけた！";
      } else {
        battleLog = enemyName + "のこうげき！" + hero.name + "は" + damage + "のダメージをうけた！";
      }
    }

    if (damage == 0) {
      battleLog = enemyName + "のこうげき！ミス！" + hero.name + "はダメージをうけない！"; 
    }
    //戦闘ログを表示し、完了後に次の処理に進む
    await displayTextAndWait(battleLog, textContainer);

    //勇者のHPを更新
    hero.hp -= damage;
    if (hero.hp < 1) {
      dyingStatus()
      // stopAudio("battle_bgm")
      document.getElementById("hp1").innerText = 0;
      await displayTextAndWait(hero.name + "はしんでしまった...", textContainer);
      setTimeout(window.location.replace("./reborn.html"), 13000);
      return;
    }
    document.getElementById("hp1").innerText = hero.hp;

    enemiesLeft--;
    if (enemiesLeft === 0) {
      // 全ての敵が行動し終わった場合、ウィンドウを表示する
      showModal();
    }
  }
}

//瀕死ステータス状態
function dyingStatus() {
  var statusWindow = document.querySelector(".status");
  statusWindow.style.border = "2px solid red"

  var statusText = document.querySelector(".hp");
  statusText.style.color = "red"

  var msgWindow = document.getElementById("msg");
  msgWindow.style.color = "red";
  msgWindow.style.border = "2px solid red";
}

// コマンドを選択する関数
function selectCommand(command) {
  switch (command) {
    case 'attack':
      document.getElementById("enemyModal").style.display = "block";
      break;
    case 'defend':
      document.getElementById("magicModal").style.display = "none";
      document.getElementById("enemyModal").style.display = "none";
      // 防御処理を追加する
      var defendLog = hero.name + "はみをまもっている。";
      displayText(defendLog, textContainer, function () {
        textContainer.innerText = "";
        processBattle("defend"); // バトル処理を再開
      });
      break;
    case 'magic':
      document.getElementById("magicModal").style.display = "block";
      break;
    case 'escape':
      document.getElementById("enemyModal").style.display = "none";
      document.getElementById("magicModal").style.display = "none";
      // 逃走処理を追加する
      var escapeLog = hero.name + "はにげだした！";
      // 1/4の確率で逃走成功
      if (Math.random() < 0.25) {
        // 逃走成功の場合、ページをリロードして戦闘から脱出
        escapeLog += "うまくにげきれた！";
        displayText(escapeLog, textContainer, function () {
          setTimeout(location.reload(), 1000); 
        });
      } else {
        // 逃走失敗の場合
        escapeLog += "しかしまわりこまれてしまった！！";
        displayText(escapeLog, textContainer, function () {
          textContainer.innerText = "";
          processBattle("escape"); // バトル処理を再開
        });
      }
      break;
    default:
      console.error('コマンドエラー');
  }
}

//たたかうボタンがクリックされたときの処理
function attack() {
  selectCommand('attack');
}

//ぼうぎょボタンがクリックされたときの処理
function guard() {
  // 防御処理が終了したらモーダルを閉じる
  closeModal();
  selectCommand('defend');
}

//まほうボタンがクリックされたときの処理
function magic() {
  selectCommand('magic');
}

//逃げるボタンがクリックされたときの処理
function escape() {
  //モーダルを閉じる
  closeModal();
  selectCommand('escape');
}

//モーダルを表示する関数
function showModal() {
  document.getElementById("commandModal").style.display = "block";
}

//モーダルを閉じる関数
function closeModal() {
  document.getElementById("commandModal").style.display = "none";
}

//テキストを１文字ずつ表示する関数
function displayText(text, container, callback) {
  textContainer.innerText = "";
  let index = 0;
  const displayInterval = 100; // 文字を表示する間隔（ミリ秒）

  const displayNextCharacter = () => {
    if (index < text.length) {
      container.textContent += text[index];
      index++;
      setTimeout(displayNextCharacter, displayInterval); // 次の文字を表示するまでの待ち時間を設定
    } else {
      // テキスト表示が完了した後にコールバック関数を実行
      if (callback) {
        callback();
      }
    }
  };

  displayNextCharacter(); // 初回の文字表示を開始
}

async function displayTextAndWait(text, container) {
  return new Promise((resolve) => {
    textContainer.innerText = "";
    let index = 0;
    const displayInterval = 100; // 文字を表示する間隔（ミリ秒）

    const displayNextCharacter = () => {
      if (index < text.length) {
        container.textContent += text[index];
        index++;
        setTimeout(displayNextCharacter, displayInterval); // 次の文字を表示するまでの待ち時間を設定
      } else {
        // テキスト表示が完了した後にresolveを呼び出してPromiseを完了させる
        resolve();
      }
    };

    displayNextCharacter(); // 初回の文字表示を開始
  });
}

//敵をランダムに生成する関数
function generateEnemies(enemiesCount) {
  // 敵のパラメータ
  var enemyParams = [
    { hp: 10, name: "アメーバ", minAttack: 3, maxAttack: 8, image: '../docs/img/enemy1.PNG' }, 
    { hp: 20, name: "いたずらねずみ", minAttack: 5, maxAttack: 10, image: '../docs/img/enemy2.PNG' }, 
    { hp: 25, name: "おばけどり", minAttack: 8, maxAttack: 15, image: '../docs/img/enemy3.PNG' } 
  ];

  // enemies要素を取得
  var enemiesContainer = document.querySelector('.enemies');

  // enemiesCount回ループしてenemy要素を生成
  for (var i = 0; i < enemiesCount; i++) {
    // 敵の通番
    var enemyIndex = i + 1;
    // 敵のパラメータを取得
    var enemyParam = enemyParams[Math.floor(Math.random() * (3 - 1 + 1))];
    // HPを生成
    var randomHp = enemyParam.hp;
    // 名前を生成
    var enemyName = enemyParam.name; 
    uniqueEnemyNames.push(enemyName);
    //敵が複数体の場合、ABCを割り当てる
    if (enemiesCount != 1) {
      enemyName += getEnemiesName(enemyName);
    };
    // アタックをランダムに生成
    var randomAttack = Math.floor(Math.random() * (enemyParam.maxAttack - enemyParam.minAttack + 1)) + enemyParam.minAttack;
    // 画像を選択
    var randomImage = enemyParam.image;

    // enemy要素を作成
    var enemyDiv = document.createElement('div');
    enemyDiv.className = 'enemy' + enemyIndex;
    enemyDiv.dataset.name = enemyName;
    enemyDiv.dataset.hp = randomHp; // HPをデータ属性に設定
    enemyDiv.dataset.attack = randomAttack; // 攻撃力をデータ属性に設定

    // img要素を作成
    var imgElement = document.createElement('img');
    imgElement.style.height = '100px';
    imgElement.style.width = 'auto';
    imgElement.style.marginLeft = '50px';
    imgElement.src = randomImage; // ランダムな画像を設定
    imgElement.alt = 'enemy';

    // img要素をenemy要素の子要素として追加
    enemyDiv.appendChild(imgElement);

    // enemies要素にenemy要素を追加
    enemiesContainer.appendChild(enemyDiv);

    //敵選択ウインドウに情報を追加
    var enemyField = document.getElementById('enemyModal-content');
    var enemyButton = document.createElement('button');
    enemyButton.innerText = enemyName;
    // ボタン要素にIDを設定
    enemyButton.id = "enemyButton" + enemyIndex;
    enemyButton.onclick = enemyButtonClickHandler;
    enemyField.appendChild(enemyButton);
  }
};

function generateBossEnemies() {
  // 敵のパラメータ
  var enemyParams = [
    { hp: 120, name: "ドラゴン", minAttack: 20, maxAttack: 30, image: '../docs/img/boss.PNG' }, 
  ];

  // enemies要素を取得
  var enemiesContainer = document.querySelector('.enemies');

  // 敵のパラメータを取得
  var enemyParam = enemyParams[0];
  // HPを生成
  var randomHp = enemyParam.hp;
  // 名前を生成
  var enemyName = enemyParam.name; 
  // アタックをランダムに生成
  var randomAttack = Math.floor(Math.random() * (enemyParam.maxAttack - enemyParam.minAttack + 1)) + enemyParam.minAttack;
  // 画像を選択
  var randomImage = enemyParam.image;

  // enemy要素を作成
  var enemyDiv = document.createElement('div');
  enemyDiv.className = 'boss';
  enemyDiv.dataset.name = enemyName;
  enemyDiv.dataset.hp = randomHp; // HPをデータ属性に設定
  enemyDiv.dataset.attack = randomAttack; // 攻撃力をデータ属性に設定

  // img要素を作成
  var imgElement = document.createElement('img');
  imgElement.style.height = '180px';
  imgElement.style.width = 'auto';
  imgElement.style.marginLeft = '50px';
  imgElement.src = randomImage; // ランダムな画像を設定
  imgElement.alt = 'enemy';

  // img要素をenemy要素の子要素として追加
  enemyDiv.appendChild(imgElement);

  // enemies要素にenemy要素を追加
  enemiesContainer.appendChild(enemyDiv);

  //敵選択ウインドウに情報を追加
  var enemyField = document.getElementById('enemyModal-content');
  var enemyButton = document.createElement('button');
  enemyButton.innerText = enemyName;
  // ボタン要素にIDを設定
  enemyButton.id = "bossButton";
  enemyButton.onclick = enemyButtonClickHandler;
  enemyField.appendChild(enemyButton);
};

//配列内の重複を調べる関数
function extractUniqueValues(array) {
  // 重複を取り除いたユニークな値を格納するための新しい配列
  const uniqueValues = [];
  // 与えられた配列の各要素に対して処理を行う
  array.forEach(element => {
    // 要素が新しい配列にすでに含まれていないか確認する
    if (array.indexOf(element) === array.lastIndexOf(element)) {
      // 新しい配列に現在の要素を追加する
      uniqueValues.push(element);
    }
  });
  // ユニークな値のみを含む新しい配列を返す
  return uniqueValues;
}

 //敵が複数体の場合、ABCを割り当てる関数
function getEnemiesName(enemyName) {
  var counter = 0;
  var id = "";
  var buttonContents = document.querySelectorAll('#enemyModal-content button');
  buttonContents.forEach(function (button) {
    if (button.innerText == enemyName + "A" || button.innerText == enemyName + "B") {
      counter++;
    }
  });
  if (counter == 1) {
    id = "B";
  } else if (counter == 2) {
    id = "C";
  } else {
    id = "A";
  };
  return id;
};

//敵の攻撃力を元にこちらへのダメージを計算する関数
function enemyDamageCalculate(enemyIndex) {
  var query = "";
  if (bossFlg) {
    query = ".boss";
  } else {
    query = '.enemy' + enemyIndex;
  }
  var damage = parseInt(document.querySelector(query).dataset.attack);
  // 1から5までのランダムな整数を生成
  var randomNumber = Math.floor(Math.random() * 5) + 1;
  // 50%の確率でランダムな整数を足すか引くかを決定
  var operation = Math.random() < 0.5 ? 1 : -1;
  // ランダムな整数を足すか引くかを計算
  damage = damage + (randomNumber * operation);
  //0以下の場合は0で固定
  if (damage < 1) {
    damage = 0;
  } 

  return damage;
}

//こちらのダメージを算出する関数
function heroDamageCalculate() {
  var damage = hero.attack
  // 1から5までのランダムな整数を生成
  var randomNumber = Math.floor(Math.random() * 5) + 1;
  // 50%の確率でランダムな整数を足すか引くかを決定
  var operation = Math.random() < 0.5 ? 1 : -1;
  // ランダムな整数を足すか引くかを計算
  damage = damage + (randomNumber * operation);
  //0以下の場合は0で固定
  if (damage < 1) {
    damage = 0;
  } 

  return damage;
}

//かいふく魔法
async function healMagic() {
  document.getElementById("magicModal").style.display = "none";
  document.getElementById("enemyModal").style.display = "none";
  closeModal();
  var msgText = "";

  if (hero.mp < 5) {
    msgText = "MPがたりない！"
    await displayTextAndWait(msgText, textContainer);
    showModal();
    return;
  }

  if (hero.hp == hero.maxHp) {
    msgText = "しかし" + hero.name + "のHPはすでにまんたんだった！"
    await displayTextAndWait(msgText, textContainer);
    showModal();
    return;
  };

  var point = 30;
  // 1から5までのランダムな整数を生成
  var randomNumber = Math.floor(Math.random() * 5) + 1;
  // 50%の確率でランダムな整数を足すか引くかを決定
  var operation = Math.random() < 0.5 ? 1 : -1;
  // ランダムな整数を足すか引くかを計算
  point = point + (randomNumber * operation);
  msgText = hero.name + "はかいふくじゅもんをとなえた！"

  if (hero.hp + point > hero.maxHp) {
    msgText += hero.name + "のHPが" + (hero.maxHp - hero.hp) + "かいふくした！"
    hero.hp = hero.maxHp
  } else {
    msgText += hero.name + "のHPが" + point + "かいふくした！"
    hero.hp += point;
  }
  document.getElementById("hp1").innerText = hero.hp;

  hero.mp -= 5;
  document.getElementById("mp1").innerText = hero.mp;

  await displayTextAndWait(msgText, textContainer);
  processBattle('magic');
}