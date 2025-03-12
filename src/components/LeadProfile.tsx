import React from "react";
import { Lead } from "../types"; // Adjust the import path as needed
import moment from "moment"; // Import moment

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
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "call_started":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "follow_up":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "documents_requested":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "documents_received":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "application_submitted":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "closed_won":
      return "bg-green-50 text-green-700 border-green-200";
    case "closed_lost":
      return "bg-gray-50 text-gray-700 border-gray-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

// Format date using moment
const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "N/A";
  return moment(dateString).format("MMM DD, YYYY [at] h:mm A"); // Format: Mar 12, 2025 at 2:30 PM
};

// Elegant Lead Profile Component
interface LeadProfileProps {
  lead: Lead | null;
  onEdit?: (lead: Lead) => void;
}

const ElegantLeadProfile: React.FC<LeadProfileProps> = ({ lead, onEdit }) => {
  if (!lead)
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        <div className="text-center p-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="mt-2">Select a lead to view details</p>
        </div>
      </div>
    );

  const handleEditClick = () => {
    if (onEdit && lead) {
      onEdit(lead);
    }
  };

  return (
    <div className="h-full w-full min-h-[80vh] flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-11 h-11 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-800 font-bold border-2 border-white border-opacity-30">
              {lead?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold">{lead.name}</h2>
              <p className="text-xs text-indigo-100 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {lead.location}
              </p>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-blue-800 text-xs rounded-md transition-colors duration-150 flex items-center"
          >
            <svg
              className="w-3.5 h-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </div>

        {/* Status pills row */}
        <div className="flex mt-4 space-x-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              lead.qualifiedLead
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {lead.qualifiedLead ? "Qualified" : "Not Qualified"}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(
              lead.stage
            )}`}
          >
            {getStageLabel(lead.stage)}
          </span>
        </div>
      </div>

      {/* Body content with cards */}
      <div className="flex-1 p-4 space-y-4 bg-gray-50 overflow-y-auto">
        {/* Academic Information Card */}
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
          <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
            Academic Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">NEET Status</p>
              <p className="font-medium">{lead.neetStatus}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">NEET Score</p>
              <p className="font-medium">{lead.neetScore}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Country Interest</p>
              <p className="font-medium">{lead.preferredCountry}</p>
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
          <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
            Timeline
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Captured</p>
              <div className="flex items-center">
                <p className="font-medium text-sm">
                  {formatDate(lead.createdAt)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <div className="flex items-center">
                <p className="font-medium text-sm">
                  {formatDate(lead?.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantLeadProfile;
