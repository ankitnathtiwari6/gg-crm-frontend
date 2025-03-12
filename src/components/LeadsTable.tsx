import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  setSelectedLead,
  selectLeads,
  updateLead,
} from "../redux/slices/leadsSlice";
import LeadProfile from "./LeadProfile";
import Chat from "./Chat";
import CompactEditModal from "./CompactEditModal";

const getTagColor = (index: number): string => {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
    "bg-red-100 text-red-800",
    "bg-teal-100 text-teal-800",
  ];
  return colors[index % colors.length];
};

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

interface LeadsTableProps {
  lastLeadElementRef?: (node: HTMLTableRowElement) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ lastLeadElementRef }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get leads from Redux
  const leads = useSelector(selectLeads);
  // Get selected lead ID from Redux
  const selectedLeadId = useSelector(
    (state: RootState) => state.leads.selectedLeadId
  );
  // Get current user for assignment
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");
  const [showAssignPopup, setShowAssignPopup] = useState<string | null>(null);

  // Find the currently selected lead
  const currentLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  const handleEditLead = (leadId: string) => {
    dispatch(setSelectedLead(leadId));
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleMouseEnter = (leadId: string) => {
    dispatch(setSelectedLead(leadId));
  };

  const handleCall = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAssignToMe = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(currentUser);

    if (currentUser) {
      const leadToUpdate = leads.find((lead) => lead.id === leadId);
      if (leadToUpdate) {
        const updatedLead = {
          ...leadToUpdate,
          assignedTo: { id: currentUser.id, name: currentUser.username },
        };
        dispatch(updateLead(updatedLead));
      }
    }
    setShowAssignPopup(null);
  };

  const toggleAssignPopup = (leadId: string | null, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowAssignPopup(leadId === showAssignPopup ? null : leadId);
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
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tags
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedLeadId === lead.id ? "bg-green-50" : ""
                  }`}
                  ref={
                    index === leads.length - 1 && lastLeadElementRef
                      ? lastLeadElementRef
                      : null
                  }
                  onClick={() => handleMouseEnter(lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-800 font-medium">
                          {lead?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lead?.source || "WhatsApp"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-blue-600 cursor-pointer hover:underline"
                      onClick={(e) => handleCall(lead.leadPhoneNumber, e)}
                    >
                      {lead?.leadPhoneNumber}
                    </div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {lead?.preferredCountry}
                    </div>
                    <div className="text-xs text-gray-500">{lead.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    {lead?.assignedTo?.id ? (
                      <div className="text-sm text-gray-900 flex items-center">
                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-blue-800 text-xs font-medium">
                            {lead?.assignedTo?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        {lead?.assignedTo?.name}
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={(e) => toggleAssignPopup(lead.id, e)}
                          className="cursor-pointer px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none"
                        >
                          + Assign
                        </button>
                        {showAssignPopup === lead.id && (
                          <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
                            <ul className="py-1">
                              <li
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                                onClick={(e) => handleAssignToMe(lead.id, e)}
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                Assign to me
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {lead.tags && lead.tags.length > 0
                        ? lead.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-2 py-1 rounded-full text-xs ${getTagColor(
                                tagIndex
                              )}`}
                            >
                              {tag}
                            </span>
                          ))
                        : null}

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
                      onClick={() => handleEditLead(lead.id)}
                      className="text-green-600 hover:text-green-900 cursor-pointer"
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
                onEdit={() => handleEditLead(currentLead.id)}
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

      {/* Edit Modal - Now only passing the leadId instead of the entire lead object */}
      <CompactEditModal
        leadId={selectedLeadId}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default LeadsTable;
