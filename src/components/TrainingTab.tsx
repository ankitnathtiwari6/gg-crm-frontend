import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Lead, Message, ChatWithSuggestions, TrainingSuggestion } from "../types";
import { trainingService } from "../services/api.service";

interface TrainingTabProps {
  lead: Lead;
}

interface ActiveInput {
  messageId: string;
  context: Message[];
  originalReply: string;
}

interface ReviewData {
  suggestionId: string;
  situation: string;
  stage: string;
  userIntent: string;
  constraints: string;
  signals: string;
  preferredCountries: string[];
  strategy: string[];
  antiPatterns: string[];
}

const TrainingTab: React.FC<TrainingTabProps> = ({ lead }) => {
  const token = useSelector((state: RootState) => state.auth.token) ?? "";
  const [data, setData] = useState<ChatWithSuggestions | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline input state
  const [activeInput, setActiveInput] = useState<ActiveInput | null>(null);
  const [inputText, setInputText] = useState("");
  const [saving, setSaving] = useState(false);

  // AI generation state
  const [showAiInstruction, setShowAiInstruction] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [generating, setGenerating] = useState(false);

  // Review panel state
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(null);
    setReviewData(null);
    setActiveInput(null);
    setInputText("");
    setShowAiInstruction(false);
    setAiInstruction("");
    setLoading(true);
    trainingService
      .getChatWithSuggestions(lead.id, token)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [lead.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const openInput = (message: Message, index: number) => {
    if (!data) return;
    const context = data.messages.slice(0, index + 1);
    const existing = data.suggestions[message.messageId];
    setInputText(existing?.suggestedReply || "");
    setActiveInput({ messageId: message.messageId, context, originalReply: message.content });
    setReviewData(null);
    setShowAiInstruction(false);
    setAiInstruction("");
  };

  const closeInput = () => {
    setActiveInput(null);
    setInputText("");
    setReviewData(null);
    setShowAiInstruction(false);
    setAiInstruction("");
  };

  const handleSave = async () => {
    if (!activeInput || !data || !inputText.trim()) return;
    setSaving(true);
    setAnalyzing(false);
    try {
      const { suggestion, generated } = await trainingService.saveSuggestion(
        lead.id,
        {
          messageId: activeInput.messageId,
          suggestedReply: inputText,
          conversationContext: activeInput.context,
          originalAiReply: activeInput.originalReply,
        },
        token
      );

      // Update local suggestion map immediately so badge shows pending_review
      const isNew = !data.suggestions[activeInput.messageId];
      setData((prev) =>
        prev
          ? {
              ...prev,
              suggestions: { ...prev.suggestions, [activeInput.messageId]: suggestion },
              stats: {
                ...prev.stats,
                suggestions: isNew ? prev.stats.suggestions + 1 : prev.stats.suggestions,
              },
            }
          : prev
      );

      // Show review panel with AI-generated fields
      setAnalyzing(true);
      setReviewData({
        suggestionId: suggestion._id,
        situation:   generated.situation,
        stage:       generated.stage,
        userIntent:      generated.userIntent,
        constraints: generated.constraints,
        signals:     generated.signals,
        preferredCountries: generated.preferredCountries,
        strategy:    generated.strategy,
        antiPatterns: generated.antiPatterns,
      });
    } finally {
      setSaving(false);
      setAnalyzing(false);
    }
  };

  const handleConfirmEmbed = async () => {
    if (!reviewData || !activeInput || !data) return;
    setConfirming(true);
    try {
      const { suggestion: saved } = await trainingService.confirmEmbed(
        reviewData.suggestionId,
        {
          situation:    reviewData.situation,
          stage:        reviewData.stage,
          userIntent:       reviewData.userIntent,
          constraints:  reviewData.constraints,
          signals:      reviewData.signals,
          preferredCountries: reviewData.preferredCountries,
          strategy:     reviewData.strategy,
          antiPatterns: reviewData.antiPatterns,
        },
        token
      );
      setData((prev) =>
        prev
          ? {
              ...prev,
              suggestions: { ...prev.suggestions, [activeInput.messageId]: saved },
              stats: { ...prev.stats, embedded: prev.stats.embedded + 1 },
            }
          : prev
      );
      closeInput();
    } finally {
      setConfirming(false);
    }
  };

  const handleGenerate = async () => {
    if (!activeInput || !aiInstruction.trim()) return;
    setGenerating(true);
    try {
      const result = await trainingService.generateReply(
        lead.id,
        {
          conversationContext: activeInput.context,
          userInstruction: aiInstruction,
          previousSuggestions: inputText.trim() ? [inputText.trim()] : [],
        },
        token
      );
      setInputText(result.generatedReply);
      setShowAiInstruction(false);
      setAiInstruction("");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    const suggestion = data?.suggestions[messageId];
    if (!suggestion) return;
    await trainingService.deleteSuggestion(suggestion._id, token);
    if (activeInput?.messageId === messageId) closeInput();
    setData((prev) => {
      if (!prev) return prev;
      const { [messageId]: removed, ...rest } = prev.suggestions;
      return {
        ...prev,
        suggestions: rest,
        stats: {
          ...prev.stats,
          suggestions: prev.stats.suggestions - 1,
          embedded: prev.stats.embedded - (removed?.isEmbedded ? 1 : 0),
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading training data…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No training data available for this lead.
      </div>
    );
  }

  const unembedded = data.stats.suggestions - data.stats.embedded;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50 border-b border-purple-100 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span><span className="font-semibold text-gray-700">{data.stats.aiMessages}</span> AI msgs</span>
          <span className="text-gray-300">·</span>
          <span><span className="font-semibold text-purple-600">{data.stats.suggestions}</span> suggestions</span>
          <span className="text-gray-300">·</span>
          <span><span className="font-semibold text-green-600">{data.stats.embedded}</span> embedded</span>
          {unembedded > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-amber-600 font-medium">{unembedded} pending review</span>
            </>
          )}
        </div>
        {data.stats.embedded > 0 && unembedded === 0 && (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            All embedded
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23e5e5e5' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundColor: "#f3f4f6",
        }}
      >
        {data.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No chat history found for this lead.</p>
          </div>
        ) : (
          data.messages.map((msg, i) => (
            <MessageBubble
              key={msg.messageId || i}
              message={msg}
              suggestion={data.suggestions[msg.messageId]}
              isInputOpen={activeInput?.messageId === msg.messageId}
              inputText={activeInput?.messageId === msg.messageId ? inputText : ""}
              saving={saving}
              analyzing={activeInput?.messageId === msg.messageId ? analyzing : false}
              reviewData={activeInput?.messageId === msg.messageId ? reviewData : null}
              confirming={confirming}
              showAiInstruction={activeInput?.messageId === msg.messageId ? showAiInstruction : false}
              aiInstruction={activeInput?.messageId === msg.messageId ? aiInstruction : ""}
              generating={generating}
              onOpenInput={() => openInput(msg, i)}
              onCloseInput={closeInput}
              onInputChange={setInputText}
              onSave={handleSave}
              onDelete={() => handleDelete(msg.messageId)}
              onToggleAiInstruction={() => setShowAiInstruction((v) => !v)}
              onAiInstructionChange={setAiInstruction}
              onGenerate={handleGenerate}
              onReviewChange={setReviewData}
              onConfirmEmbed={handleConfirmEmbed}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// ── Chip input ────────────────────────────────────────────────────────────────

const ChipInput: React.FC<{
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ label, values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  };

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-800 text-xs rounded-full px-2.5 py-0.5">
            {v}
            <button onClick={() => remove(i)} className="text-purple-400 hover:text-purple-700 ml-0.5 leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? "Type and press Enter"}
          className="flex-1 border border-gray-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className="px-2.5 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// ── Review Panel ──────────────────────────────────────────────────────────────

const ReviewPanel: React.FC<{
  reviewData: ReviewData;
  confirming: boolean;
  onChange: (data: ReviewData) => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ reviewData, confirming, onChange, onConfirm, onCancel }) => {
  const update = (field: keyof ReviewData, value: any) =>
    onChange({ ...reviewData, [field]: value });

  return (
    <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs font-semibold text-purple-700">Review before embedding</p>
        <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">pending review</span>
      </div>

      {/* Embed fields — each maps to one line in the final embed text */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500">
          Embed text fields <span className="text-gray-400 font-normal">(assembled into the Pinecone vector)</span>
        </p>
        {(
          [
            { key: "situation",   label: "Situation",   placeholder: "User considers MBBS fees too expensive after hearing estimates…" },
            { key: "stage",       label: "Stage",       placeholder: "Mid-stage: NEET score and city known, no country selected." },
            { key: "userIntent",      label: "Intent",      placeholder: "reduce cost, explore low-budget MBBS options." },
            { key: "constraints", label: "Constraints", placeholder: "limited budget (~under 20 lakh), must fit NEET score." },
            { key: "signals",     label: "Signals",     placeholder: "price-sensitive, hesitant." },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-xs text-gray-400 w-20 pt-1.5 shrink-0">{label}</span>
            <input
              value={reviewData[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      {/* Countries of interest */}
      <ChipInput
        label="Countries of interest (explicitly mentioned in conversation)"
        values={reviewData.preferredCountries}
        onChange={(v) => update("preferredCountries", v)}
        placeholder="Kyrgyzstan, Kazakhstan, Uzbekistan…"
      />

      {/* Strategy */}
      <ChipInput
        label="Strategy (injected into agent at match time)"
        values={reviewData.strategy}
        onChange={(v) => update("strategy", v)}
        placeholder="Acknowledge briefly, do not defend…"
      />

      {/* Anti-patterns */}
      <ChipInput
        label="Avoid (injected into agent at match time)"
        values={reviewData.antiPatterns}
        onChange={(v) => update("antiPatterns", v)}
        placeholder="Don't list all fee tiers immediately…"
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming || !reviewData.situation.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {confirming ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Embedding…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Confirm & Embed
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Suggestion Preview ────────────────────────────────────────────────────────

const SuggestionPreview: React.FC<{
  suggestion: TrainingSuggestion;
  embeddingStatus: string | undefined;
}> = ({ suggestion, embeddingStatus }) => {
  const [showMeta, setShowMeta] = useState(false);

  const metaFields: { label: string; value: string }[] = [
    { label: "Situation",   value: suggestion.situation   },
    { label: "Stage",       value: suggestion.stage       },
    { label: "Intent",      value: suggestion.userIntent  },
    { label: "Constraints", value: suggestion.constraints },
    { label: "Signals",     value: suggestion.signals     },
  ].filter((f) => f.value);

  const hasMeta =
    metaFields.length > 0 ||
    suggestion.preferredCountries?.length > 0 ||
    suggestion.strategy?.length > 0 ||
    suggestion.antiPatterns?.length > 0;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-900 leading-relaxed space-y-2">
      <div className="flex items-center gap-1 text-purple-500 font-semibold">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        Suggested reply
        {embeddingStatus === "embedded" ? (
          <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">✓ In Pinecone</span>
        ) : (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">⏳ Pending review</span>
        )}
      </div>

      <p className="whitespace-pre-wrap">{suggestion.suggestedReply}</p>

      {hasMeta && (
        <>
          <button
            onClick={() => setShowMeta((v) => !v)}
            className="flex items-center gap-1 text-purple-400 hover:text-purple-600 transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform ${showMeta ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showMeta ? "Hide" : "Show"} embed metadata
          </button>

          {showMeta && (
            <div className="border-t border-purple-200 pt-2 space-y-2">
              {metaFields.map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <span className="w-20 shrink-0 text-purple-400 font-medium">{label}</span>
                  <span className="text-purple-800">{value}</span>
                </div>
              ))}

              {suggestion.preferredCountries?.length > 0 && (
                <div className="flex gap-2">
                  <span className="w-20 shrink-0 text-purple-400 font-medium">Countries</span>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.preferredCountries.map((c) => (
                      <span key={c} className="bg-purple-100 border border-purple-200 rounded-full px-2 py-0.5 text-purple-800">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {suggestion.strategy?.length > 0 && (
                <div className="flex gap-2">
                  <span className="w-20 shrink-0 text-purple-400 font-medium">Strategy</span>
                  <ul className="space-y-0.5 text-purple-800">
                    {suggestion.strategy.map((s, i) => <li key={i}>· {s}</li>)}
                  </ul>
                </div>
              )}

              {suggestion.antiPatterns?.length > 0 && (
                <div className="flex gap-2">
                  <span className="w-20 shrink-0 text-purple-400 font-medium">Avoid</span>
                  <ul className="space-y-0.5 text-purple-800">
                    {suggestion.antiPatterns.map((a, i) => <li key={i}>· {a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Message Bubble ────────────────────────────────────────────────────────────

interface BubbleProps {
  message: Message;
  suggestion?: TrainingSuggestion;
  isInputOpen: boolean;
  inputText: string;
  saving: boolean;
  analyzing: boolean;
  reviewData: ReviewData | null;
  confirming: boolean;
  showAiInstruction: boolean;
  aiInstruction: string;
  generating: boolean;
  onOpenInput: () => void;
  onCloseInput: () => void;
  onInputChange: (text: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleAiInstruction: () => void;
  onAiInstructionChange: (text: string) => void;
  onGenerate: () => void;
  onReviewChange: (data: ReviewData) => void;
  onConfirmEmbed: () => void;
}

const MessageBubble: React.FC<BubbleProps> = ({
  message,
  suggestion,
  isInputOpen,
  inputText,
  saving,
  analyzing,
  reviewData,
  confirming,
  showAiInstruction,
  aiInstruction,
  generating,
  onOpenInput,
  onCloseInput,
  onInputChange,
  onSave,
  onDelete,
  onToggleAiInstruction,
  onAiInstructionChange,
  onGenerate,
  onReviewChange,
  onConfirmEmbed,
}) => {
  const isAI = message.role === "assistant";
  const [showSuggestion, setShowSuggestion] = useState(!!suggestion);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const instructionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (suggestion) setShowSuggestion(true);
  }, [suggestion?._id, suggestion?.suggestedReply]);

  useEffect(() => {
    if (isInputOpen) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [isInputOpen]);

  useEffect(() => {
    if (showAiInstruction) setTimeout(() => instructionRef.current?.focus(), 50);
  }, [showAiInstruction]);

  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const embeddingStatus = suggestion?.embeddingStatus;

  return (
    <div className={`flex ${isAI ? "justify-end" : "justify-start"}`}>
      <div className={`space-y-1 ${isAI ? "max-w-[78%]" : "w-full max-w-[85%]"}`}>
        {/* Bubble */}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isAI ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm"}`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-1 ${isAI ? "text-emerald-200" : "text-gray-400"}`}>{time}</p>
        </div>

        {/* AI actions row */}
        {isAI && (
          <div className="flex items-center gap-1 pr-1 justify-end">
            {suggestion ? (
              <>
                <button
                  onClick={() => setShowSuggestion(!showSuggestion)}
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    embeddingStatus === "embedded"
                      ? "text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
                      : "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {embeddingStatus === "embedded" ? "Embedded" : "Pending review"}
                  <svg className={`w-3 h-3 transition-transform ${showSuggestion ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button onClick={onOpenInput} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full hover:bg-gray-100 transition-colors">
                  Edit
                </button>
                <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors" title="Delete suggestion">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <button onClick={onOpenInput} className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 hover:bg-purple-50 px-2 py-0.5 rounded-full border border-transparent hover:border-purple-200 transition-all">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Add suggestion
              </button>
            )}
          </div>
        )}

        {/* Suggestion preview */}
        {isAI && suggestion && showSuggestion && !isInputOpen && (
          <SuggestionPreview suggestion={suggestion} embeddingStatus={embeddingStatus} />
        )}

        {/* Inline input box */}
        {isAI && isInputOpen && (
          <div className="space-y-2">
            {/* Step 1: reply textarea — hide once review panel is showing */}
            {!reviewData && (
              <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-sm space-y-2">
                <p className="text-xs font-semibold text-purple-500">
                  {suggestion ? "Edit suggestion" : "Add a better reply"}
                </p>

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => onInputChange(e.target.value)}
                  rows={3}
                  placeholder="Type a better reply that the AI should have given…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSave();
                    if (e.key === "Escape") onCloseInput();
                  }}
                />

                {/* AI instruction panel */}
                {showAiInstruction && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 space-y-2">
                    <p className="text-xs text-indigo-500 font-medium">Tell AI how to write it</p>
                    <textarea
                      ref={instructionRef}
                      value={aiInstruction}
                      onChange={(e) => onAiInstructionChange(e.target.value)}
                      rows={3}
                      placeholder='"make it casual", "be more empathetic", "shorter reply"'
                      className="w-full border border-indigo-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onGenerate();
                        if (e.key === "Escape") onToggleAiInstruction();
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={onToggleAiInstruction} className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                      <button
                        onClick={onGenerate}
                        disabled={generating || !aiInstruction.trim()}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                      >
                        {generating ? (
                          <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating…</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>Generate</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onToggleAiInstruction}
                      disabled={generating}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50 ${showAiInstruction ? "bg-indigo-100 text-indigo-600 border-indigo-200" : "text-gray-500 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Generate with AI
                    </button>
                    <span className="text-xs text-gray-300">Ctrl+Enter to save</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={onCloseInput} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button
                      onClick={onSave}
                      disabled={saving || analyzing || !inputText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors"
                    >
                      {saving || analyzing ? (
                        <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{analyzing ? "Analyzing…" : "Saving…"}</>
                      ) : (
                        <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save & Review</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: review panel */}
            {reviewData && (
              <ReviewPanel
                reviewData={reviewData}
                confirming={confirming}
                onChange={onReviewChange}
                onConfirm={onConfirmEmbed}
                onCancel={onCloseInput}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingTab;
