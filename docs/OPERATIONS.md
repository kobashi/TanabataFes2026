# Operations

短縮版だけ見たい場合は `docs/OPERATIONS_DIGEST.md` を参照してください。

## ローカル起動

`.env` を用意して `npm start` を実行します。

```sh
npm start
```

`.env` の雛形は [`.env.example`](../.env.example) です。`HOST`、`PORT`、`ADMIN_KEY`、`OPENAI_API_KEY` などを入れておくと、そのまま起動できます。

大学構内WiFiからアクセスする場合は、サーバーPCのIPアドレスを使って各端末から開きます。

## 画面URL

- 投稿画面: `http://サーバーIP:3000/`
- 管理画面: `http://サーバーIP:3000/admin`
- 投影画面: `http://サーバーIP:3000/projection`
- ヘルスチェック: `http://サーバーIP:3000/api/health`

## 当日の基本運用

1. `.env` に `ADMIN_KEY` を書いて `npm start` で起動する。
2. 投影用PCまたはブラウザで `/projection` を全画面表示する。
3. 管理者は `/admin` を開き、管理キーを入力する。
4. 管理画面で承認モードを選ぶ。
5. 利用者は投稿画面から願い事を投稿する。
6. 手動確認モードでは管理者が内容を確認して承認する。自動承認モードでは投稿直後に投影対象になる。
7. AI自動モデレートではAI判定で問題なしの場合に承認され、flaggedの場合は非表示になる。判定に失敗した場合は手動確認待ちになる。
8. 承認済みの願い事が投影画面に表示される。

## データ保存

- 願い事は `data/wishes.json` に保存される。
- `data/wishes.json` が存在しない場合は、サーバー起動時に自動作成される。
- このファイルは投稿内容を含むため、GitHubには登録しない。
- 承認モードは `data/settings.json` に保存される。このファイルにAPIキーは保存しない。

## 自動承認とAIモデレート

管理画面の承認モードで、投稿時の扱いを切り替えられる。

- 手動確認: 新規投稿は `pending` になり、管理者が承認する。
- 自動承認: 新規投稿はすぐ `approved` になり、投影対象になる。
- AI自動モデレート: OpenAI Moderation APIとローカルの慎重ルールで判定する。flaggedなら `rejected`、問題が見つからず慎重ルールにも当たらなければ `approved`、判断に迷うものやAPI失敗時は `pending` になる。

安全寄りの手動確認対象:

- メールアドレス、電話番号、URL
- SNS IDや外部連絡先らしき内容
- 住所、電話、連絡先、本名、学籍番号など個人情報らしき内容
- 名指し攻撃や強い表現の可能性がある内容
- しね、タヒね、し ね のような検索避けやネット記法を含む内容
- 悪戯や下品な表現の可能性がある内容
- OpenAI Moderation APIでflaggedではないがカテゴリスコアが高めの内容

AI自動モデレートを使う場合、`.env` に `OPENAI_API_KEY` と `OPENAI_MODERATION_MODEL` を書く。

注意:

- `OPENAI_API_KEY` はブラウザへ返さない。
- `data/settings.json` には承認モードだけを保存し、APIキーは保存しない。
- `OPENAI_API_KEY` を設定していない場合、管理画面ではAI自動モデレートを選べない。
- APIエラーやネットワーク断のときは自動で承認せず、手動確認待ちに戻す。
- `MODERATION_REVIEW_SCORE_THRESHOLD` でAIカテゴリスコアの手動確認しきい値を変更できる。未指定時は `0.25`。

## 保守運用

運用中に開発を続ける場合は、変更の種類で扱いを分ける。

- `public/` 配下のHTML、CSS、JS変更: サーバー再起動は不要。ブラウザを再読み込みすると反映される。
- `server.js` 変更: Nodeプロセスの再起動が必要。利用者向けURLを維持したまま完全に無停止で切り替えるには、手前にリバースプロキシまたはプロセスマネージャを置く。
- `data/wishes.json` は本番データとして扱い、編集前と切り替え前に必ずバックアップする。
- `.env` を変えた場合: Nodeプロセスを再起動する。

