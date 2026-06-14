"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
  keyword: string;
  platform: string;
  content: string;
  createdAt: string;
};

type Mode = "generate" | "analyze";

const STORAGE_KEY = "history";

export default function Home() {
  const [mode, setMode] = useState<Mode>("generate");

  // 文案生成相关
  const [keyword, setKeyword] = useState("");
  const [platform, setPlatform] = useState("小红书");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 爆款拆解相关
  const [title, setTitle] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState("");

  // 通用
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {}
  }, []);

  const persistHistory = (list: HistoryItem[]) => {
    setHistory(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, platform }),
      });
      const data = await res.json();
      setResult(data.content);
      setCopied(false);

      if (data.content) {
        const item: HistoryItem = {
          keyword,
          platform,
          content: data.content,
          createdAt: new Date().toISOString(),
        };
        const next = [item, ...history].slice(0, 50);
        persistHistory(next);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      setAnalyzeResult(data.content);
      setCopied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = mode === "generate" ? result : analyzeResult;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewHistory = (item: HistoryItem) => {
    setMode("generate");
    setKeyword(item.keyword);
    setPlatform(item.platform);
    setResult(item.content);
    setCopied(false);
  };

  const handleSwitchMode = (next: Mode) => {
    setMode(next);
    setCopied(false);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const recentHistory = history.slice(0, 5);
  const currentResult = mode === "generate" ? result : analyzeResult;
  const resultTitle = mode === "generate" ? "生成结果" : "拆解结果";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-rose-50 px-4 py-12">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
        {/* 主标题 */}
        <h1 className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          30秒生成爆款文案
        </h1>

        {/* 副标题 */}
        <p className="text-lg leading-relaxed text-zinc-500 sm:text-xl">
          {mode === "generate" ? (
            <>
              输入关键词，AI自动生成适合
              <span className="font-semibold text-rose-500">小红书</span>
              和
              <span className="font-semibold text-sky-500">抖音</span>
              的爆款文案
            </>
          ) : (
            <>粘贴一个爆款标题，AI 帮你深度拆解为什么它能火</>
          )}
        </p>

        {/* 模式切换 */}
        <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => handleSwitchMode("generate")}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              mode === "generate"
                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            文案生成
          </button>
          <button
            onClick={() => handleSwitchMode("analyze")}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
              mode === "analyze"
                ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            爆款拆解
          </button>
        </div>

        {mode === "generate" ? (
          <>
            {/* 输入框与按钮 */}
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="输入关键词，如：防晒霜、健身餐..."
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-base text-zinc-800 placeholder-zinc-400 shadow-sm outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-rose-200 transition-all hover:shadow-lg hover:shadow-rose-300 active:scale-95 disabled:opacity-60"
              >
                {loading ? "生成中…" : "✨ 生成文案"}
              </button>
            </div>

            {/* 平台选择 */}
            <div className="flex w-full items-center justify-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                <input
                  type="radio"
                  name="platform"
                  value="小红书"
                  checked={platform === "小红书"}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="h-4 w-4 cursor-pointer accent-rose-500"
                />
                <span className={platform === "小红书" ? "font-semibold text-rose-500" : ""}>
                  小红书
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                <input
                  type="radio"
                  name="platform"
                  value="抖音"
                  checked={platform === "抖音"}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="h-4 w-4 cursor-pointer accent-sky-500"
                />
                <span className={platform === "抖音" ? "font-semibold text-sky-500" : ""}>
                  抖音
                </span>
              </label>
            </div>

            {/* 实时显示当前关键词 */}
            {keyword && (
              <p className="text-sm text-zinc-500">
                当前关键词：<span className="font-medium text-rose-500">{keyword}</span>
              </p>
            )}
          </>
        ) : (
          <>
            {/* 爆款拆解输入区 */}
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="请输入爆款标题"
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-base text-zinc-800 placeholder-zinc-400 shadow-sm outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-sky-200 transition-all hover:shadow-lg hover:shadow-sky-300 active:scale-95 disabled:opacity-60"
              >
                {loading ? "分析中…" : "🔍 开始分析"}
              </button>
            </div>

            {/* 实时显示当前标题 */}
            {title && (
              <p className="text-sm text-zinc-500">
                当前标题：<span className="font-medium text-sky-500">{title}</span>
              </p>
            )}
          </>
        )}

        {/* 结果展示区域 */}
        {currentResult && (
          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-800">{resultTitle}</h2>
              <div className="flex items-center gap-2">
                {mode === "generate" && (
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-sky-300 hover:text-sky-500 active:scale-95 disabled:opacity-60"
                  >
                    重新生成
                  </button>
                )}
                {mode === "analyze" && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-sky-300 hover:text-sky-500 active:scale-95 disabled:opacity-60"
                  >
                    重新分析
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-rose-300 hover:text-rose-500 active:scale-95"
                >
                  {copied ? "已复制到剪贴板" : "复制文案"}
                </button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-700">
              {currentResult}
            </p>
          </div>
        )}

        {/* 最近生成记录（仅文案生成模式展示） */}
        {mode === "generate" && recentHistory.length > 0 && (
          <div className="w-full text-left">
            <h2 className="mb-3 text-lg font-semibold text-zinc-800">最近生成记录</h2>
            <div className="flex flex-col gap-2">
              {recentHistory.map((item, idx) => (
                <button
                  key={`${item.createdAt}-${idx}`}
                  onClick={() => handleViewHistory(item)}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-rose-300 hover:shadow"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-medium text-zinc-800 truncate">{item.keyword}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.platform === "抖音"
                          ? "bg-sky-50 text-sky-500"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {item.platform}
                    </span>
                  </div>
                  <span className="ml-3 shrink-0 text-xs text-zinc-400">
                    {formatTime(item.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
