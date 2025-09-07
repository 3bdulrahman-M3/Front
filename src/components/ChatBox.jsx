// src/components/Chatbot.jsx
import React, { useState } from "react";
import { askChat } from "../api/api";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { response } = await askChat(input);
      const botMessage = {
        sender: "bot",
        text: response || "Sorry, I couldn’t process that.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-4 rounded-full shadow-lg hover:scale-105 transition"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Live Support</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-600 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:opacity-90 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