### 日常確認

```sh
npm run check
npm run backup
npm run smoke
```

`npm run backup` は `data/backups/` に現在の `wishes.json` をコピーする。バックアップファイルはGitHubへ登録しない。

`npm run smoke` は `TARGET` と `ADMIN_KEY` を一時的に上書きできる。ふだんは `.env` の値を使う。

### 止めずに開発する手順

前提のポート割り当て:

- Caddy公開口: `127.0.0.1:3000`
- Node候補: `127.0.0.1:3001` と `127.0.0.1:3002`
- Caddyが向いている側が運用中Node、反対側が次の開発用Node

手順:

1. 現在の Caddy と運用中Nodeはそのまま動かす。
2. 作業前に `npm run backup` を実行する。
3. コード変更後に `npm run check` を実行する。
4. 開発用サーバーは `npm run dev` で起動する。Caddyの現在の転送先を記録した `data/proxy-state.json` を見て、反対側のポートを自動で選ぶ。
5. 別ターミナルで `npm run smoke:dev` を実行し、開発用サーバーを確認する。
6. 問題なければ、Caddyの転送先だけを開発用Nodeへ切り替える。初回が `3001 -> 3002` なら `npm run proxy:switch -- 127.0.0.1:3002`、次回は `3002 -> 3001` なので `npm run proxy:switch -- 127.0.0.1:3001`。
7. 公開URLを `npm run smoke:prod` で確認する。
8. 切り戻す場合は Caddy の転送先を直前の運用中Nodeへ戻す。

`npm run dev` で起動する開発用Nodeは、切り替え後にそのまま本番になる前提なので `DATA_DIR=data` を使う。投稿や承認など、データを書き換える操作テストはここでは行わない。

### テスト投稿を本番に混ぜない手順

投稿、承認、削除、モード変更などデータを書き換える確認をしたい場合は、隔離データで起動する。

```sh
npm run dev:isolated
npm run smoke:dev
```

この状態では `DATA_DIR=data/dev` を使うため、テスト投稿は `data/dev/wishes.json` に保存され、本番の `data/wishes.json` には混ざらない。
同じく設定も `data/dev/settings.json` に保存されるため、隔離モードで変更した承認モードや投影設定は、本番用の `data/settings.json` には自動反映されない。

隔離テストで問題がなければ、隔離サーバーを停止し、昇格候補として通常の開発用Nodeを起動し直す。

```sh
npm run dev
npm run smoke:dev
```

この通常の `npm run dev` は `DATA_DIR=data` を使う。ここでは投稿テストをせず、画面表示、ヘルスチェック、承認済み一覧、管理画面の読み取り確認までに留める。問題なければ Caddy の転送先だけを切り替える。

隔離モードで試した投影設定を運用へ反映したい場合は、通常の `npm run dev` を起動した後、管理画面から同じ値を設定し直す。`data/dev/settings.json` を `data/settings.json` に丸ごとコピーすると `moderationMode` なども一緒に変わる可能性があるため、当日運用では管理画面から再設定する。

Caddy の向きを切り替えた後は、投影画面 `/projection` と管理画面 `/admin` をブラウザで再読み込みする。既に開いている画面は古い JavaScript のまま動き続けることがある。

### サーバー変更を完全無停止に近づける構成

本番URLを `:3000` のまま固定したい場合は、Nodeサーバーを直接公開せず、手前にリバースプロキシを置く。

- 現行Node: `127.0.0.1:3001` または `127.0.0.1:3002`
- 新Node: 現行Nodeではない側のポート
- 公開URL: プロキシが `http://サーバーIP:3000` で受け、転送先だけを切り替える。

この構成にすると、新バージョンを裏で起動して `npm run smoke:dev` で確認してから公開先だけを変更できる。`npm run proxy:switch` が現在の転送先を記録するため、次の `npm run dev` は自動的に反対側のポートを使う。SSE接続中の管理画面は切り替え時に再接続することがあるため、管理者は画面上の状態を確認する。

