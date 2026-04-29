import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { Lead, Remark, ActivityLog } from "../types";
import { updateLead } from "../redux/slices/leadsSlice";
import { AppDispatch, RootState } from "../redux/store";
import { leadService } from "../services/api.service";
import { useTagOptions } from "../hooks/useTagOptions";

// ── Constants ────────────────────────────────────────────────────────────────
const QUALIFICATION_TAGS = ["Qualified"];

const STAGE_OPTIONS = [
  { value: "", label: "No Stage" },
  { value: "not_responding", label: "Not Responding" },
  { value: "call_started", label: "Call Started" },
  { value: "follow_up", label: "Follow Up" },
  { value: "documents_requested", label: "Documents Requested" },
  { value: "documents_received", label: "Documents Received" },
  { value: "application_submitted", label: "Application Submitted" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

const QUALIFICATION_OPTIONS = [
  { value: "", label: "—" },
  { value: "12th_appearing", label: "12th Appearing" },
  { value: "12th_passed", label: "12th Passed" },
  { value: "dropper", label: "Dropper" },
  { value: "other", label: "Other" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getScoreBadge = (score?: number | null) => {
  if (score == null) return { color: "bg-gray-100 text-gray-500", label: "No score" };
  if (score >= 80) return { color: "bg-green-100 text-green-700", label: `${score} · Hot` };
  if (score >= 60) return { color: "bg-teal-100 text-teal-700", label: `${score} · Warm` };
  if (score >= 40) return { color: "bg-yellow-100 text-yellow-700", label: `${score} · Neutral` };
  if (score >= 20) return { color: "bg-orange-100 text-orange-700", label: `${score} · Cold` };
  return { color: "bg-red-100 text-red-700", label: `${score} · Junk` };
};

const getStageBadge = (stage?: string) => {
  const map: Record<string, { color: string; label: string }> = {
    not_responding: { color: "bg-yellow-100 text-yellow-700", label: "Not Responding" },
    call_started: { color: "bg-blue-100 text-blue-700", label: "Call Started" },
    follow_up: { color: "bg-purple-100 text-purple-700", label: "Follow Up" },
    documents_requested: { color: "bg-indigo-100 text-indigo-700", label: "Documents Requested" },
    documents_received: { color: "bg-teal-100 text-teal-700", label: "Documents Received" },
    application_submitted: { color: "bg-cyan-100 text-cyan-700", label: "Application Submitted" },
    closed_won: { color: "bg-green-100 text-green-700", label: "Closed Won" },
    closed_lost: { color: "bg-gray-100 text-gray-600", label: "Closed Lost" },
  };
  return stage ? map[stage] ?? { color: "bg-gray-100 text-gray-600", label: "New Lead" }
    : { color: "bg-gray-100 text-gray-400", label: "No Stage" };
};

const buildSummary = (lead: Lead): string => {
  const parts: string[] = [];
  const score = getScoreBadge(lead.leadQualityScore);
  if (lead.leadQualityScore != null) parts.push(score.label);
  if (lead.neetScore) parts.push(`NEET ${lead.neetScore}`);
  if (lead.preferredCountry) parts.push(lead.preferredCountry);
  if (lead.stage) parts.push(getStageBadge(lead.stage).label);
  if (lead.assignedTo?.name) parts.push(`→ ${lead.assignedTo.name}`);
  return parts.length ? parts.join(" · ") : "No summary available";
};

// ── Input helpers ─────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

// ── Timeline helpers ──────────────────────────────────────────────────────────

type TimelineItem =
  | { kind: "remark"; data: Remark }
  | { kind: "activity"; data: ActivityLog };

const mergeTimeline = (remarks: Remark[], activityLog: ActivityLog[]): TimelineItem[] => {
  const items: TimelineItem[] = [
    ...remarks.map((r) => ({ kind: "remark" as const, data: r })),
    ...activityLog.map((a) => ({ kind: "activity" as const, data: a })),
  ];
  return items.sort(
    (a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
  );
};

const groupByDate = (items: TimelineItem[]) => {
  const groups: Record<string, TimelineItem[]> = {};
  items.forEach((item) => {
    const key = moment(item.data.createdAt).format("MMM D, YYYY");
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

// ── Component ─────────────────────────────────────────────────────────────────

interface LeadProfileProps {
  lead: Lead;
}

const LeadProfile: React.FC<LeadProfileProps> = ({ lead }) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token) ?? "";
  const isSavingRedux = useSelector((state: RootState) => state.leads.isLoading);
  const tagOptions = useTagOptions();

  // Form state — resets when a different lead is opened
  const [form, setForm] = useState<Lead>({ ...lead });
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Timeline state — fetched from getLeadById
  const [remarks, setRemarks] = useState<Remark[]>(lead.remarks ?? []);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(lead.activityLog ?? []);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Add remark state
  const [remarkText, setRemarkText] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Fetch full lead details (remarks + activityLog) when lead changes
  useEffect(() => {
    setForm({ ...lead });
    setIsDirty(false);
    setSaveStatus("idle");

    setLoadingTimeline(true);
    leadService.getLeadById(lead.id, token)
      .then((fullLead) => {
        if (fullLead) {
          setRemarks(fullLead.remarks ?? []);
          setActivityLog(fullLead.activityLog ?? []);
        }
      })
      .catch(() => {
        setRemarks(lead.remarks ?? []);
        setActivityLog(lead.activityLog ?? []);
      })
      .finally(() => setLoadingTimeline(false));
  }, [lead.id]);

  // Sync remarks/activityLog when Redux lead updates (after save)
  useEffect(() => {
    if (lead.remarks) setRemarks(lead.remarks);
    if (lead.activityLog) setActivityLog(lead.activityLog);
  }, [lead.remarks, lead.activityLog]);

  const handleChange = useCallback((field: keyof Lead, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSaveStatus("idle");
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setForm((prev) => {
      const tags = prev.tags ?? [];
      return {
        ...prev,
        tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      };
    });
    setIsDirty(true);
    setSaveStatus("idle");
  }, []);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const result = await dispatch(updateLead(form)).unwrap();
      // Refresh timeline from the returned lead
      if (result.activityLog) setActivityLog(result.activityLog);
      if (result.remarks) setRemarks(result.remarks);
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("idle");
    }
  };

  const handleAddRemark = async () => {
    if (!remarkText.trim()) return;
    setSubmittingRemark(true);
    try {
      const res = await leadService.addRemark(lead.id, remarkText.trim(), token);
      if (res?.remark) {
        setRemarks((prev) => [res.remark, ...prev]);
      }
      setRemarkText("");
    } finally {
      setSubmittingRemark(false);
    }
  };

  const timeline = mergeTimeline(remarks, activityLog);
  const grouped = groupByDate(timeline);
  const scoreBadge = getScoreBadge(lead.leadQualityScore);
  const stageBadge = getStageBadge(lead.stage);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-lg font-bold flex-shrink-0">
            {lead.name?.slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight truncate">{lead.name || "Unknown"}</h2>
            <p className="text-xs text-indigo-100 mt-0.5">+{lead.leadPhoneNumber} · {lead.source || "WhatsApp"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreBadge.color}`}>
            {scoreBadge.label}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageBadge.color} flex items-center gap-1`}>
            {stageBadge.label}
            {lead.stageUpdatedBy === "ai" && (
              <span title="Stage set by AI" className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/40 text-[8px] font-bold leading-none">
                AI
              </span>
            )}
          </span>
          {lead.qualifiedLead && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Qualified
            </span>
          )}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-2 flex-shrink-0">
        <p className="text-xs text-indigo-600 leading-relaxed">
          <span className="font-medium">Summary:</span> {buildSummary(lead)}
        </p>
        {lead.leadQualityScoreReason && (
          <p className="text-xs text-indigo-500 mt-0.5 italic">"{lead.leadQualityScoreReason}"</p>
        )}
      </div>

      <div className="flex-1 px-5 py-4 space-y-5">

        {/* ── Edit Form ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead Details</h3>
            {isDirty && (
              <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {/* Row: Name + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input className={inputCls} value={form.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={form.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
            </div>

            {/* Row: NEET Score + Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>NEET Score</label>
                <input className={inputCls} type="number" value={form.neetScore ?? ""} onChange={(e) => handleChange("neetScore", e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className={labelCls}>Preferred Country</label>
                <input className={inputCls} value={form.preferredCountry ?? ""} onChange={(e) => handleChange("preferredCountry", e.target.value)} />
              </div>
            </div>

            {/* Row: Stage + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Stage</label>
                <select className={inputCls} value={form.stage ?? ""} onChange={(e) => handleChange("stage", e.target.value || undefined)}>
                  {STAGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status ?? "active"} onChange={(e) => handleChange("status", e.target.value as any)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Row: Qualification + NEET Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Qualification</label>
                <select className={inputCls} value={form.qualification ?? ""} onChange={(e) => handleChange("qualification", e.target.value || undefined)}>
                  {QUALIFICATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>NEET Year</label>
                <input className={inputCls} type="number" placeholder="e.g. 2024" value={form.neetYear ?? ""} onChange={(e) => handleChange("neetYear", e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>

            {/* Row: City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={form.city ?? ""} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} value={form.state ?? ""} onChange={(e) => handleChange("state", e.target.value)} />
              </div>
            </div>

            {/* Row: Budget + Target Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Budget</label>
                <input className={inputCls} placeholder="e.g. 30-40 lakhs" value={form.budget ?? ""} onChange={(e) => handleChange("budget", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Target Year</label>
                <input className={inputCls} type="number" placeholder="e.g. 2025" value={form.targetYear ?? ""} onChange={(e) => handleChange("targetYear", e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>

            {/* Qualification tags */}
            <div>
              <label className={labelCls}>Qualification Status</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {QUALIFICATION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      form.tags?.includes(tag)
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual tags */}
            <div>
              <label className={labelCls}>Manual Tags</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                      form.tags?.includes(tag)
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* AI tags — read-only */}
            <div>
              <label className={labelCls}>
                AI Tags <span className="text-purple-500 font-normal">(auto-generated)</span>
              </label>
              {form.aiTags && form.aiTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.aiTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs rounded-full font-medium border border-dashed border-purple-300 bg-purple-50 text-purple-700"
                      title="Set automatically by AI"
                    >
                      ✦ {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No AI tags yet</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={form.notes ?? ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add notes about this lead…"
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleSave}
                disabled={!isDirty || saveStatus === "saving" || isSavingRedux}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  saveStatus === "saved"
                    ? "bg-green-500 text-white"
                    : isDirty
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {saveStatus === "saving" ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Add remark */}
            <div className="space-y-2">
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Add a remark or note…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddRemark();
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
                <button
                  onClick={handleAddRemark}
                  disabled={!remarkText.trim() || submittingRemark}
                  className="px-3 py-1.5 text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {submittingRemark ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  Add Remark
                </button>
              </div>
            </div>

            {/* Timeline items */}
            {loadingTimeline ? (
              <div className="flex items-center justify-center py-6 text-gray-400 text-xs gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading timeline…
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">No activity yet</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([date, items]) => (
                  <div key={date}>
                    {/* Date divider */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs font-semibold text-gray-400 px-2">{date}</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    {/* Items for this date */}
                    <div className="space-y-2 pl-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {item.kind === "remark" ? (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={`rounded-lg px-3 py-2 text-sm ${
                              item.kind === "remark"
                                ? "bg-indigo-50 text-gray-800 border border-indigo-100"
                                : "bg-amber-50 text-gray-700 border border-amber-100"
                            }`}>
                              {item.kind === "remark" ? (
                                <p className="leading-relaxed">{(item.data as Remark).text}</p>
                              ) : (
                                <p className="leading-relaxed">{(item.data as ActivityLog).action}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 ml-1">
                              {item.data.author && (
                                <>
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-[9px] font-bold">
                                      {item.data.author.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">{item.data.author.name}</span>
                                  <span className="text-gray-300">·</span>
                                </>
                              )}
                              <span className="text-xs text-gray-400">
                                {moment(item.data.createdAt).format("h:mm A")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Read-only info ── */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity Stats</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Messages", value: lead.messageCount ?? "—" },
              { label: "Enquiries", value: lead.numberOfEnquiry ?? "—" },
              { label: "First Contact", value: lead.firstInteraction ? moment(lead.firstInteraction).format("MMM D, YYYY") : "—" },
              { label: "Last Contact", value: lead.lastInteraction ? moment(lead.lastInteraction).fromNow() : "—" },
              { label: "Created", value: lead.createdAt ? moment(lead.createdAt).format("MMM D, YYYY") : "—" },
              { label: "Updated", value: lead.updatedAt ? moment(lead.updatedAt).fromNow() : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-700">{String(value)}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default LeadProfile;
