import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

// Types
type SortOption = "latest" | "longest" | "relevant" | "oldest";

type WhatsAppNumber = {
  id: string;
  number: string;
  name: string;
  lastMessage: string;
  lastActive: Date;
  messageCount: number;
  relevanceScore: number;
  unreadCount: number;
  profilePic: string;
};

type Message = {
  id: string;
  content: string;
  timestamp: Date;
  isIncoming: boolean;
  status: "sent" | "delivered" | "read";
};

export const WhatsAppNumbersPage: React.FC = () => {
  // State for WhatsApp numbers
  const [contacts, setContacts] = useState<WhatsAppNumber[]>([
    {
      id: "1",
      number: "+91 98765 43210",
      name: "John Doe",
      lastMessage: "Hey, can you check the latest report?",
      lastActive: new Date(),
      messageCount: 156,
      relevanceScore: 8.5,
      unreadCount: 2,
      profilePic: "",
    },
    {
      id: "2",
      number: "+91 87654 32109",
      name: "Jane Smith",
      lastMessage: "Thanks for your help yesterday!",
      lastActive: new Date(Date.now() - 3600000), // 1 hour ago
      messageCount: 89,
      relevanceScore: 7.2,
      unreadCount: 0,
      profilePic: "",
    },
    {
      id: "3",
      number: "+91 76543 21098",
      name: "Business Team",
      lastMessage: "The meeting is rescheduled to 3pm",
      lastActive: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 312,
      relevanceScore: 9.1,
      unreadCount: 5,
      profilePic: "",
    },
  ]);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Mock messages for the selected contact
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "m1",
        content: "Hey, can you check the latest report?",
        timestamp: new Date(Date.now() - 3600000),
        isIncoming: true,
        status: "read",
      },
      {
        id: "m2",
        content: "Sure, I'll take a look at it now.",
        timestamp: new Date(Date.now() - 3500000),
        isIncoming: false,
        status: "read",
      },
      {
        id: "m3",
        content: "Let me know if you need any clarification.",
        timestamp: new Date(Date.now() - 3400000),
        isIncoming: false,
        status: "read",
      },
    ],
    "2": [
      {
        id: "m4",
        content: "Hi Jane, how are you?",
        timestamp: new Date(Date.now() - 7200000),
        isIncoming: false,
        status: "read",
      },
      {
        id: "m5",
        content: "I'm good, thanks for asking! Just finished the project.",
        timestamp: new Date(Date.now() - 7000000),
        isIncoming: true,
        status: "read",
      },
      {
        id: "m6",
        content: "Thanks for your help yesterday!",
        timestamp: new Date(Date.now() - 3600000),
        isIncoming: true,
        status: "read",
      },
    ],
    "3": [
      {
        id: "m7",
        content: "Good morning team!",
        timestamp: new Date(Date.now() - 172800000),
        isIncoming: false,
        status: "read",
      },
      {
        id: "m8",
        content: "The meeting is rescheduled to 3pm",
        timestamp: new Date(Date.now() - 86400000),
        isIncoming: true,
        status: "read",
      },
    ],
  });

  // Validate phone number
  const validatePhoneNumber = (number: string) => {
    // Basic validation - can be enhanced with proper regex for international formats
    return number.trim().length >= 10;
  };

  // Handle adding a new contact
  const handleAddContact = () => {
    if (!newNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    if (!validatePhoneNumber(newNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!newName.trim()) {
      setError("Please enter a name");
      return;
    }

    const newContact: WhatsAppNumber = {
      id: Date.now().toString(),
      number: newNumber.trim(),
      name: newName.trim(),
      lastMessage: "No messages yet",
      lastActive: new Date(),
      messageCount: 0,
      relevanceScore: 5.0,
      unreadCount: 0,
      profilePic: "",
    };

    setContacts([...contacts, newContact]);
    setMessages({
      ...messages,
      [newContact.id]: [],
    });
    setNewNumber("");
    setNewName("");
    setError("");
    setShowAddPopup(false);
  };

  // Handle removing a contact
  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    if (selectedContactId === id) {
      setSelectedContactId(null);
    }
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContactId) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      isIncoming: false,
      status: "sent",
    };

    // Update messages
    const updatedMessages = {
      ...messages,
      [selectedContactId]: [...(messages[selectedContactId] || []), newMsg],
    };
    setMessages(updatedMessages);

    // Update contact's last message
    const updatedContacts = contacts.map((contact) => {
      if (contact.id === selectedContactId) {
        return {
          ...contact,
          lastMessage: newMessage,
          lastActive: new Date(),
          messageCount: contact.messageCount + 1,
        };
      }
      return contact;
    });
    setContacts(updatedContacts);

    // Clear input
    setNewMessage("");
  };

  // Sort contacts based on selected option
  const getSortedContacts = () => {
    const filteredContacts = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.number.includes(searchQuery)
    );

    switch (sortBy) {
      case "latest":
        return [...filteredContacts].sort(
          (a, b) => b.lastActive.getTime() - a.lastActive.getTime()
        );
      case "oldest":
        return [...filteredContacts].sort(
          (a, b) => a.lastActive.getTime() - b.lastActive.getTime()
        );
      case "longest":
        return [...filteredContacts].sort(
          (a, b) => b.messageCount - a.messageCount
        );
      case "relevant":
        return [...filteredContacts].sort(
          (a, b) => b.relevanceScore - a.relevanceScore
        );
      default:
        return filteredContacts;
    }
  };

  const sortedContacts = getSortedContacts();
  const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const currentMessages = selectedContactId
    ? messages[selectedContactId] || []
    : [];

  // Format time for chat bubbles
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for chat list
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Chats List (Left Panel) */}
          <div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col">
            {/* Search and Filter Controls */}
            <div className="p-3 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddPopup(true)}
                    className="p-2 text-green-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Add New Contact"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm p-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="longest">Longest History</option>
                    <option value="relevant">Most Relevant</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-gray-100 border-none rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                </div>
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto bg-white">
              {sortedContacts.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-center">
                    No contacts found. Add a new contact to start chatting.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {sortedContacts.map((contact) => (
                    <li
                      key={contact.id}
                      className={`hover:bg-gray-100 transition-colors cursor-pointer ${
                        selectedContactId === contact.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => setSelectedContactId(contact.id)}
                    >
                      <div className="p-3 flex items-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          {contact.profilePic ? (
                            <img
                              src={contact.profilePic}
                              alt={contact.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {contact.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {contact.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatLastActive(contact.lastActive)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500 truncate max-w-[180px]">
                              {contact.lastMessage}
                            </p>
                            {contact.unreadCount > 0 && (
                              <span className="bg-green-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat Area (Right Panel) */}
          <div className="flex-1 flex flex-col">
            {selectedContactId ? (
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
                      <p className="text-xs text-gray-500">
                        {selectedContact?.number}
                      </p>
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
                  {currentMessages.length === 0 ? (
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
                      {currentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.isIncoming ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                              msg.isIncoming
                                ? "bg-white"
                                : "bg-green-100 text-gray-800"
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Add New Contact
                </h2>
                <button
                  onClick={() => setShowAddPopup(false)}
                  className="text-gray-500 hover:text-gray-700"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g. +91 12345 67890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddPopup(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppNumbersPage;
