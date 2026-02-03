# BiliFinancerTrack

## 项目用途
自动跟踪指定 B 站财经 UP 主的最新视频/直播，完成音频转写与 AI 分析，生成结构化观点与日报，帮助节省观看时间。

## Docker 部署（使用已发布镜像）
镜像：`esunr/bili-finacer-track`

1) 新建 `docker-compose.yml`：
```yaml
services:
  bili-financer-track:
    image: esunr/bili-finacer-track:latest
    container_name: bili-financer-track
    restart: unless-stopped
    ports:
      - "8093:8093"
    environment:
      NODE_ENV: production
      NODE_PORT: "8093"
      IS_DOCKER: "TRUE"
      GROQ_SK: ${GROQ_SK}
      LLM_API_KEY: ${LLM_API_KEY}
      LLM_BASE_URL: ${LLM_BASE_URL}
      DB_FORCE: ${DB_FORCE:-FALSE}
    volumes:
      - bili-financer-track-data:/etc/work/server/public

volumes:
  bili-financer-track-data:
```

2) 新建 `.env`：
```
GROQ_SK=你的_groq_api_key
LLM_API_KEY=你的_llm_api_key
LLM_BASE_URL=你的_llm_base_url
```

3) 启动：
```
docker compose up -d
```

访问：`http://localhost:8093`

> 说明：数据库、日志、下载文件会写入容器内 `/etc/work/server/public`，通过命名卷持久化。

## 开发模式启动
> 需要 Node.js 与 pnpm

- 安装依赖：
```
pnpm install
```

- 启动服务端：
```
pnpm dev:server
```

- 启动客户端（新终端）：
```
pnpm dev:client
```

环境变量要求见 [packages/server/src/utils/env.ts](packages/server/src/utils/env.ts)。