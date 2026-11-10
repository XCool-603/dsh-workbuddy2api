/**
 * video.js - 专属视频生成大模型（快手可灵 Kling 3.0 & MiniMax-H3）对话桥接与直出
 */

import { CN_CHAT_BASE, GLOBAL_BASE, VIDEO_GENERATIONS_PATH } from '../constants.js';

/**
 * 判断是否为视频生成大模型
 */
export function isVideoModel(model) {
  if (!model || typeof model !== 'string') return false;
  const m = model.toLowerCase();
  return (
    m.includes('kling') ||
    m.includes('keling') ||
    m.includes('可灵') ||
    m.includes('minimax-video') ||
    m.includes('hailuo') ||
    m.includes('海螺')
  );
}

/**
 * 从对话消息中提取视频提示词及首帧图片
 */
export function extractVideoPrompt(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { prompt: '', imageUrl: '' };
  }

  let prompt = '';
  let imageUrl = '';

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === 'user') {
      if (typeof msg.content === 'string') {
        prompt = msg.content;
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === 'text') {
            prompt += (prompt ? ' ' : '') + part.text;
          } else if (part.type === 'image_url' && part.image_url?.url) {
            imageUrl = part.image_url.url;
          }
        }
      }
      break;
    }
  }

  return { prompt: prompt || '生成高质量自然景观视频', imageUrl };
}

/**
 * 提交并轮询视频生成任务，直出视频播放链接
 */
export async function executeVideoChatBridge(account, model, messages, onChunk) {
  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_CHAT_BASE;
  const { prompt, imageUrl } = extractVideoPrompt(messages);

  const normalizedModel = (model.includes('minimax') || model.includes('hailuo') || model.includes('海螺'))
    ? 'minimax-video-h3'
    : 'kling-video-v3';

  const reqBody = {
    model: normalizedModel,
    prompt: prompt,
    seconds: 5,
    ...(imageUrl ? { image_url: imageUrl } : {})
  };

  onChunk?.(`🎬 正在提交 ${normalizedModel} 视频生成任务...\n\n提示词: "${prompt}"\n\n`);

  const createRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.auth.accessToken}`,
      'Content-Type': 'application/json',
      'X-User-Id': account.account?.uid || '',
      'Origin': base,
      'User-Agent': 'WorkBuddy/1.2.34'
    },
    body: JSON.stringify(reqBody)
  });

  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok || (createData.code !== 0 && createData.code !== 200)) {
    throw new Error(createData.msg || `视频任务创建失败 (${createRes.status})`);
  }

  const taskId = createData.data?.id || createData.id;
  if (!taskId) {
    throw new Error('未获取到视频任务 ID');
  }

  onChunk?.(`⏳ 任务 ID: \`${taskId}\`，正在排队渲染中，请稍候...\n\n`);

  // 轮询检查任务进度 (最长等待 180 秒)
  const startTime = Date.now();
  while (Date.now() - startTime < 180000) {
    await new Promise((r) => setTimeout(r, 4000));
    try {
      const queryRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${account.auth.accessToken}`,
          'X-User-Id': account.account?.uid || '',
          'Origin': base,
          'User-Agent': 'WorkBuddy/1.2.34'
        }
      });
      const queryData = await queryRes.json().catch(() => ({}));
      const status = queryData.data?.status || queryData.status;

      if (status === 'completed' || status === 'succeeded' || status === 'success') {
        const videoUrl = queryData.data?.data?.[0]?.url || queryData.data?.url || queryData.url;
        onChunk?.(`\n\n✅ 视频生成成功！\n\n[▶ 点击播放视频](${videoUrl})\n\n<video controls src="${videoUrl}" width="100%"></video>\n`);
        return videoUrl;
      }

      if (status === 'failed' || status === 'error') {
        throw new Error(queryData.data?.error?.message || queryData.msg || '视频生成任务失败');
      }

      onChunk?.(`.`);
    } catch (e) {
      if (e.message.includes('失败')) throw e;
    }
  }

  throw new Error('视频渲染超时，请稍后检查');
}
