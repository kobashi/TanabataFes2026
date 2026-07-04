# Operations Digest

当日運用で見る短縮版です。詳しい説明は `docs/OPERATIONS.md` を参照してください。

## 現在の構成

```text
学内端末 -> http://サーバーIP:3000 -> Caddy -> Nodeアプリ
学外端末 -> TryCloudflare URL -> cloudflared -> Caddy -> Nodeアプリ
```

学内向けURLは `http://サーバーIP:3000` です。TryCloudflare でテスト公開する場合も、`cloudflared` は Caddy の `http://127.0.0.1:3000` に向けます。

Nodeアプリ本体は `.env` の `PORT` で起動し、Caddyの転送先を切り替えます。Node は `3000` では起動しません。

基本のポート割り当て:

- Caddy公開口: `127.0.0.1:3000`
- Node候補: `127.0.0.1:3001` と `127.0.0.1:3002`
- Caddyが向いている側が運用中Node、反対側が次の開発用Node

要点:

- コードは本番・開発で共通
- 実行プロセスは別
- データは `data/` と `data/dev/` に分ける
- 切り替えは `npm run dev` と `npm run proxy:switch` の組み合わせ

## 起動

`.env` を用意します。雛形は [`.env.example`](../.env.example) です。Caddyを使う場合、Nodeは `3001` または `3002` で起動します。

例:

```env
HOST=127.0.0.1
PORT=3001
ADMIN_KEY=change-me
```

Node を起動します。

```sh
npm start
```

Caddy を別ターミナルで起動します。既定では `127.0.0.1:3001` の運用中Nodeへ向きます。

```sh
npm run proxy:start
```

Codexやターミナルを更新・終了すると、そのターミナルから前景起動したNode/Caddyは停止する可能性があります。本番相当のプロセスは、作業用ターミナルに依存させず別ターミナルやプロセスマネージャで管理します。

APIキーは `.env` に書きます。`data/settings.json`、ブラウザ、Git管理ファイルには保存しません。

願い事バックアップは管理画面の「バックアップ」タブから作成・復元できます。復元時は現在の願い事が自動で `before-restore` バックアップされます。

投影設定プリセットは管理画面の「投影設定」タブで3枠まで保存・読込・クリアできます。保存済みか未保存かはプリセットカードで確認します。

投影画面の月をクリックすると隠しメニューが開き、短冊配置、短冊フォント、短冊フォントサイズ、笹舟サイズ、笹舟下端オフセットを1件だけ保存・呼び出しできます。この設定は投影端末ブラウザの `localStorage` に保存されます。フォントは端末内蔵フォントと、選択時に読み込む同梱縦書きフォントを併用します。

管理画面の投影設定では、視差3D関連の項目だけが短いデバウンス後に即時プレビューされます。対象は視差ON/OFF、消失点マーカー、笹舟移動モード、左右移動倍率、前後/上下移動倍率、短冊奥行倍率、奥行基準順、鑑賞地点の左右/上下/距離、投影面余白、消失点X/Yです。短冊奥行は画面上Y位置ではなくz順だけから作られます。総スロット数、表示数、ローテーション間隔、風、雲、天の川演出などは、従来通り「適用」を押すまで投影画面へ反映されません。風は、短冊揺れ強度、突風強度、突風周期を調整できます。天の川演出は、明るさ、きらめき、強い瞬き、変化速度、粒子数、強い瞬き割合、瞬き周期分散、瞬き強度分散、ベガ/アルタイルの呼応強度、位相差、周期を調整できます。

投影画面は願い事、投影設定、流星群演出の更新をServer-Sent Eventsで受け取ります。SSEが切れても従来のポーリングで復旧するため、通常運用では画面を再読み込みせずに反映されます。

## 確認

```sh
npm run check
npm run smoke:prod
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

ブラウザで確認するURL:

- 投稿: `http://サーバーIP:3000/`
- 管理: `http://サーバーIP:3000/admin`
- 投影: `http://サーバーIP:3000/projection`

## 新バージョンへ切り替え

現在のNodeを止めずに、開発用Nodeを反対側ポートで起動します。初回が `3001` 運用なら `3002` 開発、`3002` へ切り替えた後の次回は `3001` 開発です。

