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
import moment from "moment";

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

// Format the createdAt time in a relative format
const formatCreatedAt = (createdAt?: string | Date): string => {
  if (!createdAt) return "Unknown";
  return moment(createdAt).fromNow(); // This will return strings like "2 minutes ago", "3 days ago", etc.
};

interface LeadsTableProps {
  lastLeadElementRef?: (node: HTMLTableRowElement | HTMLDivElement) => void;
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
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Find the currently selected lead
  const currentLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  const handleEditLead = (leadId: string) => {
    dispatch(setSelectedLead(leadId));
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSelectLead = (leadId: string) => {
    dispatch(setSelectedLead(leadId));
    setShowMobileDetail(true); // Show detail panel on mobile when a lead is selected
  };

  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

  const handleCall = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleAssignToMe = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();

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

  const handleUnassign = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const leadToUpdate = leads.find((lead) => lead.id === leadId);
    if (leadToUpdate) {
      const updatedLead = {
        ...leadToUpdate,
        assignedTo: null,
      };
      dispatch(updateLead(updatedLead));
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

  // Assign/Reassign dropdown content
  const AssignDropdown = (leadId: string, isAssigned: boolean) => (
    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg">
      <ul className="py-1">
        <li
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
          onClick={(e) => handleAssignToMe(leadId, e)}
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
          {isAssigned ? "Reassign to me" : "Assign to me"}
        </li>
        {isAssigned && (
          <li
            className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={(e) => handleUnassign(leadId, e)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Remove assignment
          </li>
        )}
      </ul>
    </div>
  );

  // Mobile card view for leads
  const MobileLeadCards = (
    <div className="space-y-4">
      {leads.map((lead, index) => (
        <div
          key={lead.id}
          className={`bg-white rounded-lg shadow p-4 ${
            selectedLeadId === lead.id ? "border-l-4 border-green-500" : ""
          }`}
          onClick={() => handleSelectLead(lead.id)}
          ref={
            index === leads.length - 1 && lastLeadElementRef
              ? (node) => {
                  if (node instanceof HTMLDivElement) {
                    lastLeadElementRef(node);
                  }
                }
              : undefined
          }
        >
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-800 font-medium">
                  {lead?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {lead?.name || "Unknown"}
                </div>
                <div className="text-xs text-gray-500">
                  {lead?.source || "WhatsApp"}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditLead(lead.id);
              }}
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
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">Contact</div>
              <div
                className="text-sm text-blue-600 cursor-pointer hover:underline"
                onClick={(e) => handleCall(lead.leadPhoneNumber, e)}
              >
                {`+${lead?.leadPhoneNumber}`}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Prefered Country</div>
              <div className="text-sm text-gray-900">
                {lead?.preferredCountry || lead.location || "Unknown"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Assigned To</div>
              <div className="relative">
                {lead?.assignedTo?.id ? (
                  <div
                    className="text-sm text-gray-900 flex items-center cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                    onClick={(e) => toggleAssignPopup(lead.id, e)}
                  >
                    <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mr-1">
                      <span className="text-blue-800 text-xs font-medium">
                        {lead?.assignedTo?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="mr-1">{lead?.assignedTo?.name}</span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                ) : (
                  <button
                    onClick={(e) => toggleAssignPopup(lead.id, e)}
                    className="cursor-pointer px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none flex items-center"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
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
                    Assign
                  </button>
                )}
                {showAssignPopup === lead.id &&
                  AssignDropdown(lead.id, !!lead?.assignedTo?.id)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm text-gray-500">
                {formatCreatedAt(lead.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {lead.tags && lead.tags.length > 0
                ? lead.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2 py-0.5 rounded-full text-xs ${getTagColor(
                        tagIndex
                      )}`}
                    >
                      {tag}
                    </span>
                  ))
                : null}

              {lead.stage && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${getStageColor(
                    lead.stage
                  )}`}
                >
                  {getStageLabel(lead.stage)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopLeadsTable = (
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
              Prefered Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tags
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Created
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
                  ? (node) => {
                      if (node instanceof HTMLTableRowElement) {
                        lastLeadElementRef(node);
                      }
                    }
                  : undefined
              }
              onClick={() => handleSelectLead(lead.id)}
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
                  {`+${lead?.leadPhoneNumber}`}
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
                <div className="relative">
                  {lead?.assignedTo?.id ? (
                    <div
                      className="text-sm text-gray-900 flex items-center cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
                      onClick={(e) => toggleAssignPopup(lead.id, e)}
                    >
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-800 text-xs font-medium">
                          {lead?.assignedTo?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="mr-1">{lead?.assignedTo?.name}</span>
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => toggleAssignPopup(lead.id, e)}
                      className="cursor-pointer px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none flex items-center"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
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
                      Assign
                    </button>
                  )}
                  {showAssignPopup === lead.id &&
                    AssignDropdown(lead.id, !!lead?.assignedTo?.id)}
                </div>
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
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {formatCreatedAt(lead.createdAt)}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLead(lead.id);
                  }}
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
  );

  // Detail view for desktop/mobile
  const DetailView = (
    <div className="flex flex-col bg-white rounded-lg shadow h-full">
      {/* Mobile back button */}
      {showMobileDetail && (
        <div className="md:hidden p-3 border-b flex items-center">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to leads
          </button>
        </div>
      )}

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
  );

  return (
    <div className="md:flex md:h-full md:gap-4">
      {/* Mobile view logic */}
      <div className={`md:hidden ${showMobileDetail ? "hidden" : "block"}`}>
        {MobileLeadCards}
      </div>

      <div
        className={`md:hidden ${showMobileDetail ? "block" : "hidden"} h-full`}
      >
        {DetailView}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block md:w-2/3">{DesktopLeadsTable}</div>

      <div className="hidden md:block md:w-1/3">{DetailView}</div>

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
