// Vercel Serverless Function - AI 回覆生成
export default async function handler(req, res) {
  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { question, style, previousReply, opponent } = req.body;

  if (!question || !style) {
    return res.status(400).json({ error: 'Missing question or style' });
  }

  // 從環境變數取得 API Key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 建立 prompt
  const stylePrompts = {
    savage: '- 直接嗆回去，不留情面\n- 可以機車、酸人\n- 不用髒話',
    sharp: '- 犀利反擊，把問題丟回給對方\n- 讓對方自己也答不出來',
    funny: '- 幽默諷刺，讓人笑完才發現被酸\n- 有梗有創意',
    gentle: '- 笑裡藏刀，表面溫和但暗藏殺機\n- 殺人不見血'
  };

  const styleNames = {
    savage: '機車嗆爆',
    sharp: '犀利反擊', 
    funny: '幽默諷刺',
    gentle: '溫柔刀'
  };

  let opponentInfo = '';
  if (opponent) {
    opponentInfo = `
對手身分：${opponent.name}
對手特徵：${opponent.desc || ''}
對手弱點：${opponent.weakness || ''}
請針對這個人的弱點進行回擊，最好能帶入對方的人設情境！`;
  }

  let prompt = `你是一個過年回嘴產生器。
${opponentInfo}

親戚問了這個問題：「${question}」

請用「${styleNames[style]}」的風格回覆。

風格要求：
${stylePrompts[style]}

要求：
- 回覆要簡短有力（30字以內）
- 要像台灣人真的會說的話
- 要夠嗆、夠直接
- 不要有引號

只需要回覆一句話，不需要任何解釋或前綴。`;

  if (previousReply) {
    prompt += `\n\n之前的回覆是「${previousReply}」，請給一個完全不一樣的新回覆。`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'AI API error' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '你很煩欸，可以不要問嗎';

    // 清理回覆（移除可能的引號）
    const cleanReply = reply.replace(/^["「]|["」]$/g, '').trim();

    return res.status(200).json({ reply: cleanReply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to generate reply' });
  }
}
