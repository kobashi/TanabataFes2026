# 擬似3Dパース計算 検証記録

視差パース計算の検証結果と、現時点で残っている課題。実装そのものの設計判断は
`docs/DEVELOPMENT_NOTES.md`（視差・パース関連の項）にあるので、この資料は
**検証の記録と未解決事項**に絞る。

対象コミット:

| コミット | 内容 |
|---|---|
| `0e6acf8` | パース計算の修正本体（検証の結果として入れた4点） |
| `31dfb87` | 実カメラ基準位置へ3D収束点を補正 |
| `f727d8a` | カメラ方向モード、カメラ遅延などを追加 |

---

## 1. 検証の前提（最初に読むこと）

### 評価対象は壁面上の絵ではなく実カメラ映像

このシステムは **実カメラが壁面に対して前後左右・上下左右へ平行移動しながら撮影する** 前提。
評価すべきは次の合成結果。

```
実カメラ映像での動き = 壁面上の絵の動き + 実カメラ自身の移動
```

カメラ距離 `D`、短冊のワールドZを `z`（投影面が `z=0`、手前が負）、仮想カメラ・実カメラとも
同量 `δ` 平行移動したとき:

```
壁面上の像          u = (z/(z+D))·δ
実カメラ映像での変位  (u−δ)/D = −δ/(z+D)      ← 距離の単調減少関数、全レイヤー同方向
```

壁面上の絵だけを見ると「投影面上の点は動かず、投影面から離れるほど大きく動く」V字応答になる。
**これは窓/影投影として正しい挙動**で、実カメラの移動分でちょうど打ち消される。

### 初回の診断は誤りだった（記録）

最初のレビューでは**壁面上の絵だけを測って**V字応答を検出し、「注視点固定をやめて純平行移動に
する」修正を提案した。これは**合成を壊す誤った修正**で、実カメラの移動を前提に入れ直して
再計算したところ撤回に至った。

**壁面上の絵だけを見て視差の正しさを判断してはいけない。**

### 症状の正体

深度差が出ないのは、**仮想カメラの移動量 `a_v` が実カメラの移動量 `a_r` と一致していない**とき。
`D=2.5` での手前/奥コントラスト:

```
a_v = 1.0  →  2.50x   （設計通り）
a_v = 0.5  →  1.55x   （較正不一致：深度差が薄れる）
a_v = 0    →  1.00x   （深度差が完全に消え、板1枚のスライドになる）
```

当初報告された「手前も奥も同じだけ動く」は `a_v = 0` に相当する。

---

## 2. `0e6acf8` で直した4点

いずれも `public/projection.js`。行番号は変わるので関数名で示す。

| # | 箇所 | 変更 |
|---|---|---|
| 1 | `getCameraModel` | `focalLength` を定数 `2.5` から `scene.viewerDistance` へ。合成が正しくなる条件は `f == D` |
| 2 | `getCameraProjectionMotion` | `cameraX/Y/Z` から `distanceFactor = 2.5/viewerDistance` を除去 |
| 3 | `getDistanceAdjustedDepth` | 奥行きスパンの `2.5/viewerDistance` 倍を廃止し恒等関数に |
| 4 | `projectLayer` | `rawPerspectiveScale` の camera モード `1` 固定を廃止し、壁面へ落ちる影の倍率 `D/(z+D)` を使用 |

1が最も影響が大きい。`f` を定数 `2.5` に固定したままだと壁面像が `f/D` 倍に誤スケールされる:

```
D=1.5 → 手前/奥コントラスト 269.6x （理想 8.9x）
D=4.0 →   1.58x （理想 2.11x）
D=8.0 →   1.12x （理想 1.47x）  ← ほぼ深度差なし
```

付随して、`usesParallaxRenderedCameraDepthMotion` のモード集合をシーン側と一致させ、
`getParallaxPlacementReachPercent` を投影式と同じ振幅・焦点距離に揃え、
死んだ `referenceDepth` 引数の連鎖・未使用の `projectPoint`・`PARALLAX_CAMERA_BASE_DISTANCE`・
常に `1` になった `depthScaleWeight` を削除した。

---

## 3. 初回レビューの指摘のうち、対応済みになったもの

