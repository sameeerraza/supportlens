"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import CategoryBadge from "./components/CategoryBadge";
import {
  Trace,
  Analytics,
  Category,
  CATEGORY_COLORS,
  CATEGORY_BG,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ALL_CATEGORIES: Category[] = [
  "Billing",
  "Refund",
  "Account Access",
  "Cancellation",
  "General Inquiry",
];

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "28px",
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          color: "var(--text)",
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  count,
  percentage,
}: {
  category: Category;
  count: number;
  percentage: number;
}) {
  const color = CATEGORY_COLORS[category];
  const bg = CATEGORY_BG[category];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${color}30`,
        borderRadius: "8px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {category}
        </span>
        <span
          style={{
            fontSize: "11px",
            color,
            background: bg,
            padding: "2px 8px",
            borderRadius: "3px",
          }}
        >
          {percentage}%
        </span>
      </div>
      <span
        style={{
          fontSize: "24px",
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          color,
        }}
      >
        {count}
      </span>
      <div
        style={{
          height: "3px",
          background: "var(--surface2)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: "2px",
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [filter, setFilter] = useState<Category | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tracesRes, analyticsRes] = await Promise.all([
        fetch(
          `${API}/traces${filter !== "All" ? `?category=${encodeURIComponent(filter)}` : ""}`,
        ),
        fetch(`${API}/analytics`),
      ]);
      const [tracesData, analyticsData] = await Promise.all([
        tracesRes.json(),
        analyticsRes.json(),
      ]);
      setTraces(tracesData);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (s: string, n = 60) =>
    s.length > n ? s.slice(0, n) + "…" : s;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <main
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              color: "var(--text)",
            }}
          >
            Observability Dashboard
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Live trace monitoring · Auto-refreshes every 10s
          </p>
        </div>

        {/* Top Stats */}
        {analytics && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <StatCard label="Total Traces" value={analytics.total_traces} />
              <StatCard
                label="Avg Response Time"
                value={`${analytics.average_response_time_ms.toFixed(0)} ms`}
              />
              <StatCard
                label="Categories Tracked"
                value="5"
                sub="Billing · Refund · Access · Cancel · General"
              />
            </div>

            {/* Category Breakdown */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              {analytics.category_breakdown.map((cat) => (
                <CategoryCard key={cat.category} {...cat} />
              ))}
            </div>
          </>
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginRight: "4px",
            }}
          >
            FILTER:
          </span>
          {(["All", ...ALL_CATEGORIES] as (Category | "All")[]).map((cat) => {
            const active = filter === cat;
            const color =
              cat === "All"
                ? "var(--accent)"
                : CATEGORY_COLORS[cat as Category];
            return (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  setExpandedId(null);
                }}
                style={{
                  padding: "5px 14px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontFamily: "DM Mono, monospace",
                  cursor: "pointer",
                  border: active
                    ? `1px solid ${color}`
                    : "1px solid var(--border)",
                  background: active
                    ? cat === "All"
                      ? "rgba(108,99,255,0.15)"
                      : CATEGORY_BG[cat as Category]
                    : "transparent",
                  color: active ? color : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            );
          })}

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={fetchData}
              style={{
                padding: "5px 14px",
                borderRadius: "4px",
                fontSize: "11px",
                fontFamily: "DM Mono, monospace",
                cursor: "pointer",
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Trace Table */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 1fr 160px 100px",
              gap: "0",
              borderBottom: "1px solid var(--border)",
              padding: "10px 20px",
            }}
          >
            {[
              "Timestamp",
              "User Message",
              "Bot Response",
              "Category",
              "Response Time",
            ].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              Loading traces…
            </div>
          ) : traces.length === 0 ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              No traces found
            </div>
          ) : (
            traces.map((trace, i) => {
              const expanded = expandedId === trace.id;
              return (
                <div key={trace.id}>
                  <div
                    onClick={() => setExpandedId(expanded ? null : trace.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "160px 1fr 1fr 160px 100px",
                      gap: "0",
                      padding: "14px 20px",
                      borderBottom:
                        i < traces.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      cursor: "pointer",
                      background: expanded ? "var(--surface2)" : "transparent",
                      transition: "background 0.15s",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                  >
                    <span
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      {formatTime(trace.timestamp)}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text)",
                        paddingRight: "16px",
                      }}
                    >
                      {truncate(trace.user_message)}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        paddingRight: "16px",
                      }}
                    >
                      {truncate(trace.bot_response)}
                    </span>
                    <CategoryBadge category={trace.category} />
                    <span
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      {trace.response_time_ms} ms
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {expanded && (
                    <div
                      style={{
                        padding: "20px 24px",
                        background: "var(--surface2)",
                        borderBottom:
                          i < traces.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                        borderTop: "1px solid var(--border)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            letterSpacing: "0.1em",
                            marginBottom: "8px",
                          }}
                        >
                          USER MESSAGE
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text)",
                            lineHeight: 1.6,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            padding: "12px 16px",
                          }}
                        >
                          {trace.user_message}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            letterSpacing: "0.1em",
                            marginBottom: "8px",
                          }}
                        >
                          BOT RESPONSE
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text)",
                            lineHeight: 1.6,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            padding: "12px 16px",
                          }}
                        >
                          {trace.bot_response}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
