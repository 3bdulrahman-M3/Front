import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Users,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  getConversation,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getUnreadCount,
} from "../api/api";

const ChatInterface = ({ isAdmin = false }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversation and messages
  const loadConversation = async () => {
    try {
      setLoading(true);
      const conversationData = await getConversation();
      setConversation(conversationData);

      // Load messages
      const messagesData = await getConversationMessages(conversationData.id);
      setMessages(messagesData.results || messagesData);

      // Mark conversation as read if user is not admin
      if (!isAdmin) {
        await markConversationRead(conversationData.id);
        // Refresh messages to get updated read status
        const updatedMessagesData = await getConversationMessages(
          conversationData.id
        );
        setMessages(updatedMessagesData.results || updatedMessagesData);
      }

      // Get unread count
      const unreadData = await getUnreadCount();
      setUnreadCount(unreadData.unread_count);
    } catch (err) {
      setError("Failed to load conversation. Please try again.");
      console.error("Error loading conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation) return;

    try {
      setSending(true);
      const messageData = await sendMessage(conversation.id, {
        content: newMessage.trim(),
        message_type: "text",
      });

      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");

      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Poll for new messages
  const pollForMessages = async () => {
    if (!conversation) return;

    try {
      const messagesData = await getConversationMessages(conversation.id);
      const newMessages = messagesData.results || messagesData;

      // Always update messages to get latest read status
      setMessages(newMessages);

      // Scroll to bottom if we have new messages
      if (newMessages.length > messages.length) {
        scrollToBottom();
      }

      // Update unread count
      const unreadData = await getUnreadCount();
      setUnreadCount(unreadData.unread_count);
    } catch (err) {
      console.error("Error polling messages:", err);
    }
  };

  // Initialize chat
  useEffect(() => {
    loadConversation();

    // Set up polling every 3 seconds
    pollIntervalRef.current = setInterval(pollForMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return "Invalid Date";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "Invalid Date";
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">
                {isAdmin ? "Admin Chat" : "Support Chat"}
              </h2>
              <p className="text-blue-100 text-sm">
                {isAdmin
                  ? `Chatting with ${conversation?.user_name || "User"}`
                  : "Chat with our support team"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 flex items-center">
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message) => {
                const isFromCurrentUser =
                  message.sender_role === (isAdmin ? "admin" : "student");
                const isAdminMessage = message.sender_role === "admin";

                return (
                  <div
                    key={`message-${message.id}`}
                    className={`flex ${
                      isFromCurrentUser ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isFromCurrentUser
                          ? "bg-blue-600 text-white"
                          : isAdminMessage
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center justify-end mt-1 space-x-1 ${
                          isFromCurrentUser || isAdminMessage
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        {isFromCurrentUser && (
                          <div>
                            {message.is_read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