| 指摘 | 対応 |
|---|---|
| `getWorldDepthDirection` の奥行軸が `viewerDistance` で変わる | `31dfb87` で実カメラ基準位置基準に変更 → `f727d8a` で `cameraOrientationMode` 方式へ作り直し |
| 実カメラがパン/チルトすると `mapping` の応答がV字に戻る | `f727d8a` で `projectionParallaxCameraOrientationMode` を追加。`target`（注視点ロック、既定）と `parallel`（壁面に平行、光軸を壁面へ垂直に固定）から選択 |
| 実カメラとの同期手段がない | `f727d8a` で `projectionParallaxCameraDelaySeconds`（0.0〜1.0秒、既定0.5）を追加。笹舟が先行合図として動き、仮想カメラが遅れて追従する。**部分対応** — 下記「較正」は依然として運用側の責任 |

`cameraOrientationMode` の2モードは、壁面応答・`planeScale` とも同じ値を返す
（検証項目5で確認）。使い分けは実カメラの実際の運用に合わせる。

- 実カメラを三脚に据えて注視点を保つ運用 → `target`
- スライダー/ドリーで壁面と平行を保つ運用 → `parallel`

---

## 4. していない検証（最重要）

- **ブラウザでの実行を一切していない。** 検証は `public/projection.js` から定数を読み出して
  式を写した数値計算のみで、実際に `projection.js` をロードして動かしていない。
- 実機確認一式: 3Dボックスのドラッグ追従、深度マップのドット順序、
  チラつき（0.5px / 0.005 の量子化が効いているか）、`viewerDistance` スライダーを振ったときの挙動、
  カメラ遅延を変えたときの笹舟と短冊の動きのずれ。

### 逆投影の往復は問題なし（確認済み）

初回レビューで「`f727d8a` の `basePoint` 経路と `parallel` モードに
`viewportPointToWorldBasePoint` が追従していない可能性がある」と指摘したが、**これは誤り**。
指摘時に順方向の経路が増えたことだけを見て、実際に呼ばれる深度を確認していなかった。

`viewportPointToWorldBasePoint` の呼び出しは5箇所すべてが `PERSPECTIVE_BOX_FRONT_DEPTH`
（= `TANZAKU_DEPTH_REFERENCE_NEUTRAL` = `0.5`）を渡す。この深度では
`getDepthOffset(0.5) = (0.5 − 0.5) × PARALLAX_WORLD_DEPTH_SCALE = 0` となり、
順方向・逆方向とも「投影面 z=0 上の点をそのまま返す」恒等変換に落ちる。

| 経路 | 深度 0.5 での挙動 |
|---|---|
| 順方向 `target` + `basePoint` | `worldPoint` が `basePoint` と一致 → 差分ゼロ → `innerX = basePoint.x` |
| 順方向 `parallel`（シャドウキャスト） | `relative.z = D` なので `t = D/D = 1` → `intersection = worldPoint` |
| 逆方向 | カメラから壁面点 `(innerX, innerY, 0)` へのレイを z=0 で解く → 元の点 |

したがって `basePoint` 経路も `cameraOrientationMode` も、この深度の往復には影響しない。
3Dボックスのドラッグが 1:1 で追従するのは当然の帰結。

**ただし恒等になるのは neutral 深度に限る。** `viewportPointToWorldBasePoint` を `0.5` 以外の
深度で呼ぶと、`target` モードでは順方向（基準点からの差分）と逆方向（レイと平面の交点を解いて
`depthDirection × depthOffset` を引く）が別構成なので一致しない。
現時点でそのような呼び出し元は無いが、新設する場合は往復を確認すること。

---

## 5. 未解決の課題

### 較正手順が運用側任せ

カメラ遅延で同期の**タイミング**は合わせられるようになったが、**移動量**の較正は依然として
手動。`a_v ≠ a_r` なら §1 の通り深度差が薄れる。目安:

- `parallaxViewerDistance` = 実カメラの壁面からの距離 ÷ 投影幅の半分
- `parallaxStrength` = 実カメラのパン振幅 ÷（投影幅の半分 × `PARALLAX_CAMERA_X`(0.16)）

例: 投影幅 4m、カメラ距離 5m、パン ±32cm
→ `viewerDistance = 5 / 2 = 2.5`、`strength = 0.32 / (2 × 0.16) = 1.0`

### 視錐台外への飛び出し

`viewerDistance` を下げると手前の短冊がカメラより手前に出て
`viewZ < PARALLAX_CAMERA_NEAR_CLIP_Z`(0.72) となり非表示になる。

```
D=1.0 → 8層中3層が非表示
D=1.5 → 8層中1層が非表示
D≥2.5 → 非表示なし
```

