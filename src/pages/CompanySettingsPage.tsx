import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchCompany,
  createCompany,
  updateCompany,
  updateCompanyTags,
  addUser,
  removeUser,
  addWhatsapp,
  removeWhatsapp,
  toggleWhatsapp,
  clearError,
  WhatsappNumber,
} from "../redux/slices/companySlice";
import { DEFAULT_TAG_OPTIONS } from "../hooks/useTagOptions";

const CompanySettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { company, loading, error } = useSelector((state: RootState) => state.company);
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [editName, setEditName] = useState("");
  const [editingName, setEditingName] = useState(false);

  // Add user form
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("member");

  // Add WhatsApp form
  const [showWaForm, setShowWaForm] = useState(false);
  const [waForm, setWaForm] = useState<Omit<WhatsappNumber, "isActive">>({
    phoneNumberId: "",
    displayPhoneNumber: "",
    accessToken: "",
    verifyToken: "",
  });

  // Tag management
  const [newTag, setNewTag] = useState("");

  // Auto-load the user's associated company on mount
  useEffect(() => {
    if (authUser?.companyId) {
      dispatch(fetchCompany(authUser.companyId));
    }
  }, [authUser?.companyId]);

  useEffect(() => {
    if (company) {
      setEditName(company.name);
    }
  }, [company]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    dispatch(createCompany(newCompanyName.trim()));
    setNewCompanyName("");
  };

  const handleSaveName = () => {
    if (company && editName.trim()) {
      dispatch(updateCompany({ id: company._id, payload: { name: editName.trim() } }));
      setEditingName(false);
    }
  };

  const handleToggleAI = () => {
    if (company) {
      dispatch(updateCompany({ id: company._id, payload: { settings: { aiEnabled: !company.settings.aiEnabled } } }));
    }
  };

  const handleToggleRAG = () => {
    if (company) {
      dispatch(updateCompany({ id: company._id, payload: { settings: { ragEnabled: !company.settings.ragEnabled } } }));
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !userEmail.trim()) return;
    await dispatch(addUser({ id: company._id, email: userEmail.trim(), role: userRole }));
    setUserEmail("");
  };

  const handleRemoveUser = (userId: string) => {
    if (company) dispatch(removeUser({ id: company._id, userId }));
  };

  const handleAddWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    await dispatch(addWhatsapp({ id: company._id, payload: waForm }));
    setWaForm({ phoneNumberId: "", displayPhoneNumber: "", accessToken: "", verifyToken: "" });
    setShowWaForm(false);
  };

  const handleRemoveWhatsapp = (phoneNumberId: string) => {
    if (company) dispatch(removeWhatsapp({ id: company._id, phoneNumberId }));
  };

  const handleToggleWhatsapp = (phoneNumberId: string) => {
    if (company) dispatch(toggleWhatsapp({ id: company._id, phoneNumberId }));
  };

  const currentTags = company?.tags ?? [];

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag || !company || currentTags.includes(tag)) return;
    dispatch(updateCompanyTags({ id: company._id, tags: [...currentTags, tag] }));
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!company) return;
    dispatch(updateCompanyTags({ id: company._id, tags: currentTags.filter((t) => t !== tag) }));
  };

  const handleRestoreDefaults = () => {
    if (!company) return;
    dispatch(updateCompanyTags({ id: company._id, tags: DEFAULT_TAG_OPTIONS }));
  };

  // ── No company yet ────────────────────────────────────────────────────────
  if (!company && !authUser?.companyId) {
    return (
      <div className="min-h-screen bg-[#fffdf9] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create your company</h1>
          <p className="text-gray-500 text-sm mb-6">Set up a workspace to manage your team and WhatsApp numbers.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="Company name"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Company"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
    );
  }

  // ── Company loaded ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fffdf9] md:ml-16 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex justify-between">
            {error}
            <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* ── Company name ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</h2>
          <div className="flex items-center gap-3">
            {editingName ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button onClick={handleSaveName} className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800">Save</button>
                <button onClick={() => setEditingName(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-lg font-semibold text-gray-900">{company?.name}</span>
                <button onClick={() => setEditingName(true)} className="text-sm text-gray-400 hover:text-gray-700">Edit</button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">ID: {company?._id}</p>
        </div>

        {/* ── AI settings ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Settings</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">AI Auto-extraction</p>
              <p className="text-xs text-gray-400 mt-0.5">Automatically extract lead details from WhatsApp conversations using OpenAI.</p>
            </div>
            <button
              onClick={handleToggleAI}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                company?.settings.aiEnabled ? "bg-black" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  company?.settings.aiEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">RAG Injection</p>
              <p className="text-xs text-gray-400 mt-0.5">Use your training examples to guide AI reply style. Disable to fall back to generic tone.</p>
            </div>
            <button
              onClick={handleToggleRAG}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                company?.settings.ragEnabled !== false ? "bg-black" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  company?.settings.ragEnabled !== false ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Tags ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lead Tags</h2>
              <p className="text-xs text-gray-400 mt-1">
                {currentTags.length === 0
                  ? "No custom tags set — default tags are in use."
                  : `${currentTags.length} custom tag${currentTags.length !== 1 ? "s" : ""} active`}
              </p>
            </div>
            {currentTags.length === 0 && (
              <button
                onClick={handleRestoreDefaults}
                className="text-xs text-indigo-500 hover:text-indigo-700"
              >
                Load defaults
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
            {currentTags.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Using system defaults</p>
            ) : (
              currentTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-500 leading-none"
                    title={`Remove "${tag}"`}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading || !newTag.trim()}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>

        {/* ── Team members ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Team Members</h2>

          <ul className="space-y-3 mb-5">
            {company?.users.map((u, i) => (
              <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.userId?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{u.userId?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}>{u.role}</span>
                  {u.role !== "admin" && (
                    <button
                      onClick={() => handleRemoveUser(u.userId?._id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddUser} className="flex gap-2">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="user@email.com"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >Add</button>
          </form>
        </div>

        {/* ── WhatsApp numbers ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Numbers</h2>
            <button
              onClick={() => setShowWaForm(!showWaForm)}
              className="text-sm px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800"
            >+ Add Number</button>
          </div>

          {company?.whatsappNumbers.length === 0 && (
            <p className="text-sm text-gray-400 mb-4">No WhatsApp numbers connected yet.</p>
          )}

          <ul className="space-y-3 mb-4">
            {company?.whatsappNumbers.map((n, i) => (
              <li key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.displayPhoneNumber}</p>
                  <p className="text-xs text-gray-400">ID: {n.phoneNumberId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleWhatsapp(n.phoneNumberId)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      n.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >{n.isActive ? "Active" : "Inactive"}</button>
                  <button
                    onClick={() => handleRemoveWhatsapp(n.phoneNumberId)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >Remove</button>
                </div>
              </li>
            ))}
          </ul>

          {showWaForm && (
            <form onSubmit={handleAddWhatsapp} className="space-y-3 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700">Add WhatsApp Number</p>
              {(["phoneNumberId", "displayPhoneNumber", "accessToken", "verifyToken"] as const).map((field) => (
                <input
                  key={field}
                  type={field === "accessToken" ? "password" : "text"}
                  placeholder={
                    field === "phoneNumberId" ? "Phone Number ID"
                    : field === "displayPhoneNumber" ? "Display Phone Number (e.g. +91 9999...)"
                    : field === "accessToken" ? "Access Token"
                    : "Verify Token"
                  }
                  value={waForm[field]}
                  onChange={(e) => setWaForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              ))}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >Save</button>
                <button type="button" onClick={() => setShowWaForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanySettingsPage;
