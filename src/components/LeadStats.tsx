import React from "react";

interface LeadStatsProps {
  totalLeads: number;
  todayLeads: number; // Adjust type according to your Lead interface
}

const LeadStats: React.FC<LeadStatsProps> = ({ totalLeads, todayLeads }) => {
  return (
    <div className="flex text-xl">
      <div className="flex ">
        <span>Total Leads :</span>
        <span className="mx-4">{totalLeads}</span>
      </div>
      <div className="flex">
        <span> Today's Leads :</span>
        <span className="mx-4"> {todayLeads}</span>
      </div>
    </div>
  );
};

export default LeadStats;
