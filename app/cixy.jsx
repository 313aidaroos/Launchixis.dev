"use client";

import { useEffect, useRef, useState } from "react";

export default function Cixy() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [launch, setLaunch] = useState(null);
  const conversation = useRef(0);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  function closeChat(){setOpen(false);triggerRef.current?.focus();}
  useEffect(()=>{const show=()=>{triggerRef.current=document.activeElement;setOpen(true);};window.addEventListener("launchixis:open-cixy",show);return()=>window.removeEventListener("launchixis:open-cixy",show);},[]);
  useEffect(()=>{if(open)inputRef.current?.focus();},[open]);
  useEffect(() => {
    const select = event => { conversation.current += 1; setLaunch(event.detail); setMessages([]); setError(""); setLoading(false); };
    window.addEventListener("launchixis:selection", select);
    return () => window.removeEventListener("launchixis:selection", select);
  }, []);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    const generation = conversation.current;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/cixy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages.slice(-8), launchId: launch?.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "request_failed");
      }

      const data = await response.json();
      if (generation !== conversation.current) return;
      setMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
    } catch (err) {
      if (generation !== conversation.current) return;
      setError(err.message);
      setMessages((prev) =>
        prev.slice(0, -1)
      );
    } finally {
      if (generation === conversation.current) setLoading(false);
    }
  }

  return (
    <div className="cixy-container">
      <button
        className="cixy-toggle"
        data-floating-widget="true"
        onClick={e => { if(open)closeChat();else{triggerRef.current=e.currentTarget;setOpen(true);} }}
        aria-expanded={open}
        aria-controls="cixy-chat"
        aria-label="Toggle Cixy chat"
      >
        <img src="/cixy/cixy-avatar.webp" alt=""/><span>{open ? "Close Cixy" : "Ask Cixy"}</span>
      </button>

      {open && (
        <div className="cixy-chat" id="cixy-chat" role="dialog" aria-label="Chat with Cixy" onKeyDown={e=>{if(e.key==="Escape")closeChat();}}>
          <div className="cixy-header">
            <h3>Cixy · Your launch copilot</h3><button className="cixy-close" onClick={closeChat} aria-label="Close Cixy">×</button>
            <p>{launch ? `Planning for ${launch.name}` : "Launch strategy, waitlists, positioning, GTM sequencing"}</p>
          </div>

          <div className="cixy-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="cixy-welcome">
                <p>
                  <strong>Hello!</strong> I'm Cixy, your launch operations
                  expert. Ask me about waitlist strategy, domain positioning, GTM timing,
                  or Vercel/GitHub setup.
                </p>
                <p className="cixy-hint">
                  Let's ship this launch, one step at a time.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`cixy-message cixy-${msg.role}`}>
                {msg.role === "assistant" && <span className="cixy-badge">Cixy</span>}
                <div className="cixy-text">{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="cixy-message cixy-assistant">
                <span className="cixy-badge">Cixy</span>
                <div className="cixy-text cixy-thinking">Thinking…</div>
              </div>
            )}

            {error && (
              <div className="cixy-error">
                {error}<p><a href="/login">Sign in</a> · <a href="/pricing">Checklist access</a></p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="cixy-form">
            <input
              ref={inputRef}
              aria-label="Message Cixy"
              maxLength={2000}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about launches, positioning, GTM…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .cixy-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          z-index: 9999;
        }

        .cixy-toggle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .cixy-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .cixy-chat {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
        }

        .cixy-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .cixy-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        .cixy-header p {
          margin: 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .cixy-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cixy-welcome {
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .cixy-welcome p {
          margin: 8px 0;
        }

        .cixy-hint {
          font-style: italic;
          color: #999;
          font-size: 13px;
        }

        .cixy-message {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .cixy-user {
          justify-content: flex-end;
          text-align: right;
        }

        .cixy-assistant {
          justify-content: flex-start;
        }

        .cixy-badge {
          font-size: 11px;
          font-weight: bold;
          color: #667eea;
          min-width: 40px;
        }

        .cixy-text {
          background: #f3f4f6;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          max-width: 80%;
        }

        .cixy-user .cixy-text {
          background: #667eea;
          color: white;
        }

        .cixy-thinking {
          font-style: italic;
          color: #999;
        }

        .cixy-error {
          background: #fee;
          color: #c33;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .cixy-form {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .cixy-form input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }

        .cixy-form button {
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .cixy-form button:hover:not(:disabled) {
          background: #5568d3;
        }

        .cixy-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
