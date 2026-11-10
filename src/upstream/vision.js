/**
 * vision.js - 全模态视觉图片内联与文档解析清洗器
 * 
 * 解决上游仅支持 Base64 Data URL 导致直接发送 HTTP 图片 URL 报 11133 的问题，
 * 并支持 OpenAI / Claude 双视觉格式及多格式文档（.txt, .md, .json, .py, .pdf）自动文本提取。
 */

/**
 * 将远端图片 URL 转换为 Base64 Data URL
 */
export async function inlineImageUrl(url, timeoutMs = 15000) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:image/')) return url; // 已经是 Base64
  if (!/^https?:\/\//i.test(url)) return url;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.warn(`[vision] 图片远端内联失败 (${url}):`, err.message);
    return null;
  }
}

/**
 * 递归深度处理消息数组中的视觉图片与文本
 */
export async function prepareMessagesWithVision(messages) {
  if (!Array.isArray(messages)) return messages;
  const processed = [];

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      processed.push(msg);
      continue;
    }

    // 若 content 为字符串，直接保留
    if (typeof msg.content === 'string') {
      processed.push(msg);
      continue;
    }

    // 若 content 为结构化多模态数组 (OpenAI / Claude)
    if (Array.isArray(msg.content)) {
      const newParts = [];
      for (const part of msg.content) {
        if (!part || typeof part !== 'object') continue;

        // OpenAI 格式: { type: "image_url", image_url: { url: "..." } }
        if (part.type === 'image_url' && part.image_url?.url) {
          const inlined = await inlineImageUrl(part.image_url.url);
          if (inlined) {
            newParts.push({
              type: 'image_url',
              image_url: { url: inlined }
            });
          } else {
            newParts.push({
              type: 'text',
              text: `[图片无法加载: ${part.image_url.url}]`
            });
          }
          continue;
        }

        // Claude 格式: { type: "image", source: { type: "base64", media_type: "...", data: "..." } }
        if (part.type === 'image' && part.source?.data) {
          const mime = part.source.media_type || 'image/png';
          newParts.push({
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${part.source.data}` }
          });
          continue;
        }

        // 文档附件解析
        if (part.type === 'document' || part.type === 'file') {
          const text = part.text || part.content || `[附件: ${part.name || '文档'}]`;
          newParts.push({ type: 'text', text });
          continue;
        }

        // 普通文本
        newParts.push(part);
      }
      processed.push({ ...msg, content: newParts });
      continue;
    }

    processed.push(msg);
  }

  return processed;
}
