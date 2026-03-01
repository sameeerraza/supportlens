"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import CategoryBadge from "../components/CategoryBadge";
import { Category } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Message {
  role: "user" | "assistant";
  content: string;
  category?: Category;
  response_time_ms?: number;
  traceId?: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: userMsg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Call backend /chat endpoint
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMsg }),
      });

      if (!response.ok) throw new Error("Backend API error");

      const trace = await response.json();

      const botMessage: Message = {
        role: "assistant",
        content: trace.bot_response,
        category: trace.category,
        response_time_ms: trace.response_time_ms,
        traceId: trace.id,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error: Could not connect to the server. Please make sure the backend is running.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                margin: 0,
                color: "var(--text)",
              }}
            >
              BillFlow Support
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                margin: "4px 0 0 0",
              }}
            >
              AI-powered customer support · All conversations are logged
            </p>
          </div>
        </div>

        {/* Chat Window */}
        <div
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "500px",
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <div style={{ fontSize: "28px" }}>💬</div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    lineHeight: 1.6,
                  }}
                >
                  Ask BillFlow support anything.
                  <br />
                  <span style={{ fontSize: "11px", opacity: 0.7 }}>
                    Try: "Why was I charged twice?" or "How do I cancel?"
                  </span>
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 4px 12px"
                        : "12px 12px 12px 4px",
                    background:
                      msg.role === "user" ? "var(--accent)" : "var(--surface2)",
                    border:
                      msg.role === "user" ? "none" : "1px solid var(--border)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.category && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      paddingLeft: "4px",
                    }}
                  >
                    <CategoryBadge category={msg.category} />
                    <span
                      style={{ fontSize: "10px", color: "var(--text-muted)" }}
                    >
                      {msg.response_time_ms}ms · trace logged
                    </span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px 12px 12px 4px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      alignItems: "center",
                      height: "16px",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--text-muted)",
                          animation: "pulse 1.4s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "10px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message… (Enter to send)"
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--surface2)",
                color: "var(--text)",
                fontSize: "13px",
                fontFamily: "DM Mono, monospace",
                outline: "none",
                resize: "none",
                minHeight: "42px",
                maxHeight: "120px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                background: loading ? "var(--surface2)" : "var(--accent)",
                color: loading ? "var(--text-muted)" : "white",
                fontSize: "13px",
                fontFamily: "DM Mono, monospace",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "…" : "Send →"}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
