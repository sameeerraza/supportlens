"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "56px",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
          }}
        />
        <span
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--text)",
          }}
        >
          SUPPORT<span style={{ color: "var(--accent)" }}>LENS</span>
        </span>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {[
          { href: "/", label: "Dashboard" },
          { href: "/chatbot", label: "Chatbot" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: "6px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textDecoration: "none",
              background: path === href ? "var(--surface2)" : "transparent",
              color: path === href ? "var(--text)" : "var(--text-muted)",
              border:
                path === href
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
