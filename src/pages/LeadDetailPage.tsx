import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const LeadDetailPage: React.FC = () => {
  const { id } = useParams();

  // In a real app, fetch lead details using `id`
  // Example static data:
  const lead = {
    id,
    name: "Rahul Sharma",
    neetStatus: "Qualified",
    neetScore: 450,
    mockScore: 400,
    countryInterest: "Russia",
    location: "Delhi",
    collegePreference: "Moscow State University",
    year12Completion: 2023,
    qualifiedLead: true,
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar onSearch={() => {}} onToggleFilters={() => {}} />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Lead Details</h1>
          <div className="mt-4 bg-white p-4 rounded shadow-sm max-w-2xl">
            <div className="mb-2">
              <strong>Name:</strong> {lead.name}
            </div>
            <div className="mb-2">
              <strong>NEET Status:</strong> {lead.neetStatus}
            </div>
            <div className="mb-2">
              <strong>NEET Score:</strong> {lead.neetScore}
            </div>
            <div className="mb-2">
              <strong>Mock Score:</strong> {lead.mockScore}
            </div>
            <div className="mb-2">
              <strong>Country Interested:</strong> {lead.countryInterest}
            </div>
            <div className="mb-2">
              <strong>Location:</strong> {lead.location}
            </div>
            <div className="mb-2">
              <strong>College Preference:</strong> {lead.collegePreference}
            </div>
            <div className="mb-2">
              <strong>12th Completion Year:</strong> {lead.year12Completion}
            </div>
            <div>
              <strong>Qualified Lead:</strong>{" "}
              {lead.qualifiedLead ? (
                <span className="text-green-600 font-semibold">Yes</span>
              ) : (
                <span className="text-red-600 font-semibold">No</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
