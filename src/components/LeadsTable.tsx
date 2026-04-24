import React, { useState, useEffect } from "react";
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

const getScoreBadgeColor = (score: number | null | undefined): string => {
  if (score == null) return "bg-gray-100 text-gray-500";
  if (score >= 70) return "bg-green-100 text-green-700";
  if (score >= 40) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getScoreLabel = (score: number | null | undefined): string => {
  if (score == null) return "—";
  if (score >= 80) return `${score} · Hot`;
  if (score >= 60) return `${score} · Warm`;
  if (score >= 40) return `${score} · Neutral`;
  if (score >= 20) return `${score} · Cold`;
  return `${score} · Junk`;
};

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

const getStageLabel = (stage?: string): string => {
  switch (stage) {
    case "not_responding": return "Not Responding";
    case "call_started": return "Call Started";
    case "follow_up": return "Follow Up";
    case "documents_requested": return "Documents Requested";
    case "documents_received": return "Documents Received";
    case "application_submitted": return "Application Submitted";
    case "closed_won": return "Closed Won";
    case "closed_lost": return "Closed Lost";
    default: return "New Lead";
  }
};

const getStageColor = (stage?: string): string => {
  switch (stage) {
    case "not_responding": return "bg-yellow-100 text-yellow-800";
    case "call_started": return "bg-blue-100 text-blue-800";
    case "follow_up": return "bg-purple-100 text-purple-800";
    case "documents_requested": return "bg-indigo-100 text-indigo-800";
    case "documents_received": return "bg-teal-100 text-teal-800";
    case "application_submitted": return "bg-cyan-100 text-cyan-800";
    case "closed_won": return "bg-green-100 text-green-800";
    case "closed_lost": return "bg-gray-100 text-gray-800";
    default: return "bg-blue-100 text-blue-800";
  }
};

const formatCreatedAt = (createdAt?: string | Date): string => {
  if (!createdAt) return "Unknown";
  return moment(createdAt).fromNow();
};

interface LeadsTableProps {
  lastLeadElementRef?: (node: HTMLTableRowElement | HTMLDivElement) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ lastLeadElementRef }) => {
  const dispatch = useDispatch<AppDispatch>();
  const leads = useSelector(selectLeads);
  const selectedLeadId = useSelector((state: RootState) => state.leads.selectedLeadId);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");
  const [showAssignPopup, setShowAssignPopup] = useState<string | null>(null);

  const currentLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  // Close slide-over on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSlideOverOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSelectLead = (leadId: string) => {
    dispatch(setSelectedLead(leadId));
    setSlideOverOpen(true);
    setActiveTab("profile");
  };

  const handleEditLead = (leadId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch(setSelectedLead(leadId));
    setIsEditModalOpen(true);
  };

  const handleCall = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:+${phoneNumber}`;
  };

  const handleAssignToMe = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        dispatch(updateLead({ ...lead, assignedTo: { id: currentUser.id, name: currentUser.username } }));
      }
    }
    setShowAssignPopup(null);
  };

  const handleUnassign = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      dispatch(updateLead({ ...lead, assignedTo: null }));
    }
    setShowAssignPopup(null);
  };

  const toggleAssignPopup = (leadId: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowAssignPopup(leadId === showAssignPopup ? null : leadId);
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-400">
        <svg className="mx-auto h-10 w-10 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">No leads found matching your criteria</p>
      </div>
    );
  }

  const AssignDropdown = (leadId: string, isAssigned: boolean) => (
    <div className="absolute z-20 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
      <ul className="py-1">
        <li
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
          onClick={(e) => handleAssignToMe(leadId, e)}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {isAssigned ? "Reassign to me" : "Assign to me"}
        </li>
        {isAssigned && (
          <li
            className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
            onClick={(e) => handleUnassign(leadId, e)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove assignment
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <>
      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags / Stage</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                ref={
                  index === leads.length - 1 && lastLeadElementRef
                    ? (node) => { if (node instanceof HTMLTableRowElement) lastLeadElementRef(node); }
                    : undefined
                }
                className={`cursor-pointer transition-colors duration-100 hover:bg-indigo-50/40 ${
                  selectedLeadId === lead.id ? "bg-indigo-50 border-l-2 border-indigo-400" : ""
                }`}
                onClick={() => handleSelectLead(lead.id)}
              >
                {/* Lead */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">
                        {lead?.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{lead?.name || "Unknown"}</div>
                      <div className="text-xs text-gray-400">{lead?.source || "WhatsApp"}</div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-3.5">
                  <div
                    className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline"
                    onClick={(e) => handleCall(lead.leadPhoneNumber, e)}
                  >
                    +{lead?.leadPhoneNumber}
                  </div>
                  {lead.email && <div className="text-xs text-gray-400 mt-0.5">{lead.email}</div>}
                </td>

                {/* Country */}
                <td className="px-5 py-3.5">
                  <div className="text-sm text-gray-700">{lead?.preferredCountry || "—"}</div>
                  {lead.location && <div className="text-xs text-gray-400">{lead.location}</div>}
                </td>

                {/* Assigned To */}
                <td className="px-5 py-3.5">
                  <div className="relative">
                    {lead?.assignedTo?.id ? (
                      <div
                        className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1 w-fit"
                        onClick={(e) => toggleAssignPopup(lead.id, e)}
                      >
                        <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 text-xs font-semibold">
                            {lead?.assignedTo?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{lead?.assignedTo?.name}</span>
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => toggleAssignPopup(lead.id, e)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Assign
                      </button>
                    )}
                    {showAssignPopup === lead.id && AssignDropdown(lead.id, !!lead?.assignedTo?.id)}
                  </div>
                </td>

                {/* Score */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreBadgeColor(lead.leadQualityScore)}`}>
                    {getScoreLabel(lead.leadQualityScore)}
                  </span>
                  {lead.leadQualityScoreReason && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={lead.leadQualityScoreReason}>
                      {lead.leadQualityScoreReason}
                    </p>
                  )}
                </td>

                {/* Tags / Stage */}
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {lead.tags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(i)}`}>
                        {tag}
                      </span>
                    ))}
                    {(lead.tags?.length ?? 0) > 2 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        +{(lead.tags?.length ?? 0) - 2}
                      </span>
                    )}
                    {lead.stage && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                        {getStageLabel(lead.stage)}
                      </span>
                    )}
                  </div>
                </td>

                {/* Created */}
                <td className="px-5 py-3.5">
                  <div className="text-xs text-gray-500 whitespace-nowrap">{formatCreatedAt(lead.createdAt)}</div>
                </td>

                {/* Edit */}
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={(e) => handleEditLead(lead.id, e)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            ref={
              index === leads.length - 1 && lastLeadElementRef
                ? (node) => { if (node instanceof HTMLDivElement) lastLeadElementRef(node); }
                : undefined
            }
            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-colors ${
              selectedLeadId === lead.id ? "border-indigo-300 bg-indigo-50/30" : "border-gray-100"
            }`}
            onClick={() => handleSelectLead(lead.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{lead?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{lead?.name || "Unknown"}</div>
                  <div className="text-xs text-gray-400">{lead?.source || "WhatsApp"}</div>
                </div>
              </div>
              <button
                onClick={(e) => handleEditLead(lead.id, e)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-xs text-gray-400">Contact</div>
                <div className="text-indigo-600 font-medium" onClick={(e) => handleCall(lead.leadPhoneNumber, e)}>
                  +{lead?.leadPhoneNumber}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Country</div>
                <div className="text-gray-700">{lead?.preferredCountry || "—"}</div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreBadgeColor(lead.leadQualityScore)}`}>
                {getScoreLabel(lead.leadQualityScore)}
              </span>
              <span className="text-xs text-gray-400">{formatCreatedAt(lead.createdAt)}</span>
            </div>

            {lead.leadQualityScoreReason && (
              <p className="mt-1 text-xs text-gray-400 truncate">{lead.leadQualityScoreReason}</p>
            )}

            <div className="mt-2 flex flex-wrap gap-1">
              {lead.tags?.slice(0, 2).map((tag, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(i)}`}>{tag}</span>
              ))}
              {lead.stage && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                  {getStageLabel(lead.stage)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Slide-Over Panel ── */}
      {slideOverOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSlideOverOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "profile"
                      ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "chat"
                      ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Chat
                </button>
              </div>
              <button
                onClick={() => setSlideOverOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {currentLead ? (
                activeTab === "profile" ? (
                  <div className="h-full overflow-y-auto">
                    <LeadProfile lead={currentLead} />
                  </div>
                ) : (
                  <Chat lead={currentLead} />
                )
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Select a lead to view details
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <CompactEditModal
        leadId={selectedLeadId}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default LeadsTable;
