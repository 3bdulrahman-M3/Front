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
  createConversation,
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  };

  // Load conversation and messages
  const loadConversation = async () => {
    try {
      setLoading(true);
      console.log("Loading conversation...");
      
      let conversationData;
      try {
        conversationData = await getConversation();
        console.log("Conversation data:", conversationData);
      } catch (err) {
        console.log("No existing conversation, creating new one...");
        if (err.response?.status === 404) {
          // Create new conversation if none exists
          conversationData = await createConversation();
          console.log("Created new conversation:", conversationData);
        } else {
          throw err;
        }
      }
      
      setConversation(conversationData);

      if (conversationData && conversationData.id) {
        // Load messages
        const messagesData = await getConversationMessages(conversationData.id);
        const messagesList = messagesData.results || messagesData;
        console.log("Loaded messages:", messagesList);
        setMessages(messagesList);

        // Mark conversation as read if user is not admin
        if (!isAdmin) {
          await markConversationRead(conversationData.id);
          // Refresh messages to get updated read status
          const updatedMessagesData = await getConversationMessages(
            conversationData.id
          );
          const updatedMessagesList = updatedMessagesData.results || updatedMessagesData;
          console.log("Updated messages after marking as read:", updatedMessagesList);
          setMessages(updatedMessagesList);
        }
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

    console.log("Sending message:", newMessage.trim());
    console.log("Conversation ID:", conversation.id);

    try {
      setSending(true);
      const messageData = await sendMessage(conversation.id, {
        content: newMessage.trim(),
        message_type: "text",
      });

      console.log("Message sent successfully:", messageData);
      setMessages((prev) => {
        const newMessages = [...prev, messageData];
        console.log("Updated messages:", newMessages);
        return newMessages;
      });
      setNewMessage("");

      // Scroll to bottom after sending - use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 50);
      });
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

      console.log("Polling messages - current count:", messages.length, "new count:", newMessages.length);

      // Always update messages to get latest read status
      setMessages(newMessages);

      // Scroll to bottom if we have new messages
      if (newMessages.length > messages.length) {
        console.log("New messages detected, scrolling to bottom");
        requestAnimationFrame(() => {
          setTimeout(scrollToBottom, 50);
        });
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
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        setTimeout(scrollToBottom, 100);
      });
    }
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
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden min-h-0 border border-gray-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white p-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isAdmin ? "Admin Chat" : "Support Chat"}
              </h2>
              <p className="text-blue-100 text-xs font-medium">
                {isAdmin
                  ? `Chatting with ${conversation?.user_name || "User"}`
                  : "We're here to help you!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 flex items-center space-x-1 animate-pulse">
              <span>{unreadCount}</span>
              <span className="text-xs">new</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 min-h-0">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Support Chat!</h3>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
              Start a conversation with our support team.
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-white text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-gray-200">
                  {date}
                </div>
              </div>

               {/* Messages for this date */}
               {dateMessages.map((message) => {
                 // Get current user from localStorage
                 const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                 const currentUserRole = currentUser.role;
                 
                 // Determine if this message is from the current user or admin
                 const isFromCurrentUser = message.sender_role === currentUserRole;
                 const isUserMessage = message.sender_role === "student";
                 const isAdminMessage = message.sender_role === "admin";

                 return (
                   <div
                     key={`message-${message.id}`}
                     className={`flex ${
                       isFromCurrentUser ? "justify-end" : "justify-start"
                     } mb-3 group`}
                   >
                     <div className={`flex items-end space-x-2 max-w-xs lg:max-w-sm ${
                       isFromCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                     }`}>
                       {/* Avatar */}
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                         isFromCurrentUser 
                           ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
                           : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                       }`}>
                         {isFromCurrentUser ? "U" : "S"}
                       </div>
                       
                       {/* Message Bubble */}
                       <div className={`relative px-3 py-2 rounded-xl shadow-sm ${
                         isFromCurrentUser
                           ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                           : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                       }`}>
                         <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                         
                         {/* Message Footer */}
                         <div className={`flex items-center justify-end mt-1 space-x-1 ${
                           isFromCurrentUser ? "text-blue-100" : "text-gray-400"
                         }`}>
                           <span className="text-xs">
                             {formatTime(message.created_at)}
                           </span>
                           {isFromCurrentUser && (
                             <div className="ml-1">
                               {message.is_read ? (
                                 <CheckCheck className="h-2 w-2 text-blue-200" />
                               ) : (
                                 <Check className="h-2 w-2 text-blue-200" />
                               )}
                             </div>
                           )}
                         </div>
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
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-400 text-sm"
              disabled={sending}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
              Enter
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
