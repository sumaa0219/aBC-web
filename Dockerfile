FROM node:20-slim

# 必要最小限のパッケージのみインストール
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# ワークスペースディレクトリを作成
RUN mkdir -p /app
COPY ./ /app
WORKDIR /app

# yarnと依存関係をインストール
RUN yarn install

# タイムゾーンを設定
ENV TZ=Asia/Tokyo
CMD [ "yarn", "dev" ]