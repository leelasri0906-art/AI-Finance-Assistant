import { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello! I'm your Finance Assistant. Ask me about your income, expenses, balance, spending categories, or recent transactions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || loading) {
      return;
    }

    const userMessage = {
      sender: "user",
      text: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to get chatbot response"
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: data.reply,
        },
      ]);

    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            `Sorry, I couldn't process that request. ${error.message}`,
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const askQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="chatbot-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>
            Finance Chatbot
          </h1>

          <p>
            Ask questions about your
            personal finances
          </p>
        </div>

      </div>


      {/* CHAT CARD */}

      <div className="chatbot-card">

        <div className="chatbot-messages">

          {messages.map(
            (message, index) => (

              <div
                key={index}
                className={
                  message.sender === "user"
                    ? "chat-message user-message"
                    : "chat-message bot-message"
                }
              >

                <div className="chat-message-bubble">

                  {message.text}

                </div>

              </div>

            )
          )}

          {loading && (
            <div className="chat-message bot-message">

              <div className="chat-message-bubble">
                Thinking...
              </div>

            </div>
          )}

        </div>


        {/* SUGGESTED QUESTIONS */}

        <div className="chat-suggestions">

          <button
            type="button"
            onClick={() =>
              askQuestion(
                "How much did I spend?"
              )
            }
          >
            How much did I spend?
          </button>

          <button
            type="button"
            onClick={() =>
              askQuestion(
                "What is my balance?"
              )
            }
          >
            What is my balance?
          </button>

          <button
            type="button"
            onClick={() =>
              askQuestion(
                "What is my highest spending category?"
              )
            }
          >
            Highest spending category
          </button>

          <button
            type="button"
            onClick={() =>
              askQuestion(
                "Show my recent transactions"
              )
            }
          >
            Recent transactions
          </button>

        </div>


        {/* INPUT */}

        <div className="chatbot-input-area">

          <input
            type="text"
            placeholder="Ask about your finances..."
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              loading ||
              !input.trim()
            }
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default Chatbot;