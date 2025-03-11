import React, { useState, useRef, useEffect } from "react";
import { Lead, Message } from "../types";
import moment from "moment";

interface ChatProps {
  lead: Lead | null;
}

// Interface for grouped messages by date
interface MessageGroup {
  date: string;
  messages: Message[];
}

const Chat: React.FC<ChatProps> = ({ lead }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialRender, setInitialRender] = useState(true);

  // Update messages when lead changes

  useEffect(() => {
    if (lead?.chatHistory) {
      setMessages(lead.chatHistory);
    } else {
      setMessages([]);
    }
  }, [lead]);

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on initial render
    if (!initialRender) {
      scrollToBottom();
    } else {
      setInitialRender(false);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!lead)
    return (
      <div className="text-center py-10 text-gray-500">
        Select a lead to start chatting
      </div>
    );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Create a new message
    const newMessage: Message = {
      messageId: Date.now().toString(),
      content: message,
      role: "assistant",
      timestamp: new Date(),
      status: "sent",
    };

    // Add message to the messages array
    setMessages([...messages, newMessage]);

    // Clear the input
    setMessage("");

    // Here you would also want to call an API to actually send the message
    console.log("Sending message:", newMessage);
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
    // First sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    // Then group by date
    const groups: { [key: string]: Message[] } = {};

    sortedMessages.forEach((msg) => {
      const dateKey = moment(msg.timestamp).format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });

    // Convert to array of groups with formatted dates
    return Object.keys(groups).map((dateKey) => ({
      date: moment(dateKey).format("MMM D, YYYY"),
      messages: groups[dateKey],
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* WhatsApp-style header */}
      <div className="p-3 bg-emerald-700 text-white flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-emerald-700 font-bold">
          {lead?.name?.slice(0, 2).toUpperCase() || "UN"}
        </div>
        <div className="ml-3">
          <p className="font-medium">{lead.name || "Unknown"}</p>
        </div>
      </div>

      {/* Chat background with pattern */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23e5e5e5' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      >
        {messageGroups.length > 0 ? (
          messageGroups.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date divider */}
              <div className="flex justify-center mb-3">
                <div className="bg-white rounded-lg px-3 py-1 text-xs text-gray-500 shadow">
                  {group.date}
                </div>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg) => {
                // Format timestamp using moment
                const messageTime = moment(msg.timestamp).format("h:mm A");

                return (
                  <div
                    key={msg.messageId}
                    className={`flex ${
                      msg.role === "lead" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${
                        msg.role === "assistant"
                          ? "bg-emerald-100 rounded-tl-none"
                          : "bg-white rounded-tr-none"
                      }`}
                    >
                      <p className="text-gray-800">{msg.content}</p>
                      <div className="flex justify-end items-center mt-1">
                        <p className="text-xs text-gray-500 mr-1">
                          {messageTime}
                        </p>
                        {msg.role === "assistant" && (
                          <svg
                            width="16"
                            height="11"
                            viewBox="0 0 16 11"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-emerald-500"
                          >
                            <path
                              d="M10.7 0.300L5.49999 5.5L2.29999 2.3C1.89999 1.9 1.29999 1.9 0.899994 2.3C0.499994 2.7 0.499994 3.3 0.899994 3.7L4.89999 7.7C5.29999 8.1 5.89999 8.1 6.29999 7.7L12.1 1.7C12.5 1.3 12.5 0.7 12.1 0.3C11.7 -0.1 11.1 -0.1 10.7 0.3Z"
                              fill="currentColor"
                            />
                            <path
                              d="M14.7 0.300L6.3 8.7C5.9 9.1 5.9 9.7 6.3 10.1C6.5 10.3 6.7 10.4 7 10.4C7.3 10.4 7.5 10.3 7.7 10.1L16.1 1.7C16.5 1.3 16.5 0.7 16.1 0.3C15.7 -0.1 15.1 -0.1 14.7 0.3Z"
                              fill="currentColor"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style input box */}
      <div className="p-3 bg-gray-50 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="rounded-full bg-white flex-1 flex items-center border border-gray-200 overflow-hidden">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 px-3 py-2 focus:outline-none"
            />
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            className="ml-2 p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 flex items-center justify-center"
            disabled={!message.trim()}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