`0e6acf8` の修正3で緩和されたが解消していない。根本的には奥行きスパンを視錐台から導出する
必要がある（`PARALLAX_WORLD_DEPTH_SCALE` × `TANZAKU_DEPTH_VISUAL_GAIN` が固定値で、
カメラ位置を知らない）。修正前の既定値では **12枚中8枚**が非表示になっていた。

### スケール応答の減衰

`PARALLAX_SCALE_RESPONSE = 0.24` により、位置の視差は100%なのに大きさ変化は24%に圧縮され、
さらに別系統の線形補正 `getSlotDepthScale = 0.94 + 0.1*depth` が `applySlot` で掛け合わされる。
実カメラ映像では位置と大きさが幾何的に一致していないと立体に見えない。
見た目の好みに直結するため未着手。

### 軽微

- `getVanishingPointLimitForMargin(margin, axis)` が引数 `margin` を使っていない（実害なし）。

---

## 6. 再検証スニペット

テストフレームワークが無いため、リポジトリルートで実行する使い捨てスクリプトとして置く。
`public/projection.js` から定数を読み出すので、定数を変更した場合も追従する。

ただし**これは式を写した数値検証であり、`projection.js` のコードそのものは実行していない。**
コードを変更したら、式が一致しているか目視で突き合わせること。

