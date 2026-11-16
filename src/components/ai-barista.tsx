"use client";

import { useState, type FormEvent } from "react";
import { Bot, Send, X, MessageCircle } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiBarista() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Brew AI Barista ☕ What kind of coffee are you craving today?",
    },
  ]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) return;

    const history = messages.slice(-6);

    setMessages((current) => [...current, { role: "user", content: message }]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI unavailable");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, I'm temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="ai-barista-widget">
      {open && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-heading">
              <Bot size={23} />
              <div>
                <strong>Brew AI Barista</strong>
                <small>Your coffee companion</small>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close AI chat"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="ai-chat-messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ai-message user"
                    : "ai-message assistant"
                }
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="ai-message assistant">Brewing a response...</div>
            )}
          </div>

          <form className="ai-chat-form" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me about coffee..."
              aria-label="Message AI Barista"
              maxLength={500}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        className="ai-chat-toggle"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close AI Barista" : "Open AI Barista"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        <span>{open ? "Close" : "Ask AI Barista"}</span>
      </button>
    </aside>
  );
}
