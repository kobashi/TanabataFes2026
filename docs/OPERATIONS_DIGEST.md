# Operations Digest

当日運用で見る短縮版です。詳しい説明は `docs/OPERATIONS.md` を参照してください。

## 現在の構成

```text
利用者端末 -> http://サーバーIP:3000 -> Caddy -> Nodeアプリ
```

公開URLは常に `http://サーバーIP:3000` です。Nodeアプリ本体は `.env` の `PORT` で起動し、Caddyの転送先を切り替えます。

## 起動

`.env` を用意して `npm start` を実行します。雛形は [`.env.example`](../.env.example) です。

```sh
npm start
```

APIキーは `.env` に書きます。`data/settings.json`、ブラウザ、Git管理ファイルには保存しません。

## 確認

```sh
npm run check
npm run smoke
```

ブラウザで確認するURL:

- 投稿: `http://サーバーIP:3000/`
- 管理: `http://サーバーIP:3000/admin`
- 投影: `http://サーバーIP:3000/projection`

## 新バージョンへ切り替え

現在のNodeを止めずに、新バージョン用の `.env` の `PORT` を `3002` に変えて起動します。

```sh
npm start
TARGET=http://127.0.0.1:3002 npm run smoke
npm run proxy:switch -- 127.0.0.1:3002
TARGET=http://127.0.0.1:3000 npm run smoke
```

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
npm run smoke
```

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

`/admin` は公開URLのまま運用できます。追加のAccess保護は入れず、`ADMIN_KEY` を厳重に管理します。
