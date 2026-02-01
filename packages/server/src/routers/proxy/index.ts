import { Router } from 'express';

const proxyRouter = Router();

proxyRouter.get('/proxy/bili-image', async (req, res) => {
  const { url } = req.query as { url?: string };
  if (!url) {
    res.status(400).json({ success: false, msg: '缺少 url 参数' });
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    res.status(400).json({ success: false, msg: 'url 参数不合法' });
    return;
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    res.status(400).json({ success: false, msg: '仅支持 http/https 协议' });
    return;
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        Referer: 'https://www.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (compatible; BiliFinancerTrack/1.0)',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        msg: `图片获取失败: ${response.status}`,
      });
      return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).json({ success: false, msg: '图片代理失败' });
  }
});

export default proxyRouter;
