// ContactList.tsx
import React from "react";
import { WhatsAppNumber, SortOption } from "../../types";

interface ContactListProps {
  contacts: WhatsAppNumber[];
  selectedContactId: string | null;
  setSelectedContactId: (id: string) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowAddPopup: (show: boolean) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContactId,
  setSelectedContactId,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  setShowAddPopup,
}) => {
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
  );
};

export default ContactList;
