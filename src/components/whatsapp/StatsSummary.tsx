// StatsSummary.tsx
import React from "react";
import { WhatsAppNumber } from "../../types";

interface StatsSummaryProps {
  contacts: WhatsAppNumber[];
  filteredContacts: WhatsAppNumber[];
}

const StatsSummary: React.FC<StatsSummaryProps> = ({
  contacts,
  filteredContacts,
}) => {
  // Calculate total unread messages
  const totalUnreadMessages = contacts.reduce(
    (sum, contact) => sum + contact.unreadCount,
    0
  );

  // Calculate contacts active today
  const activeToday = contacts.filter((contact) => {
    const today = new Date();
    return contact.lastActive.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="bg-white rounded-md px-3 py-1 shadow-sm border border-gray-200">
          <span className="font-medium">Total Contacts:</span> {contacts.length}
        </div>
        <div className="bg-white rounded-md px-3 py-1 shadow-sm border border-gray-200">
          <span className="font-medium">Filtered Contacts:</span>{" "}
          {filteredContacts.length}
        </div>
        <div className="bg-white rounded-md px-3 py-1 shadow-sm border border-gray-200">
          <span className="font-medium">Unread Messages:</span>{" "}
          {totalUnreadMessages}
        </div>
        <div className="bg-white rounded-md px-3 py-1 shadow-sm border border-gray-200">
          <span className="font-medium">Active Today:</span> {activeToday}
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;
