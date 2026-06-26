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

Node は `.env` の `HOST` を `127.0.0.1`、`PORT` を `3001` か `3002` にして起動します。Caddy が `3000` を使うため、Node は `3000` では起動しません。

```sh
npm start
```

Caddy を別ターミナルで起動します。Node が `3002` の場合は upstream を明示します。

```sh
TANABATA_UPSTREAM=127.0.0.1:3002 npm run proxy:start
```

## TryCloudflare で一時テストする

ランダムな `trycloudflare.com` ドメインで短時間テストする場合は、named tunnel の設定ファイルやDNS設定は不要です。

```sh
cloudflared tunnel --url http://127.0.0.1:3000
```

起動ログに表示される `https://...trycloudflare.com` を外部端末から開きます。

Caddy を挟まず Node 直で試す場合は、Node のポートに合わせます。

```sh
cloudflared tunnel --url http://127.0.0.1:3002
```

TryCloudflare はテスト用です。URLは毎回変わり、停止すると使えなくなります。

## named tunnel で固定URL公開する

固定のサブドメインで公開する場合は、以下の手順で named tunnel を使います。

### 1. cloudflared を用意する

`cloudflared` をインストールして、Cloudflare にログインします。

```sh
cloudflared tunnel login
```

### 2. tunnel を作る

```sh
cloudflared tunnel create tanabata-fes-2026
```

作成後に出る tunnel UUID と credentials ファイルの場所を控えます。

### 3. DNS を tunnel に向ける

公開したいホスト名を tunnel に割り当てます。

```sh
cloudflared tunnel route dns tanabata-fes-2026 tanabata.example.com
```

`tanabata.example.com` は実際に使うサブドメインに置き換えます。

### 4. 設定ファイルを置く

`cloudflared/config.yml.example` を参考に、`~/.cloudflared/config.yml` を作ります。

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /Users/you/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: tanabata.example.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

### 5. tunnel を起動する

```sh
cloudflared tunnel run tanabata-fes-2026
```

これで外部からは `https://tanabata.example.com` でアクセスできます。

## 管理画面の扱い

このアプリでは `/admin` は公開URLのまま運用できます。今回は Cloudflare Access で追加保護せず、アプリ側の `ADMIN_KEY` だけで管理します。

最低限でも次を守ると安心です。

- `ADMIN_KEY` を推測されにくい値にする
- `HOST` は `127.0.0.1` のままにして、外部には直接待ち受けない
- `/admin` のURLを不用意に共有しない
- `data/` を定期バックアップする
- Cloudflare 側では `/` と `/projection` を主な公開対象として扱い、`/admin` は同じ公開URLの一部として使う

## 既存運用との関係

- 公開経路だけ Cloudflare に置き換え、アプリ本体のロジックは変えません
- Node の切り替えはこれまで通り `npm run proxy:switch` でできます
- 投影用端末や管理用端末は、Cloudflare の公開URLを開きます

## トラブル確認

- つながらない場合: `cloudflared` が起動しているか、DNS が tunnel に向いているか確認します
- `cloudflared` は動いているが 502 になる場合: Caddy が起動しているか、Caddy の向き先と Node のポートが合っているか確認します
- `npm run proxy:switch` で `connect: connection refused` が出る場合: Caddy が起動していません。先に `npm run proxy:start` を実行します
- 画面が古い場合: Caddy とブラウザを再読み込みします
- TryCloudflare のURLが見つからない場合: `Your quick Tunnel has been created!` の直後に表示される `https://...trycloudflare.com` を確認します
