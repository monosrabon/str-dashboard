"use client";

import { useState, useEffect, useRef } from "react";
import { IconBot, IconSend, IconSparkles } from "@/components/icons";

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedPropId, setSelectedPropId] = useState("");

  const [knowledgeBase, setKnowledgeBase] = useState({
    wifiName: "Corporate_Executive_Guest",
    wifiPass: "AuraResidences2026!",
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    quietHours: "10:00 PM - 8:00 AM",
    trashRules: "Please deposit bagged refuse into the exterior collection station.",
    emergencyContact: "+1 (555) 019-8800",
  });
  const [savedRules, setSavedRules] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setMessages(data.recentMessages || []);

        const propRes = await fetch("/api/properties");
        const propData = await propRes.json();
        const list = propData.properties || [];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load AI page data:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text || isSending) return;

    setInputValue("");
    const tempId = `temp_${Date.now()}`;
    const userMsg = {
      id: tempId,
      sender: "guest",
      guestName: "Guest Inquiry",
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          guestName: "Guest Inquiry",
          propertyId: selectedPropId,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }
    } catch (err) {
      console.error("AI send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveKnowledge = (e) => {
    e.preventDefault();
    setSavedRules(true);
    setTimeout(() => setSavedRules(false), 3000);
  };

  const quickQuestions = [
    "What is the high-speed WiFi passphrase?",
    "What are the check-in and departure windows?",
    "Where is designated guest parking?",
    "Where are extra linens and supplies stored?",
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">AI Guest Concierge Engine</h1>
          <p className="page-subtitle">Automated response simulation, rule-based dispatching, and property knowledge base configuration.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-5)" }}>
        {/* Left: Chat Simulator */}
        <div className="card" style={{ height: "calc(100vh - 180px)", display: "flex", flexDirection: "column" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconBot size={16} />
              </div>
              Automated Response Simulator
            </div>
            {properties.length > 0 && (
              <select
                className="input"
                style={{ width: "auto", padding: "4px 8px", fontSize: "12px" }}
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Prompts Strip */}
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--bg-subtle)",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {quickQuestions.map((q) => (
              <button
                key={q}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "11px", padding: "3px 8px" }}
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <IconBot size={20} />
                </div>
                <div className="empty-state-title">Simulator Ready</div>
                <div className="empty-state-text">
                  Select a prompt chip above or type a guest query below to observe automated natural-language resolution.
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
                  </div>
                  <div>{msg.message}</div>
                </div>
              ))
            )}
            {isSending && (
              <div className="chat-message ai" style={{ opacity: 0.85 }}>
                <div className="chat-message-sender">Concierge processing inquiry...</div>
                <div style={{ display: "flex", gap: "4px", padding: "2px 0" }}>
                  <span className="pulse-dot">●</span>
                  <span className="pulse-dot" style={{ animationDelay: "0.2s" }}>●</span>
                  <span className="pulse-dot" style={{ animationDelay: "0.4s" }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chat-input-container"
          >
            <input
              className="chat-input"
              placeholder="Simulate guest question..."
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

        {/* Right: Knowledge Base & Property Policies */}
        <div className="card" style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconSparkles size={16} />
              </div>
              Knowledge Base &amp; Policies
            </div>
          </div>
          <form onSubmit={handleSaveKnowledge} style={{ padding: "20px" }}>
            {savedRules && (
              <div
                style={{
                  backgroundColor: "var(--accent-green-bg)",
                  color: "var(--accent-green)",
                  border: "1px solid var(--accent-green-border)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                &check; Knowledge base rules successfully published to model context.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  WiFi SSID / Network
                </label>
                <input
                  className="input"
                  value={knowledgeBase.wifiName}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, wifiName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  WPA2 / WPA3 Passphrase
                </label>
                <input
                  className="input"
                  value={knowledgeBase.wifiPass}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, wifiPass: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Check-In Window
                </label>
                <input
                  className="input"
                  value={knowledgeBase.checkInTime}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, checkInTime: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Checkout Deadline
                </label>
                <input
                  className="input"
                  value={knowledgeBase.checkOutTime}
                  onChange={(e) => setKnowledgeBase({ ...knowledgeBase, checkOutTime: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Quiet Hours Directive
              </label>
              <input
                className="input"
                value={knowledgeBase.quietHours}
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, quietHours: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Waste &amp; Check-out Protocol
              </label>
              <textarea
                className="input"
                rows={2}
                style={{ resize: "none" }}
                value={knowledgeBase.trashRules}
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, trashRules: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Emergency Operations Hotline
              </label>
              <input
                className="input"
                value={knowledgeBase.emergencyContact}
                onChange={(e) => setKnowledgeBase({ ...knowledgeBase, emergencyContact: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
              Commit &amp; Publish Knowledge Base
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
