import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { Lead } from "../types";
import { updateLead } from "../redux/slices/leadsSlice";

interface EditModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Predefined tag options
export const TAG_OPTIONS = [
  "Interested",
  "Most Interested",
  "Least Interested",
  "Not Interested",
  "Not Picking Call",
  "Number Busy",
  "Invalid Phone Number",
  "Invalid Whatsapp Number",
  "Will Tell Later",
  "Junk",
];

// Add "Qualified" as a special tag
const QUALIFICATION_TAGS = ["Qualified"];

const CompactEditModal: React.FC<EditModalProps> = ({
  leadId,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get lead from Redux store
  const leads = useSelector((state: RootState) => state.leads.leads);
  const isLoading = useSelector((state: RootState) => state.leads.isLoading);

  // Find the current lead in the Redux store
  const currentLead = leads.find((lead) => lead.id === leadId);

  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "additional">("basic");

  // Initialize the form when modal opens or lead changes
  useEffect(() => {
    if (currentLead) {
      setEditedLead({ ...currentLead });
    }
  }, [currentLead, isOpen]);

  if (!isOpen || !editedLead) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedLead((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setEditedLead((prev) => {
      if (!prev) return prev;

      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedLead) return;

    try {
      // Dispatch Redux action to update the lead
      const result = await dispatch(updateLead(editedLead)).unwrap();
      console.log("Lead updated successfully:", result);
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Edit Lead</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Close modal"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-3">
          <button
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === "basic"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("basic")}
            type="button"
          >
            Basic Info
          </button>
          <button
            className={`pb-2 px-3 text-sm font-medium ${
              activeTab === "additional"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("additional")}
            type="button"
          >
            Additional Info
          </button>
        </div>

        <form
          id="lead-edit-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >
          {activeTab === "basic" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedLead.name || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="leadPhoneNumber"
                    value={editedLead.leadPhoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editedLead.email || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    NEET Score
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    name="neetScore"
                    value={editedLead.neetScore || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="preferredCountry"
                    value={editedLead.preferredCountry || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editedLead.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Qualification Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Qualification
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {QUALIFICATION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full ${
                        editedLead.tags?.includes(tag)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Interest Level
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full ${
                        editedLead.tags?.includes(tag)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "additional" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={editedLead.city || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={editedLead.state || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    name="source"
                    value={editedLead.source || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    name="businessPhoneNumber"
                    value={editedLead.businessPhoneNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={editedLead.notes || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompactEditModal;
