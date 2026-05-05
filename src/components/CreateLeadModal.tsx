import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { createLead } from "../redux/slices/leadsSlice";

type Mode = "select" | "form" | "chat";

interface FormData {
  phoneNumber: string;
  name: string;
  city: string;
  state: string;
  neetScore: string;
  preferredCountry: string;
  source: string;
  assignedTo: string;
}

const CHAT_STEPS = [
  {
    field: "phoneNumber",
    label: "Phone Number",
    question: "What's the lead's phone number? Include country code without '+' (e.g. 919876543210)",
    required: true,
    inputType: "tel",
  },
  { field: "name", label: "Name", question: "What's their name?", inputType: "text" },
  { field: "city", label: "City", question: "Which city are they from?", inputType: "text" },
  { field: "neetScore", label: "NEET Score", question: "What's their NEET score? (0–720)", inputType: "number" },
  {
    field: "preferredCountry",
    label: "Country Interest",
    question: "Which country are they interested in?",
    inputType: "options",
    options: ["Russia", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Georgia", "Bangladesh", "Nepal", "India", "Other"],
  },
  {
    field: "source",
    label: "Source",
    question: "How did they reach you?",
    inputType: "options",
    options: ["WhatsApp", "Website", "Referral", "Instagram", "Facebook", "Manual"],
  },
];

const COUNTRIES = ["Russia", "Uzbekistan", "Kazakhstan", "Kyrgyzstan", "Georgia", "Bangladesh", "Nepal", "India", "Other"];
const SOURCES = ["WhatsApp", "Website", "Referral", "Instagram", "Facebook", "Manual"];
const USERS = [
  { _id: "67d030142f4ff4037c3fdb60", name: "Arpit" },
  { _id: "67ced4c72fe58c7016c2748a", name: "Priya" },
  { _id: "67ced4c72fe58c7016c2748d", name: "Ankit" },
  { _id: "68a97910c3271bbae187ab0e", name: "Pratiksha" },
];

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

interface CreateLeadModalProps {
  onClose: () => void;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<Mode>("select");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Form state
  const [form, setForm] = useState<FormData>({
    phoneNumber: "",
    name: "",
    city: "",
    state: "",
    neetScore: "",
    preferredCountry: "",
    source: "Manual",
    assignedTo: "",
  });
  const [formError, setFormError] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: CHAT_STEPS[0].question },
  ]);
  const [chatStep, setChatStep] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatData, setChatData] = useState<Record<string, string>>({});
  const [chatDone, setChatDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!chatDone) chatInputRef.current?.focus();
  }, [chatMessages, chatDone]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleChatAnswer = (answer: string) => {
    const step = CHAT_STEPS[chatStep];
    const trimmed = answer.trim();
    if (step.required && !trimmed) return;

    setChatMessages((prev) => [...prev, { role: "user", text: trimmed || "Skip" }]);

    const newData = { ...chatData };
    if (trimmed) newData[step.field] = trimmed;
    setChatData(newData);

    const nextStep = chatStep + 1;
    if (nextStep < CHAT_STEPS.length) {
      setChatStep(nextStep);
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { role: "assistant", text: CHAT_STEPS[nextStep].question }]);
      }, 350);
    } else {
      setChatDone(true);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: "All set! Here's a summary. Ready to create the lead?" },
        ]);
      }, 350);
    }
    setChatInput("");
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChatAnswer(chatInput);
  };

  const handleCreateFromChat = async () => {
    setIsCreating(true);
    setCreateError("");
    try {
      await dispatch(
        createLead({
          phoneNumber: chatData.phoneNumber,
          name: chatData.name || undefined,
          city: chatData.city || undefined,
          neetScore: chatData.neetScore ? parseInt(chatData.neetScore) : undefined,
          preferredCountry: chatData.preferredCountry || undefined,
          source: chatData.source || "Manual",
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) {
      setFormError("Phone number is required");
      return;
    }
    setFormError("");
    setIsCreating(true);
    setCreateError("");
    try {
      const assignedUser = USERS.find((u) => u._id === form.assignedTo);
      await dispatch(
        createLead({
          phoneNumber: form.phoneNumber.trim(),
          name: form.name.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          neetScore: form.neetScore ? parseInt(form.neetScore) : undefined,
          preferredCountry: form.preferredCountry || undefined,
          source: form.source || "Manual",
          assignedTo: assignedUser ? { id: assignedUser._id, name: assignedUser.name } : null,
        })
      ).unwrap();
      onClose();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white outline-none";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              {mode !== "select" && (
                <button
                  onClick={() => setMode("select")}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="text-base font-semibold text-gray-800">
                {mode === "select" ? "Add New Lead" : mode === "form" ? "Fill Form" : "Quick Chat"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Select Mode */}
          {mode === "select" && (
            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("chat")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800">Quick Chat</div>
                  <div className="text-xs text-gray-400 mt-0.5">Guided questions</div>
                </div>
              </button>

              <button
                onClick={() => setMode("form")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50/30 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-800">Fill Form</div>
                  <div className="text-xs text-gray-400 mt-0.5">All fields at once</div>
                </div>
              </button>
            </div>
          )}

          {/* Form Mode */}
          {mode === "form" && (
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <label className={labelClass}>
                    Phone Number <span className="text-red-400 normal-case tracking-normal font-normal">* required</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="919876543210 (no + sign)"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Lead's name"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="City"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      placeholder="State"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>NEET Score</label>
                  <input
                    type="number"
                    min={0}
                    max={720}
                    value={form.neetScore}
                    onChange={(e) => setForm((f) => ({ ...f, neetScore: e.target.value }))}
                    placeholder="0–720"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Preferred Country</label>
                  <select
                    value={form.preferredCountry}
                    onChange={(e) => setForm((f) => ({ ...f, preferredCountry: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    className={inputClass}
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Assign To</label>
                  <select
                    value={form.assignedTo}
                    onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Unassigned</option>
                    {USERS.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {(formError || createError) && (
                  <p className="text-sm text-red-500">{formError || createError}</p>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium"
                >
                  {isCreating ? "Creating…" : "Create Lead"}
                </button>
              </div>
            </form>
          )}

          {/* Chat Mode */}
          {mode === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                          : "bg-indigo-500 text-white rounded-tr-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Summary card when done */}
                {chatDone && Object.keys(chatData).length > 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm space-y-2">
                    {CHAT_STEPS.map((step) =>
                      chatData[step.field] ? (
                        <div key={step.field} className="flex justify-between items-center gap-4">
                          <span className="text-gray-400 text-xs uppercase tracking-wide">{step.label}</span>
                          <span className="font-medium text-gray-800 text-right">{chatData[step.field]}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {createError && <p className="text-sm text-red-500 text-center">{createError}</p>}

                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              {!chatDone ? (
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
                  {CHAT_STEPS[chatStep]?.inputType === "options" ? (
                    <div className="flex flex-wrap gap-2">
                      {CHAT_STEPS[chatStep].options?.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleChatAnswer(opt)}
                          className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                      {!CHAT_STEPS[chatStep].required && (
                        <button
                          onClick={() => handleChatAnswer("")}
                          className="px-3 py-1.5 text-sm text-gray-400 rounded-full hover:bg-gray-100 border border-gray-200"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                      <input
                        ref={chatInputRef}
                        type={CHAT_STEPS[chatStep]?.inputType || "text"}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your answer…"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                      />
                      {!CHAT_STEPS[chatStep]?.required && (
                        <button
                          type="button"
                          onClick={() => handleChatAnswer("")}
                          className="px-3 py-2 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Skip
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={CHAT_STEPS[chatStep]?.required && !chatInput.trim()}
                        className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex gap-3 flex-shrink-0">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFromChat}
                    disabled={isCreating}
                    className="flex-1 py-2.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium"
                  >
                    {isCreating ? "Creating…" : "Create Lead"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateLeadModal;
