# Dockerfile for BiliFinancerTrack
FROM node:22-alpine

# 使用 ROOT 用户
USER root

# 更换为阿里云镜像源（更稳定）并更新索引
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update

RUN echo $http_proxy

# 安装系统依赖
RUN apk update && apk add --no-cache ffmpeg

# 配置 npm 并安装全局依赖
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install pm2 -g

# 创建工作目录和普通用户
RUN mkdir -p /etc/work \
    && adduser -D appuser \
    && chown -R appuser:appuser /etc/work

COPY --chown=appuser:appuser output/ /etc/work/
USER appuser
WORKDIR /etc/work

# 安装项目依赖
RUN npm install --production && mkdir -p server/public

# 设置环境变量
ENV NODE_ENV=production \
    NODE_PORT=8093 \
    IS_DOCKER=TRUE

# 定义挂载点
VOLUME /etc/work/server/public

# 暴露端口
EXPOSE 8093

# 启动命令
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