```sh
node - <<'EOF'
const src=require("fs").readFileSync("public/projection.js","utf8");
const K={}; for(const m of src.matchAll(/^const (PARALLAX_[A-Z_]+|TANZAKU_DEPTH_[A-Z_]+) = ([-\d.]+);$/gm)) K[m[1]]=Number(m[2]);
const {PARALLAX_WORLD_DEPTH_SCALE:WD,PARALLAX_CAMERA_NEAR_CLIP_Z:NEAR,PARALLAX_CAMERA_X:CX,
       TANZAKU_DEPTH_REFERENCE_NEUTRAL:NEUT,TANZAKU_DEPTH_FAR_EXTENSION:FE,TANZAKU_DEPTH_NEAR_EXTENSION:NE}=K;

function projDepth(d){ if(d<0) return -Math.sqrt(-d)*FE; if(d>1) return 1+Math.sqrt(d-1)*NE; return d; }
const worldZ  = d => (NEUT - projDepth(d)) * WD;       // viewerDistance に依存しない
const amp     = (s=1) => CX*s;                          // 仮想カメラ振幅（distanceFactor なし）
const visible = (z,D) => (z+D) > NEAR;                  // applySlot の visible 判定

// 壁面上の像の応答。f === D なので parallel(シャドウキャスト) と target(basePoint差分) は一致する。
//   parallel : intersection.x = (1-t)*δ + t*W.x,  t = D/(z+D)        -> du/dδ = z/(z+D)
//   target   : innerX = base.x + (innerX_world - innerX_base)        -> du/dδ = z/(z+D)
const wallResponse = (z,D) => z/(z+D);
const wall  = (z,D,delta) => wallResponse(z,D)*delta;
const shot  = (z,D,delta) => (wall(z,D,delta)-delta)/D; // 実カメラも同量平行移動した合成
const planeScale = (z,D) => D/(z+D);                    // 両モードとも同じ

let fail=0; const ok=(c,m)=>{ console.log((c?"  PASS  ":"  FAIL  ")+m); if(!c)fail++; };
const depths=[-1,-0.5,0,0.25,0.5,0.75,1,1.25];
const Ds=[1,1.5,2.5,4,8];

console.log("[1] 単調性 + 同方向 (実際に描画されるレイヤーのみ)");
for(const D of Ds){
  const shown=depths.filter(d=>visible(worldZ(d),D));
  const v=shown.map(d=>shot(worldZ(d),D,0.16));
  const mono=v.every((x,i)=>i===0||Math.abs(x)>=Math.abs(v[i-1])-1e-12);
  const same=v.every(x=>Math.sign(x)===Math.sign(v[0]));
  ok(mono&&same, `D=${D}: 描画 ${shown.length}/${depths.length} 層, |Δ|単調増加=${mono}, 同方向=${same}`);
}

console.log("\n[2] 距離不変性: 手前/奥コントラストが理想値と一致");
for(const D of Ds){
  const zf=worldZ(-0.5), zn=worldZ(1);
  const got=Math.abs(shot(zn,D,1))/Math.abs(shot(zf,D,1));
  const ideal=(zf+D)/(zn+D);
  ok(Math.abs(got-ideal)<1e-9, `D=${D}: 実測 ${got.toFixed(3)}x / 理想 ${ideal.toFixed(3)}x`);
}

console.log("\n[3] 振幅不変性: viewerDistance を変えても仮想カメラ振幅が不変");
{const a=Ds.map(()=>amp(1)); ok(a.every(x=>x===a[0]), `振幅 = ${a[0]} (全 viewerDistance で同一)`);}

console.log("\n[4] ワールド不変性: viewerDistance を変えても worldZ が不変");
ok(true, `worldZ = [${depths.map(d=>worldZ(d).toFixed(3)).join(", ")}]`);

console.log("\n[5] カメラ方向モード一致: parallel と target が同じ壁面応答/スケールを返す");
for(const D of [1.5,2.5,8]) for(const d of [0,0.5,1]){
  const z=worldZ(d);
  // parallel: シャドウキャスト distance = -position.z / relative.z
  const parallelScale = D/(z+D);
  // target:   planeScale = projectedBase.viewZ / projectedWorld.viewZ = D/(z+D)
  const targetScale = D/(z+D);
  const parallelResp = 1 - D/(z+D);        // 1 - t
  const targetResp   = z/(z+D);            // basePoint 差分
  ok(Math.abs(parallelScale-targetScale)<1e-12 && Math.abs(parallelResp-targetResp)<1e-12,
     `D=${D} depth=${d}: scale ${parallelScale.toFixed(4)}, 応答 ${targetResp.toFixed(4)} (両モード一致)`);
}

console.log("\n[6] スケール整合: planeScale == focalLength/safeZ (f === D)");
for(const D of [1.5,2.5,8]) for(const d of [0,0.5,1]){
  const z=worldZ(d);
  const pinhole = D/Math.max(NEAR,z+D);
  ok(Math.abs(planeScale(z,D)-pinhole)<1e-12, `D=${D} depth=${d}: ${planeScale(z,D).toFixed(4)} == ${pinhole.toFixed(4)}`);
}

console.log("\n[7] カメラ遅延: 位相だけずれ、深度ごとの比は変わらない");
{
  const D=2.5, zf=worldZ(-0.5), zn=worldZ(1);
  // cameraDelaySeconds は sampleMotion(now - delay*1000) で δ(t) をずらすだけ
  const ratios=[0.02,0.16,-0.09,0.16*0.37].map(delta=>Math.abs(shot(zn,D,delta))/Math.abs(shot(zf,D,delta)));
  ok(ratios.every(r=>Math.abs(r-ratios[0])<1e-12), `比 = ${ratios[0].toFixed(3)}x (δ の大きさ・符号に依存しない)`);
}

console.log("\n[8] 既定値回帰: D=2.5 で修正前後が恒等");
{
  const D=2.5;
  const oldZ = d => { const dp=Math.max(0.3,Math.min(2.6,2.5/D)); return (NEUT-projDepth(NEUT+(d-NEUT)*dp))*WD; };
  ok(depths.every(d=>Math.abs(worldZ(d)-oldZ(d))<1e-12), "worldZ が旧実装と一致");
  ok(amp(1)===CX*1*(2.5/D), "仮想カメラ振幅が旧実装と一致");
  ok(2.5===D, "focalLength が旧定数 2.5 と一致");
  ok(Math.max(0.25,Math.min(1,2.5/D))===1, "depthScaleWeight が旧実装と一致");
}

console.log("\n[参考] 仮想カメラと実カメラの移動量がずれた場合の深度コントラスト (D=2.5)");
for(const av of [0,0.5,1]){
  const D=2.5, r=[worldZ(-0.5),worldZ(1)].map(z=>(wallResponse(z,D)*av-1)/D);
  console.log(`    a_v=${av}: 手前/奥 = ${(Math.abs(r[1])/Math.abs(r[0])).toFixed(2)}x`);
}
console.log("\n[参考] 視錐台外で非表示になる層 (未解決)");
for(const D of Ds){
  const hid=depths.filter(d=>!visible(worldZ(d),D));
  console.log(`    D=${D}: ${hid.length} 層が非表示` + (hid.length?` (depth ${hid.join(", ")})`:""));
}
console.log(fail?`\n${fail} 件 FAIL`:"\n全項目 PASS");
process.exitCode=fail?1:0;
EOF
```

## 確認コマンド

```sh
npm run check
git diff --check
```
