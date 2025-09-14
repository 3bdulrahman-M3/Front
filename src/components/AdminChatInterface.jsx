import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Users,
  Search,
  Clock,
  Check,
  CheckCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  getConversationsList,
  getConversationMessages,
  sendMessage,
  markConversationRead,
  getConversationUnreadCount,
} from "../api/api";

const AdminChatInterface = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations list
  const loadConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (showUnreadOnly) params.unread_only = "true";

      console.log("Loading conversations with params:", params);
      const conversationsData = await getConversationsList(params);
      console.log("Conversations data received:", conversationsData);

      // Handle both paginated and non-paginated responses
      const conversations = conversationsData.results || conversationsData;
      setConversations(Array.isArray(conversations) ? conversations : []);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError(
        `Failed to load conversations: ${err.message || "Unknown error"}`
      );
      setConversations([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadConversations(false);
      if (selectedConversation) {
        await loadMessages(selectedConversation.id);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      console.log("Loading messages for conversation:", conversationId);
      const messagesData = await getConversationMessages(conversationId);
      console.log("Messages data received:", messagesData);

      // Handle both paginated and non-paginated responses
      const messages = messagesData.results || messagesData;
      setMessages(Array.isArray(messages) ? messages : []);

      // Mark conversation as read
      await markConversationRead(conversationId);

      // Refresh messages to get updated read status
      const updatedMessagesData = await getConversationMessages(conversationId);
      const updatedMessages =
        updatedMessagesData.results || updatedMessagesData;
      setMessages(Array.isArray(updatedMessages) ? updatedMessages : []);

      // Refresh conversations list to update unread counts
      loadConversations();
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(`Failed to load messages: ${err.message || "Unknown error"}`);
      setMessages([]);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);
      const messageData = await sendMessage(selectedConversation.id, {
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

  // Poll for new messages in selected conversation
  const pollForMessages = async () => {
    if (!selectedConversation || !isUserActive) return;

    try {
      const messagesData = await getConversationMessages(
        selectedConversation.id
      );
      const newMessages = messagesData.results || messagesData;

      // Always update messages to get latest read status
      setMessages(newMessages);

      // Scroll to bottom if we have new messages
      if (newMessages.length > messages.length) {
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error polling messages:", err);
    }
  };

  // Poll for conversation updates (unread counts, new conversations)
  const pollForConversations = async () => {
    if (!isUserActive) return;

    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (showUnreadOnly) params.unread_only = "true";

      const conversationsData = await getConversationsList(params);
      const newConversations = conversationsData.results || conversationsData;

      // Only update if there are actual changes
      const hasChanges =
        JSON.stringify(newConversations) !== JSON.stringify(conversations);
      if (hasChanges) {
        setConversations(
          Array.isArray(newConversations) ? newConversations : []
        );
      }
    } catch (err) {
      console.error("Error polling conversations:", err);
    }
  };

  // Initialize
  useEffect(() => {
    loadConversations();

    // Set up polling with different intervals
    // Poll for messages every 10 seconds (less frequent)
    const messagePollInterval = setInterval(pollForMessages, 10000);

    // Poll for conversations every 30 seconds (much less frequent)
    const conversationPollInterval = setInterval(pollForConversations, 30000);

    // Store both intervals
    pollIntervalRef.current = {
      messages: messagePollInterval,
      conversations: conversationPollInterval,
    };

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current.messages);
        clearInterval(pollIntervalRef.current.conversations);
      }
    };
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIsUserActive(true);
    };

    const checkActivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      // If user hasn't been active for 2 minutes, reduce polling
      setIsUserActive(timeSinceLastActivity < 120000);
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check activity every minute
    const activityCheckInterval = setInterval(checkActivity, 60000);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(activityCheckInterval);
    };
  }, []);

  // Refresh conversations when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConversations();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, showUnreadOnly]);

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Conversations
              </h2>
              <div className="text-blue-100 text-sm mt-1 flex items-center">
                <span>
                  {conversations.length} conversation
                  {conversations.length !== 1 ? "s" : ""}
                </span>
                {isRefreshing && (
                  <span className="ml-2 text-xs">• Refreshing...</span>
                )}
                {!isUserActive && (
                  <span className="ml-2 text-xs">• Auto-refresh paused</span>
                )}
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh conversations"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show unread only</span>
          </label>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading conversations...
              </span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-red-300" />
              <p className="font-medium">Error loading conversations</p>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={loadConversations}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
              <p className="text-sm mt-2">
                Users will appear here when they start chatting
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.user_name || conversation.user_email}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.user_email}
                    </p>
                    {conversation.last_message_preview && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {conversation.last_message_preview.content}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.last_message_at)}
                    </span>
                    {conversation.unread_count > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.user_name ||
                        selectedConversation.user_email}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.user_email}
                    </p>
                  </div>
                </div>
                {selectedConversation.unread_count > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {selectedConversation.unread_count} unread
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet.</p>
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
                      const isFromCurrentUser = message.sender_role === "admin";

                      return (
                        <div
                          key={`admin-message-${message.id}`}
                          className={`flex ${
                            isFromCurrentUser ? "justify-end" : "justify-start"
                          } mb-2`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isFromCurrentUser
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-800 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`flex items-center justify-end mt-1 space-x-1 ${
                                isFromCurrentUser
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                Select a conversation
              </h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatInterface;
