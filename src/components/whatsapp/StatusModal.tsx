// StatusModal.tsx
import React, { useState } from "react";

export interface Status {
  id: string;
  content: string;
  type: "text" | "image";
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: string;
  imageUrl?: string;
  createdAt: Date;
  expiresAt: Date;
  viewedBy: string[];
}

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStatus: (
    status: Omit<Status, "id" | "createdAt" | "expiresAt" | "viewedBy">
  ) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  onCreateStatus,
}) => {
  const [statusType, setStatusType] = useState<"text" | "image">("text");
  const [statusContent, setStatusContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#128C7E"); // WhatsApp green
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontStyle, setFontStyle] = useState("normal");
  const [error, setError] = useState("");

  const backgroundOptions = [
    { color: "#128C7E", name: "WhatsApp Green" },
    { color: "#075E54", name: "Dark Green" },
    { color: "#25D366", name: "Light Green" },
    { color: "#34B7F1", name: "Blue" },
    { color: "#ECE5DD", name: "Light Gray" },
    { color: "#232D36", name: "Dark Gray" },
    { color: "#FF5733", name: "Orange" },
    { color: "#E91E63", name: "Pink" },
    { color: "#9C27B0", name: "Purple" },
  ];

  const fontOptions = [
    { value: "normal", name: "Normal" },
    { value: "italic", name: "Italic" },
    { value: "bold", name: "Bold" },
  ];

  const handleSubmit = () => {
    if (!statusContent.trim()) {
      setError("Please enter status content");
      return;
    }

    const newStatus = {
      content: statusContent,
      type: statusType,
      backgroundColor,
      textColor,
      fontStyle,
    };

    onCreateStatus(newStatus);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStatusType("text");
    setStatusContent("");
    setBackgroundColor("#128C7E");
    setTextColor("#FFFFFF");
    setFontStyle("normal");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Create Status</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          <div className="space-y-4">
            {/* Status Type Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Status Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={statusType === "text"}
                    onChange={() => setStatusType("text")}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Text Status
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={statusType === "image"}
                    onChange={() => setStatusType("image")}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded-full"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Image Status (Coming Soon)
                  </span>
                </label>
              </div>
            </div>

            {/* Status Content */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Status Content
              </label>
              <textarea
                value={statusContent}
                onChange={(e) => setStatusContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                rows={4}
                maxLength={280}
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {statusContent.length}/280
              </div>
            </div>

            {/* Style Options (for text status) */}
            {statusType === "text" && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Background Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.color}
                        type="button"
                        onClick={() => setBackgroundColor(option.color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          backgroundColor === option.color
                            ? "border-blue-500"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: option.color }}
                        title={option.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setTextColor("#FFFFFF")}
                      className={`px-3 py-1 rounded-md border ${
                        textColor === "#FFFFFF"
                          ? "bg-gray-200 border-gray-400"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      White
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextColor("#000000")}
                      className={`px-3 py-1 rounded-md border ${
                        textColor === "#000000"
                          ? "bg-gray-200 border-gray-400"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      Black
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Font Style
                  </label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {fontOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Preview
                  </label>
                  <div
                    className="border rounded-lg p-4 min-h-20 flex items-center justify-center text-center"
                    style={{
                      backgroundColor: backgroundColor,
                      color: textColor,
                      fontStyle: fontStyle === "italic" ? "italic" : "normal",
                      fontWeight: fontStyle === "bold" ? "bold" : "normal",
                    }}
                  >
                    {statusContent || "Your status will appear here"}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 ${
                statusContent.trim()
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } font-medium rounded-lg transition-colors`}
              disabled={!statusContent.trim()}
            >
              Create Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
