"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatBubble = {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedReports?: string[];
};

export default function Home() {
  const [messages, setMessages] = useState<ChatBubble[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hi! I'm your Orca assistant. Ask for report summaries, owners, or the latest status and I'll fetch them for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatBubble = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload = await response.json();

      const assistantMessage: ChatBubble = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: payload.reply,
        referencedReports: payload.referencedReports,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      const assistantMessage: ChatBubble = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I ran into an issue reaching Orca. Please try again in a moment.",
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-900 font-sans text-slate-900">
      <main className="flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-4 py-10 sm:px-10">
        <header className="flex flex-col gap-2">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-blue-400">
            Orca Intelligence
          </span>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Report Concierge
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Get instant answers about the latest Orca reports. Ask for status,
            owners, summaries, or grab the download link directly in chat.
          </p>
        </header>

        <section
          ref={containerRef}
          className="flex min-h-[400px] flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`flex w-full flex-col gap-2 rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                message.role === "assistant"
                  ? "self-start bg-white/5 text-slate-100 backdrop-blur"
                  : "self-end bg-blue-500 text-white shadow-lg"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {message.role === "assistant" ? "Orca Assistant" : "You"}
              </span>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.referencedReports?.length ? (
                <footer className="text-xs text-slate-300">
                  Reports: {message.referencedReports.join(", ")}
                </footer>
              ) : null}
            </article>
          ))}
          {loading ? (
            <div className="flex items-center gap-3 self-start rounded-full bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-300" />
              </span>
              Fetching Orca data…
            </div>
          ) : null}
        </section>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for a report ID, topic, or latest update…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none sm:text-base"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-500/60"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
