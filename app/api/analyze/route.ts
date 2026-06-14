import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "缺少 title 参数" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "未配置 DEEPSEEK_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = `你是一名资深自媒体运营专家。

请分析下面标题为什么容易获得点击。

标题：
${title}

请严格输出：

# 目标人群

# 点击动机

# 核心钩子

# 激发情绪

# 标题结构

# 仿写公式

# 仿写案例（3个）`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一名资深自媒体运营专家。" },
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
