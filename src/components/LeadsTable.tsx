import React, { useState } from "react";
import { Lead } from "../types";
import LeadProfile from "./LeadProfile";
import Chat from "./Chat";

// Helper functions for stage display
const getStageLabel = (stage?: string): string => {
  switch (stage) {
    case "not_responding":
      return "Not Responding";
    case "call_started":
      return "Call Started";
    case "follow_up":
      return "Follow Up";
    case "documents_requested":
      return "Documents Requested";
    case "documents_received":
      return "Documents Received";
    case "application_submitted":
      return "Application Submitted";
    case "closed_won":
      return "Closed Won";
    case "closed_lost":
      return "Closed Lost";
    default:
      return "New Lead";
  }
};

const getStageColor = (stage?: string): string => {
  switch (stage) {
    case "not_responding":
      return "bg-yellow-100 text-yellow-800";
    case "call_started":
      return "bg-blue-100 text-blue-800";
    case "follow_up":
      return "bg-purple-100 text-purple-800";
    case "documents_requested":
      return "bg-indigo-100 text-indigo-800";
    case "documents_received":
      return "bg-teal-100 text-teal-800";
    case "application_submitted":
      return "bg-cyan-100 text-cyan-800";
    case "closed_won":
      return "bg-green-100 text-green-800";
    case "closed_lost":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// Edit Modal Component
interface EditModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedLead, setEditedLead] = useState<Lead>({ ...lead });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would make an API call to update the lead
      // For example:
      // await axios.put(`/api/leads/${editedLead.id}`, editedLead);

      onSave(editedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Lead</h2>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editedLead.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editedLead.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NEET Score
              </label>
              <input
                type="text"
                name="neetScore"
                value={editedLead.neetScore}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={editedLead.preferredCountry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editedLead.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={editedLead.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage
              </label>
              <select
                name="stage"
                value={editedLead.stage || "new"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              >
                <option value="new">New Lead</option>
                <option value="not_responding">Not Responding</option>
                <option value="call_started">Call Started</option>
                <option value="follow_up">Follow Up</option>
                <option value="documents_requested">Documents Requested</option>
                <option value="documents_received">Documents Received</option>
                <option value="application_submitted">
                  Application Submitted
                </option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={editedLead.notes || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={editedLead.tags ? editedLead.tags.join(", ") : ""}
                onChange={(e) =>
                  setEditedLead({
                    ...editedLead,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LeadsTableProps {
  leads: Lead[];
  lastLeadElementRef?: (node: HTMLTableRowElement) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  lastLeadElementRef,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");

  const handleEditLead = (lead: Lead) => {
    setCurrentLead(lead);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveLead = (updatedLead: Lead) => {
    // Here you would typically make an API call to update the lead
    console.log("Saving updated lead:", updatedLead);
    // For now, just close the modal
    handleCloseModal();
  };

  const handleMouseEnter = (lead: Lead) => {
    setCurrentLead(lead);
  };

  const handleCall = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phoneNumber}`;
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow py-8 text-center text-gray-500">
        No leads found matching your criteria
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left side - Leads Table */}
      <div className="w-2/3">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NEET
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Activity
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-gray-50 ${
                    currentLead?.id === lead.id ? "bg-green-50" : ""
                  }`}
                  ref={
                    index === leads.length - 1 && lastLeadElementRef
                      ? lastLeadElementRef
                      : null
                  }
                  onMouseEnter={() => handleMouseEnter(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-800 font-medium">
                          {lead.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead.source || "WhatsApp"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-blue-600 cursor-pointer hover:underline"
                      onClick={(e) => handleCall(lead.leadPhoneNumber, e)}
                    >
                      {lead.leadPhoneNumber}
                    </div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lead.preferredCountry}
                    </div>
                    <div className="text-xs text-gray-500">{lead.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    {typeof lead.neetScore === "number" ? (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {lead.neetScore}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            lead.status === "active"
                              ? "bg-green-100 text-green-800"
                              : lead.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {lead.status}
                      </span>

                      {lead.stage && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStageColor(
                            lead.stage
                          )}`}
                        >
                          {getStageLabel(lead.stage)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEditLead(lead)}
                      className="text-green-600 hover:text-green-900"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right side - Profile/Chat Tabs */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              className={`cursor-pointer py-3 px-4 font-medium ${
                activeTab === "profile"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`cursor-pointer py-3 px-4 font-medium ${
                activeTab === "chat"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          {currentLead ? (
            activeTab === "profile" ? (
              <LeadProfile
                lead={currentLead}
                onEdit={() => handleEditLead(currentLead)}
              />
            ) : (
              <Chat lead={currentLead} />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a lead to view details
            </div>
          )}
        </div>
      </div>

      {currentLead && (
        <EditModal
          lead={currentLead}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
};
