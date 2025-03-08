// AddContactPopup.tsx
import React from "react";

interface AddContactPopupProps {
  showAddPopup: boolean;
  setShowAddPopup: (show: boolean) => void;
  newName: string;
  setNewName: (name: string) => void;
  newNumber: string;
  setNewNumber: (number: string) => void;
  error: string;
  handleAddContact: () => void;
}

const AddContactPopup: React.FC<AddContactPopupProps> = ({
  showAddPopup,
  setShowAddPopup,
  newName,
  setNewName,
  newNumber,
  setNewNumber,
  error,
  handleAddContact,
}) => {
  if (!showAddPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Contact</h2>
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
  );
};

export default AddContactPopup;