## Caddy リバースプロキシ運用

Caddyを使う場合、利用者端末には常に `http://サーバーIP:3000` を案内し、Nodeアプリはローカル専用ポートで起動する。Caddyが未導入の場合は、macOSではHomebrewでインストールできる。

```sh
brew install caddy
```

Caddyfileを検証する。

```sh
npm run proxy:validate
```

Node側は `.env` に `HOST=127.0.0.1` と `PORT=3001` または `PORT=3002` のように書いて起動する。Caddy が `3000` を使うため、Node は `3000` では起動しない。

別ターミナルでCaddyを起動する。

```sh
npm run proxy:start
```

Node を `3001` 以外で起動している場合は、起動時に `TANABATA_UPSTREAM` を明示します。

```sh
TANABATA_UPSTREAM=127.0.0.1:3002 npm run proxy:start
```

`TANABATA_UPSTREAM` と `TANABATA_PROXY_PORT` を一時上書きすると、Caddyの向き先だけ変えられる。

`npm run proxy:switch -- 127.0.0.1:3002` は、Caddy がすでに起動しているときだけ使う。`connect: connection refused` が出る場合は、先に `npm run proxy:start` を実行する。すでに Caddy が動いている状態で `npm run proxy:start` をもう一度実行すると、`3000` の取り合いで失敗することがある。

### 新バージョンへ切り替える

1. 現行の Node は動かしたまま、`npm run dev` で反対側ポートに開発用Nodeを起動する。
2. 新バージョンを確認する。

```sh
npm run smoke:dev
```

3. Caddyの転送先を開発用Nodeに切り替える。Caddy が止まっている場合だけ、先に `npm run proxy:start` で起動する。

```sh
npm run proxy:switch -- 127.0.0.1:3002
```

次回は反対向きになるため、例は次のようになる。

```sh
npm run proxy:switch -- 127.0.0.1:3001
```

4. 公開URLを確認する。

```sh
npm run smoke:prod
```

5. 問題なければ、切り替え前に運用していた旧Nodeを停止する。

切り戻す場合は次を実行する。Caddy が止まっている場合だけ、先に `npm run proxy:start` で起動する。

```sh
npm run proxy:switch -- 127.0.0.1:3001
```

### 注意

- Caddyを `:3000` で起動するため、Nodeアプリ本体は `3000` では起動しない。
- `proxy:switch` は Caddy の管理API `127.0.0.1:2019` に設定を送る。`connect: connection refused` の場合は Caddy が起動していない。
- 管理画面のSSE接続は切替時に再接続されることがある。
- `Caddyfile` の `auto_https off` は構内WiFiのHTTP運用向け設定。公開サーバーで運用する場合はHTTPS構成に変更する。
- `.env` を更新したら、Nodeプロセスを再起動して反映する。

## トラブル確認

- 投稿できない場合: サーバーが起動しているか、同じWiFiに接続しているか、URLのIPアドレスが正しいか確認する。
- 管理画面が更新されない場合: 管理キーが正しいか確認する。SSEが切れても30秒ごとに再取得する。
- 投影画面に出ない場合: 願い事が承認済みか確認する。
- 文字が崩れる場合: ブラウザの拡大率を100%にし、投影画面を再読み込みする。

## 公開サーバー運用へ進める場合

- Node.js 20以上が必要。
- `PORT` と `ADMIN_KEY` を `.env` に書けること。
- `data/` または同等の永続ストレージが必要。
- HTTPS化、管理画面のアクセス制限、バックアップを用意する。
- 無料ホスティングを使う場合、スリープや永続ディスク制限に注意する。
- 学内ローカルサーバをそのまま外向き公開したい場合は、[Cloudflare Tunnel 運用](CLOUDFLARE_TUNNEL.md)を使うとルーターのポート開放なしで公開できる。
- `/admin` を公開のまま使うなら、`ADMIN_KEY` を強固にし、URLの共有範囲を絞る。
