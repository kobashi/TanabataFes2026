# Cloudflare Tunnel 運用

学内のローカルサーバを、Cloudflare 経由で学外に公開するための手順です。

この構成では、外向きの通信だけで公開できます。ルーターのポート開放や固定グローバルIPは不要です。

## 構成

```text
利用者端末 -> Cloudflare -> cloudflared -> Caddy -> Nodeアプリ
```

このリポジトリでは Caddy の切り替え運用があるため、Cloudflare Tunnel は Caddy に向けるのがいちばん扱いやすいです。

## 前提

- Cloudflare で管理しているドメインがあること
- 公開したいサーバーPCで `cloudflared` を動かせること
- このアプリがローカルで起動していること
- `data/` が永続化されていること

## 推奨ポート構成

- Caddy: `127.0.0.1:3000`
- Node: `127.0.0.1:3001` または `127.0.0.1:3002`

Cloudflare Tunnel は `http://127.0.0.1:3000` に向けます。

## 1. Node と Caddy を起動する

Node は `.env` の `PORT` を `3001` か `3002` にして起動します。

```sh
npm start
```

Caddy を起動します。

```sh
npm run proxy:start
```

## 2. cloudflared を用意する

`cloudflared` をインストールして、Cloudflare にログインします。

```sh
cloudflared tunnel login
```

## 3. tunnel を作る

```sh
cloudflared tunnel create tanabata-fes-2026
```

作成後に出る tunnel UUID と credentials ファイルの場所を控えます。

## 4. DNS を tunnel に向ける

公開したいホスト名を tunnel に割り当てます。

```sh
cloudflared tunnel route dns tanabata-fes-2026 tanabata.example.com
```

`tanabata.example.com` は実際に使うサブドメインに置き換えます。

## 5. 設定ファイルを置く

`cloudflared/config.yml.example` を参考に、`~/.cloudflared/config.yml` を作ります。

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /Users/you/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: tanabata.example.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

## 6. tunnel を起動する

```sh
cloudflared tunnel run tanabata-fes-2026
```

これで外部からは `https://tanabata.example.com` でアクセスできます。

## 管理画面の扱い

このアプリは `ADMIN_KEY` でも管理画面を守れますが、学外公開するなら Cloudflare Access を併用するとより安全です。

最低限でも次を守ると安心です。

- `ADMIN_KEY` を推測されにくい値にする
- `HOST` は `127.0.0.1` のままにして、外部には直接待ち受けない
- `data/` を定期バックアップする

## 既存運用との関係

- 公開経路だけ Cloudflare に置き換え、アプリ本体のロジックは変えません
- Node の切り替えはこれまで通り `npm run proxy:switch` でできます
- 投影用端末や管理用端末は、Cloudflare の公開URLを開きます

## トラブル確認

- つながらない場合: `cloudflared` が起動しているか、DNS が tunnel に向いているか確認します
- 画面が古い場合: Caddy とブラウザを再読み込みします
- 管理画面だけ危ない場合: Cloudflare Access で `/admin` を保護します

