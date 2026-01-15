"use client";

import React, { useEffect, useRef, useState } from "react";
import { BiBriefcase } from "react-icons/bi";
import {
  FaBabyCarriage,
  FaCamera,
  FaCar,
  FaMapMarkerAlt,
  FaPassport,
  FaSuitcase,
  FaTaxi,
  FaWheelchair,
  FaWifi,
} from "react-icons/fa";
import {
  MdFastfood,
  MdLocalCafe,
  MdLocalHospital,
  MdLocalOffer,
  MdStar,
  MdTranslate,
} from "react-icons/md";

interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const ICON_OPTIONS: IconOption[] = [
  { value: "bag-suitcase", label: "Baggage / Suitcase", icon: <FaSuitcase /> },
  { value: "bag-personal", label: "Backpack", icon: <BiBriefcase /> },
  { value: "car", label: "Car / Transfer", icon: <FaCar /> },
  { value: "taxi", label: "Taxi", icon: <FaTaxi /> },
  { value: "food", label: "Food / Meal", icon: <MdFastfood /> },
  { value: "cup", label: "Drink", icon: <MdLocalCafe /> },
  {
    value: "medical-bag",
    label: "Medical / Insurance",
    icon: <MdLocalHospital />,
  },
  { value: "passport", label: "Visa / Passport", icon: <FaPassport /> },
  {
    value: "ticket-percent",
    label: "Ticket / Discount",
    icon: <MdLocalOffer />,
  },
  { value: "wifi", label: "Wifi", icon: <FaWifi /> },
  { value: "star", label: "Star / VIP", icon: <MdStar /> },
  { value: "translate", label: "Guide / Language", icon: <MdTranslate /> },
  {
    value: "wheelchair-accessibility",
    label: "Wheelchair Access",
    icon: <FaWheelchair />,
  },
  { value: "baby-carriage", label: "Baby / Child", icon: <FaBabyCarriage /> },
  { value: "camera", label: "Photography", icon: <FaCamera /> },
  { value: "map-marker", label: "Location / Map", icon: <FaMapMarkerAlt /> },
];

interface CustomIconSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomIconSelect({
  value,
  onChange,
}: CustomIconSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    ICON_OPTIONS.find((opt) => opt.value === value) || ICON_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl text-gray-500 dark:text-gray-400">
            {selectedOption.icon}
          </span>
          <span className="text-sm font-medium">{selectedOption.label}</span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {ICON_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 ${
                value === option.value
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <span className="text-xl opacity-75">{option.icon}</span>
              <span className="text-sm">{option.label}</span>
              {value === option.value && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
