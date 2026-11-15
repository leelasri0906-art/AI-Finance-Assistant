import { useState, useRef, useEffect } from "react";
import api from "../services/api";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello! I am your AI Finance Assistant. Ask me about your income, total spending, current balance, highest expense categories, or recent transactions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const question = (customPrompt || input).trim();
    if (!question || loading) return;

    const userMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await api.sendChatMessage(question);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "I couldn't process that question right now.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Error: ${err.message || "Failed to reach server. Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "How much did I spend?",
    "What is my current balance?",
    "What is my highest spending category?",
    "Show my recent transactions",
    "How much did I spend on food?",
    "Give me budgeting advice",
  ];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Finance Chatbot</h1>
          <p>Instant conversational queries about your real-time financial data</p>
        </div>
      </div>

      <div
        className="dashboard-card"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "600px",
          padding: "24px",
        }}
      >
        {/* CHAT MESSAGES CONTAINER */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "10px",
            marginBottom: "16px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-line",
                  background:
                    msg.sender === "user"
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  border: msg.sender === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "14px" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#a5b4fc",
                  fontSize: "13px",
                }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* SAMPLE PROMPT PILLS */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "14px",
          }}
        >
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="secondary-button"
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                marginTop: 0,
                borderRadius: "20px",
              }}
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: "flex", gap: "10px" }}
        >
          <input
            type="text"
            className="small-search"
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "10px",
            }}
            placeholder="Type your finance question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="primary-button"
            disabled={loading || !input.trim()}
            style={{ padding: "0 24px", fontSize: "14px", borderRadius: "10px" }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