テスト投稿や承認操作を確認する場合は、まず開発テスト用の管理キーを指定して隔離データで起動します。このテスト投稿は `data/dev/` に入り、本番の `data/wishes.json` には混ざりません。
隔離モードの設定は `data/dev/settings.json` に入るため、本番の `data/settings.json` には自動反映されません。

```sh
ADMIN_KEY=開発テスト用キー npm run dev:isolated
npm run smoke:dev
```

隔離テストが終わったら一度止め、切り替え用に通常の開発Nodeを起動します。通常の開発Nodeは切り替え後にそのまま本番にするため `data/` を使います。ここでは投稿や管理操作の書き込みテストをしません。
隔離モードで試した投影設定や投影設定プリセットは、通常の開発Nodeを起動した後に管理画面で同じ値を設定し直します。

```sh
npm run dev
npm run smoke:dev
npm run proxy:switch -- 127.0.0.1:3002
npm run smoke:prod
```

次回は `3001` 側へ切り替えます。

```sh
npm run dev
npm run smoke:dev
npm run proxy:switch -- 127.0.0.1:3001
npm run smoke:prod
```

`npm run proxy:switch` は Caddy が起動済みのときだけ使えます。`connect: connection refused` が出たら、先に `npm run proxy:start` を実行します。
Caddy の向きを切り替えた後は、投影画面 `/projection` と管理画面 `/admin` を再読み込みします。

本番Nodeだけ再起動したい場合も、現在のNodeを直接止めずに同じ切り替え手順を使います。`cat data/proxy-state.json` で現在の `activeUpstream` を確認し、反対側を `npm run dev` で起動して `smoke:dev`、`proxy:switch`、`smoke:prod` の順に進めます。

確認後、旧Nodeを停止します。

```sh
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill PID
```

`3002` から `3001` へ戻す場合は、ポート番号を逆にしてください。

## 切り戻し

旧Nodeがまだ動いている場合:

```sh
npm run proxy:switch -- 127.0.0.1:3001
npm run smoke:prod
```

`npm run proxy:switch` で `connect: connection refused` が出た場合だけ、先に `npm run proxy:start` で Caddy を起動します。

## 停止

公開を止める場合はCaddyを停止します。

```sh
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill PID
```

Node本体を止める場合:

```sh
lsof -nP -iTCP:3001 -sTCP:LISTEN
lsof -nP -iTCP:3002 -sTCP:LISTEN
kill PID
```

## バックアップ

作業前に実行します。

```sh
npm run backup
```

バックアップは `data/backups/` に作られ、Gitには登録しません。

## AIモデレートの挙動

管理画面で `AI自動モデレート` を選びます。`OPENAI_API_KEY` が未設定の場合、このモードは選べません。

- 明らかに問題なし: `approved`
- OpenAI Moderation APIでflagged: `rejected`
- 連絡先、SNS ID、URL、個人情報、強い表現、検索避け、悪戯表現、AIスコア高め: `pending`
- API失敗、タイムアウト: `pending`
迷う投稿は自動承認せず、人間が確認する運用です。

## 学外公開

Cloudflare を使う場合は、`cloudflared -> Caddy -> Node` の順でつなぎます。詳しい手順は [Cloudflare Tunnel 運用](CLOUDFLARE_TUNNEL.md) を参照してください。

TryCloudflare のランダムドメインでテストする場合:

```sh
cloudflared tunnel --url http://127.0.0.1:3000
```

表示された `https://...trycloudflare.com` を学外端末から開きます。Caddy を使わず Node 直で試す場合は、Node のポートに合わせて `--url http://127.0.0.1:3002` のように指定します。

`/admin` は公開URLのまま運用できます。追加のAccess保護は入れず、`ADMIN_KEY` を厳重に管理します。

## よくあるエラー

- `connect: connection refused` at `127.0.0.1:2019`: Caddy が起動していない。先に `npm run proxy:start` を実行する。
- `bind: address already in use`: Node と Caddy が同じ `3000` を使っている可能性がある。Node は `3001` または `3002` にする。
- `502 Bad Gateway`: Caddy の向き先と Node のポートが違う。`TANABATA_UPSTREAM=127.0.0.1:3002 npm run proxy:start` で起動するか、`npm run proxy:switch -- 127.0.0.1:3002` で切り替える。
