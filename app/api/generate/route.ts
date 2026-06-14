import { NextRequest, NextResponse } from "next/server";

type Platform = "小红书" | "抖音" | string;

function buildPrompt(keyword: string, platform: Platform): string {
  if (platform === "抖音") {
    return `你是一名百万播放的抖音口播文案博主，写作风格犀利、抓人、节奏感极强。

请围绕用户关键词生成：

5个爆款标题

1篇原创文案

【标题要求】
- 标题控制在 20 字以内
- 制造反差、冲突或悬念
- 让人忍不住点进来

【文案要求】
- 前 3 秒必须有钩子，第一句话直接抓住观众
- 全部使用短句，单句不超过 15 字
- 每段不超过 2 句话，节奏紧凑
- 大量制造反差和冲突，引发好奇
- 结尾必须引导关注，例如点赞、收藏、关注我

用户关键词：${keyword}`;
  }

  return `你是一名真实的小红书博主，写作风格真诚、有故事感、像在和闺蜜聊天。

请围绕用户关键词生成：

5个爆款标题

1篇原创文案

【标题要求】
- 标题控制在 20 字以内
- 口语化、有画面感
- 让人忍不住点进来看

【文案要求】
- 开篇先制造痛点，让读者有"这说的就是我"的感觉
- 加入大量第一人称经历（我/我的/我用过），增强真实感
- 全文使用口语化表达，像发微信聊天一样自然
- 严禁 AI 腔，不要出现"作为一个 AI"、"首先、其次、最后"等套话
- 多用 emoji 表情增强情绪
- 结尾必须引导评论互动，例如"你们觉得呢？""评论区告诉我"

用户关键词：${keyword}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, platform } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: "缺少 keyword 参数" },
        { status: 400 }
      );
    }

    console.log("当前平台：", platform);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "未配置 DEEPSEEK_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(keyword, platform);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一名资深自媒体爆款文案专家。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `DeepSeek API 错误: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { success: false, error: `服务器错误: ${message}` },
      { status: 500 }
    );
  }
}
