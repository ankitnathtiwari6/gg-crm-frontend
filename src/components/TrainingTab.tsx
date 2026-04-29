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

const TrainingTab: React.FC<TrainingTabProps> = ({ lead }) => {
  const token = useSelector((state: RootState) => state.auth.token) ?? "";
  const [data, setData] = useState<ChatWithSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [embedding, setEmbedding] = useState(false);
  const [embedResult, setEmbedResult] = useState<{ embedded: number; total: number; errors: string[] } | null>(null);

  // Inline input state
  const [activeInput, setActiveInput] = useState<ActiveInput | null>(null);
  const [inputText, setInputText] = useState("");
  const [saving, setSaving] = useState(false);

  // AI generation state
  const [showAiInstruction, setShowAiInstruction] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [generating, setGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(null);
    setEmbedResult(null);
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
    setShowAiInstruction(false);
    setAiInstruction("");
  };

  const closeInput = () => {
    setActiveInput(null);
    setInputText("");
    setShowAiInstruction(false);
    setAiInstruction("");
  };

  const handleSave = async () => {
    if (!activeInput || !data || !inputText.trim()) return;
    setSaving(true);
    try {
      const { suggestion: saved }: { suggestion: TrainingSuggestion } =
        await trainingService.saveSuggestion(
          lead.id,
          {
            messageId: activeInput.messageId,
            suggestedReply: inputText,
            conversationContext: activeInput.context,
            originalAiReply: activeInput.originalReply,
          },
          token
        );
      const isNew = !data.suggestions[activeInput.messageId];
      setData((prev) =>
        prev
          ? {
              ...prev,
              suggestions: { ...prev.suggestions, [activeInput.messageId]: saved },
              stats: {
                ...prev.stats,
                suggestions: isNew ? prev.stats.suggestions + 1 : prev.stats.suggestions,
                embedded: isNew && saved.isEmbedded
                  ? prev.stats.embedded + 1
                  : prev.stats.embedded,
              },
            }
          : prev
      );
      closeInput();
    } finally {
      setSaving(false);
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
          originalAiReply: activeInput.originalReply,
          userInstruction: aiInstruction,
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

  const handleEmbed = async () => {
    setEmbedding(true);
    setEmbedResult(null);
    try {
      const result = await trainingService.embedSuggestions(lead.id, token);
      setEmbedResult(result);
      trainingService.getChatWithSuggestions(lead.id, token).then(setData);
    } finally {
      setEmbedding(false);
    }
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
      {/* Stats + embed bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50 border-b border-purple-100 flex-shrink-0">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-700">{data.stats.aiMessages}</span> AI msgs
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-purple-600">{data.stats.suggestions}</span> suggestions
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-green-600">{data.stats.embedded}</span> embedded
          </span>
        </div>

        <div className="flex items-center gap-2">
          {unembedded > 0 && (
            <button
              onClick={handleEmbed}
              disabled={embedding}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
            >
              {embedding ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              Embed {unembedded} to Pinecone
            </button>
          )}
          {data.stats.embedded > 0 && unembedded === 0 && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All embedded
            </span>
          )}
        </div>
      </div>

      {/* Embed result banner */}
      {embedResult && (
        <div className={`px-4 py-2 text-xs border-b flex-shrink-0 ${
          embedResult.errors.length > 0
            ? "bg-yellow-50 border-yellow-200 text-yellow-800"
            : "bg-green-50 border-green-200 text-green-800"
        }`}>
          Embedded {embedResult.embedded}/{embedResult.total} suggestions to Pinecone.
          {embedResult.errors.length > 0 && (
            <span className="ml-1">{embedResult.errors.length} failed.</span>
          )}
        </div>
      )}

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
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
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
}

const MessageBubble: React.FC<BubbleProps> = ({
  message,
  suggestion,
  isInputOpen,
  inputText,
  saving,
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
}) => {
  const isAI = message.role === "assistant";
  const [showSuggestion, setShowSuggestion] = useState(!!suggestion);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand suggestion preview whenever one is saved or updated
  useEffect(() => {
    if (suggestion) setShowSuggestion(true);
  }, [suggestion?._id, suggestion?.suggestedReply]);
  const instructionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isInputOpen) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [isInputOpen]);

  useEffect(() => {
    if (showAiInstruction) {
      setTimeout(() => instructionRef.current?.focus(), 50);
    }
  }, [showAiInstruction]);

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isAI ? "justify-end" : "justify-start"}`}>
      <div className={`space-y-1 ${isAI ? "max-w-[78%]" : "w-full max-w-[85%]"}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isAI
              ? "bg-emerald-600 text-white rounded-tr-sm"
              : "bg-white text-gray-800 rounded-tl-sm"
          }`}
        >
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
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Suggestion saved
                  <svg className={`w-3 h-3 transition-transform ${showSuggestion ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={onOpenInput}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors"
                  title="Delete suggestion"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenInput}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 hover:bg-purple-50 px-2 py-0.5 rounded-full border border-transparent hover:border-purple-200 transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Add suggestion
              </button>
            )}
          </div>
        )}

        {/* Existing suggestion preview (toggleable) */}
        {isAI && suggestion && showSuggestion && !isInputOpen && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-900 leading-relaxed">
            <div className="flex items-center gap-1 mb-1.5 text-purple-500 font-semibold">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Suggested reply
              {suggestion.isEmbedded && (
                <span className="ml-auto text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">
                  ✓ In Pinecone
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap">{suggestion.suggestedReply}</p>
          </div>
        )}

        {/* Inline input box */}
        {isAI && isInputOpen && (
          <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-sm space-y-2">
            <p className="text-xs font-semibold text-purple-500">
              {suggestion ? "Edit suggestion" : "Add a better reply"}
            </p>

            {/* Main textarea */}
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
                  placeholder='e.g. "make it casual", "be more empathetic", "shorter reply"'
                  className="w-full border border-indigo-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onGenerate();
                    if (e.key === "Escape") onToggleAiInstruction();
                  }}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onToggleAiInstruction}
                    className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onGenerate}
                    disabled={generating || !aiInstruction.trim()}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                  >
                    {generating ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating…
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleAiInstruction}
                  disabled={generating}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50 ${
                    showAiInstruction
                      ? "bg-indigo-100 text-indigo-600 border-indigo-200"
                      : "text-gray-500 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Generate with AI
                </button>
                <span className="text-xs text-gray-300">Ctrl+Enter to save</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onCloseInput}
                  className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving || !inputText.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingTab;
