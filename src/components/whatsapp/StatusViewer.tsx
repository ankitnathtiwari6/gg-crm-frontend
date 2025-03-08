// StatusViewer.tsx
import React, { useState, useEffect } from "react";
import { Status } from "./StatusModal";

interface StatusViewerProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: Status[];
  currentStatusIndex?: number;
  onStatusView: (statusId: string) => void;
}

export const StatusViewer: React.FC<StatusViewerProps> = ({
  isOpen,
  onClose,
  statuses,
  currentStatusIndex = 0,
  onStatusView,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentStatusIndex);
  const [progress, setProgress] = useState(0);
  const progressInterval = 100; // ms
  const viewDuration = 5000; // 5 seconds per status

  useEffect(() => {
    if (!isOpen || statuses.length === 0) return;

    // Mark current status as viewed
    if (statuses[activeIndex]) {
      onStatusView(statuses[activeIndex].id);
    }

    // Start progress timer
    const totalSteps = viewDuration / progressInterval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const newProgress = (currentStep / totalSteps) * 100;
      setProgress(newProgress);

      if (currentStep >= totalSteps) {
        // Move to next status or close if at the end
        if (activeIndex < statuses.length - 1) {
          setActiveIndex((prevIndex) => prevIndex + 1);
          setProgress(0);
          currentStep = 0;
        } else {
          // Last status finished
          clearInterval(timer);
          onClose();
        }
      }
    }, progressInterval);

    return () => clearInterval(timer);
  }, [isOpen, activeIndex, statuses, onClose, onStatusView]);

  useEffect(() => {
    // Reset index when new status is opened
    setActiveIndex(currentStatusIndex);
    setProgress(0);
  }, [currentStatusIndex, isOpen]);

  const handlePrevStatus = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setProgress(0);
    }
  };

  const handleNextStatus = () => {
    if (activeIndex < statuses.length - 1) {
      setActiveIndex(activeIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!isOpen || statuses.length === 0) return null;

  const currentStatus = statuses[activeIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {statuses.map((_, index) => (
          <div
            key={index}
            className="h-1 bg-gray-600 rounded-full flex-1 overflow-hidden"
          >
            <div
              className={`h-full bg-white ${
                index === activeIndex
                  ? "transition-all duration-100"
                  : index < activeIndex
                  ? "w-full"
                  : "w-0"
              }`}
              style={{
                width: index === activeIndex ? `${progress}%` : undefined,
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2"
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

      {/* Status content */}
      <div
        className="max-w-md w-full h-[70vh] flex items-center justify-center p-6 rounded-lg relative"
        style={{
          backgroundColor:
            currentStatus.type === "text"
              ? currentStatus.backgroundColor
              : "transparent",
        }}
      >
        {currentStatus.type === "text" ? (
          <div
            className="text-xl text-center"
            style={{
              color: currentStatus.textColor || "white",
              fontStyle:
                currentStatus.fontStyle === "italic" ? "italic" : "normal",
              fontWeight:
                currentStatus.fontStyle === "bold" ? "bold" : "normal",
            }}
          >
            {currentStatus.content}
          </div>
        ) : (
          <img
            src={currentStatus.imageUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Info footer */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white text-sm">
          <div>
            {new Date(currentStatus.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div>
            {currentStatus.viewedBy.length} view
            {currentStatus.viewedBy.length !== 1 && "s"}
          </div>
        </div>
      </div>

      {/* Navigation overlay */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 cursor-pointer" onClick={handlePrevStatus}></div>
        <div className="w-1/2 cursor-pointer" onClick={handleNextStatus}></div>
      </div>
    </div>
  );
};
