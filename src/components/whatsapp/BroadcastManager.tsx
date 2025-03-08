// BroadcastManager.tsx
import React, { useState } from "react";
import { WhatsAppNumber } from "../../types";

export interface BroadcastGroup {
  id: string;
  name: string;
  contactIds: string[];
  createdAt: Date;
  lastMessageSent?: string;
  lastMessageTime?: Date;
}

interface BroadcastManagerProps {
  contacts: WhatsAppNumber[];
  broadcastGroups: BroadcastGroup[];
  onSendBroadcast: (groupId: string, message: string) => void;
  onDeleteBroadcastGroup: (groupId: string) => void;
  onShowCreateModal: () => void;
}

const BroadcastManager: React.FC<BroadcastManagerProps> = ({
  contacts,
  broadcastGroups,
  onSendBroadcast,
  onDeleteBroadcastGroup,
  onShowCreateModal,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const selectedGroup = selectedGroupId
    ? broadcastGroups.find((group) => group.id === selectedGroupId)
    : null;

  const getContactsInGroup = (groupId: string) => {
    const group = broadcastGroups.find((g) => g.id === groupId);
    if (!group) return [];

    return contacts.filter((contact) => group.contactIds.includes(contact.id));
  };

  const handleSendBroadcast = () => {
    if (selectedGroupId && broadcastMessage.trim()) {
      onSendBroadcast(selectedGroupId, broadcastMessage);
      setBroadcastMessage("");
    }
  };

  return (
    <div className="flex h-full">
      {/* Left panel - Broadcast Groups List */}
      <div className="w-72 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Broadcast Lists
          </h2>
          <button
            onClick={onShowCreateModal}
            className="p-2 text-green-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Create Broadcast Group"
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
        </div>

        <div className="overflow-y-auto h-full">
          {broadcastGroups.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No broadcast groups yet. Create one to start broadcasting
              messages.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {broadcastGroups.map((group) => (
                <li
                  key={group.id}
                  className={`hover:bg-gray-100 cursor-pointer ${
                    selectedGroupId === group.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {group.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {group.contactIds.length} member
                        {group.contactIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {group.lastMessageSent && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Last sent: {group.lastMessageSent}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right panel - Broadcast Content */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Group Header */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedGroup.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Broadcasting to {selectedGroup.contactIds.length} contact
                  {selectedGroup.contactIds.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => onDeleteBroadcastGroup(selectedGroup.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Delete broadcast group"
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

            {/* Group Members */}
            <div className="bg-white border-b border-gray-200 p-2">
              <div className="flex flex-wrap gap-2">
                {getContactsInGroup(selectedGroup.id).map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center"
                  >
                    <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-1">
                      {contact.profilePic ? (
                        <img
                          src={contact.profilePic}
                          alt={contact.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {contact.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {contact.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Composer */}
            <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6">
              <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-medium mb-2">Compose Broadcast Message</h4>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type your broadcast message here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSendBroadcast}
                    disabled={!broadcastMessage.trim()}
                    className={`
                      px-4 py-2 rounded-md flex items-center
                      ${
                        broadcastMessage.trim()
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }
                    `}
                  >
                    <svg
                      className="w-5 h-5 mr-1"
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
                    Send Broadcast
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Broadcast Messages
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Select a broadcast group to send messages to multiple contacts
                at once.
              </p>
              <button
                onClick={onShowCreateModal}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Create Broadcast Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastManager;
