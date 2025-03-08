// BroadcastGroupModal.tsx
import React, { useState } from "react";
import { WhatsAppNumber } from "../../types";

interface BroadcastGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: WhatsAppNumber[];
  onCreateBroadcastGroup: (name: string, contactIds: string[]) => void;
}

const BroadcastGroupModal: React.FC<BroadcastGroupModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onCreateBroadcastGroup,
}) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  const handleToggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(
        selectedContactIds.filter((id) => id !== contactId)
      );
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const handleSubmit = () => {
    if (!groupName.trim()) {
      setError("Please enter a broadcast group name");
      return;
    }

    if (selectedContactIds.length === 0) {
      setError("Please select at least one contact");
      return;
    }

    onCreateBroadcastGroup(groupName, selectedContactIds);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedContactIds([]);
    setGroupName("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Create Broadcast Group
            </h2>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
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
                Broadcast Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Contacts ({selectedContactIds.length} selected)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                {contacts.length === 0 ? (
                  <div className="p-3 text-gray-500 text-center">
                    No contacts available
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <li key={contact.id} className="p-3 hover:bg-gray-50">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedContactIds.includes(contact.id)}
                            onChange={() => handleToggleContact(contact.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-800">
                              {contact.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {contact.number}
                            </div>
                          </div>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              disabled={selectedContactIds.length === 0 || !groupName.trim()}
            >
              Create Broadcast Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastGroupModal;
