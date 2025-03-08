// ChatArea.tsx
import React from "react";
import { WhatsAppNumber, Message } from "../../types";

interface ChatAreaProps {
  selectedContactId: string | null;
  selectedContact: WhatsAppNumber | undefined;
  messages: Message[];
  handleRemoveContact: (id: string) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  setShowAddPopup: (show: boolean) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedContactId,
  selectedContact,
  messages,
  handleRemoveContact,
  newMessage,
  setNewMessage,
  handleSendMessage,
  setShowAddPopup,
}) => {
  // Format time for chat bubbles
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedContactId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            WhatsApp Web
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Select a chat to view messages or start a new conversation
          </p>
          <button
            onClick={() => setShowAddPopup(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Start New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
            {selectedContact?.profilePic ? (
              <img
                src={selectedContact.profilePic}
                alt={selectedContact.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium">
                {selectedContact?.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900">
              {selectedContact?.name}
            </h3>
            <p className="text-xs text-gray-500">{selectedContact?.number}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button
            className="text-gray-600 hover:text-red-500"
            onClick={() => handleRemoveContact(selectedContactId)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-[#e5ded8]"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6a5a18b96d29cf.jpg')",
          backgroundSize: "cover",
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-sm">
              <p className="text-gray-600">No messages yet.</p>
              <p className="text-gray-500 text-sm mt-1">
                Send your first message to start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isIncoming ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    msg.isIncoming ? "bg-white" : "bg-green-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(msg.timestamp)}
                      {!msg.isIncoming && (
                        <span className="ml-1">
                          {msg.status === "sent" && "✓"}
                          {msg.status === "delivered" && "✓✓"}
                          {msg.status === "read" && (
                            <span className="text-blue-500">✓✓</span>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full">
            <svg
              className="w-5 h-5"
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
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full">
            <svg
              className="w-5 h-5"
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
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 py-2 px-4 bg-white border-none rounded-lg focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 ${
              newMessage.trim()
                ? "text-green-600 hover:bg-gray-200"
                : "text-gray-400"
            } rounded-full transition-colors`}
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
