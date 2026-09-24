"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconBot, IconSend } from "@/components/icons";

export default function AiAssistant({ data, onMessageSent }) {
  const [messages, setMessages] = useState(data?.recentMessages || []);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (data?.recentMessages) {
      setMessages(data.recentMessages);
    }
  }, [data?.recentMessages]);

  useEffect(() => {
    // Only scroll within the local chat container when user has sent a message
    if (hasInteracted && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isSending, hasInteracted]);

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending) return;

    setHasInteracted(true);
    const userText = inputValue.trim();
    setInputValue("");

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: "guest",
      guestName: "Host / Test",
      message: userText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, guestName: "Host / Test" }),
      });
      const result = await res.json();
      if (result.reply) {
        setMessages((prev) => [...prev, result.reply]);
        if (onMessageSent) onMessageSent();
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">
            <IconBot size={16} />
          </div>
          AI Concierge Agent
        </div>
        <div className="card-actions">
          <Link href="/ai-assistant" className="btn btn-ghost btn-sm">
            Configure Rules
          </Link>
        </div>
      </div>
      <div className="chat-container">
        <div ref={chatContainerRef} className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <IconBot size={20} />
              </div>
              <div className="empty-state-title">Automated Dispatch Active</div>
              <div className="empty-state-text">
                Test automated guest resolution below (inquire about WiFi, check-in window, amenities, or parking policy).
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.sender === "guest" ? "guest" : "ai"}`}
              >
                <div className="chat-message-sender">
                  {msg.sender === "ai" ? "Automated Concierge" : msg.guestName || "Guest"}
                  <span style={{ marginLeft: 8, fontWeight: 400, color: "var(--text-muted)" }}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                {msg.message.split("\n").map((line, i) => (
                  <div key={i} style={{ minHeight: line ? "auto" : "6px" }}>
                    {line}
                  </div>
                ))}
              </div>
            ))
          )}
          {isSending && (
            <div className="chat-message ai" style={{ opacity: 0.85 }}>
              <div className="chat-message-sender">Automated Concierge processing...</div>
              <div style={{ display: "flex", gap: "4px", padding: "2px 0" }}>
                <span className="pulse-dot">●</span>
                <span className="pulse-dot" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="pulse-dot" style={{ animationDelay: "0.4s" }}>●</span>
              </div>
            </div>
          )}
        </div>
        <form className="chat-input-container" onSubmit={handleSend}>
          <input
            className="chat-input"
            placeholder="Simulate guest inquiry..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputValue.trim() || isSending}
            aria-label="Send query"
          >
            <IconSend size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
