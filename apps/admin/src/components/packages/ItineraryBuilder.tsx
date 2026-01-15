"use client";
import { PlusIcon, TrashBinIcon } from "@/icons";
import Image from "next/image";
import React, { useRef } from "react";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  image?: string; // URL from DB
  imageFile?: File; // New file to upload
  previewUrl?: string; // Local preview
}

interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (value: ItineraryDay[]) => void;
}

export default function ItineraryBuilder({
  value,
  onChange,
}: ItineraryBuilderProps) {
  const fileInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addDay = () => {
    const newDay: ItineraryDay = {
      day: value.length + 1,
      title: "",
      description: "",
      activities: [""],
    };
    onChange([...value, newDay]);
  };

  const removeDay = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = updated.map((d, i) => ({ ...d, day: i + 1 }));
    onChange(renumbered);
  };

  const updateDay = (
    index: number,
    field: keyof ItineraryDay,
    newValue: any,
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const handleDayImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      const updated = [...value];
      updated[index] = {
        ...updated[index],
        imageFile: file,
        previewUrl: previewUrl,
      };
      onChange(updated);
    }
  };

  const removeDayImage = (index: number) => {
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      image: undefined,
      imageFile: undefined,
      previewUrl: undefined,
    };
    onChange(updated);
    // Reset file input if exists
    if (fileInputRef.current[index]) {
      fileInputRef.current[index]!.value = "";
    }
  };

  const addActivity = (dayIndex: number) => {
    const updated = [...value];
    updated[dayIndex].activities.push("");
    onChange(updated);
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    newValue: string,
  ) => {
    const updated = [...value];
    updated[dayIndex].activities[activityIndex] = newValue;
    onChange(updated);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...value];
    updated[dayIndex].activities = updated[dayIndex].activities.filter(
      (_, i) => i !== activityIndex,
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((day, dayIndex) => (
        <div
          key={dayIndex}
          className="relative rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          {/* Day Header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="bg-brand-500 rounded-full px-3 py-1 text-xs font-bold text-white">
              Day {day.day}
            </span>
            <button
              type="button"
              onClick={() => removeDay(dayIndex)}
              className="text-gray-400 hover:text-red-500"
            >
              <TrashBinIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Left Column: Image */}
            <div className="order-2 md:order-1 md:col-span-1">
              <div
                className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900"
                role="button"
                onClick={() => fileInputRef.current[dayIndex]?.click()}
              >
                {day.previewUrl || day.image ? (
                  <Image
                    src={day.previewUrl || day.image || ""}
                    alt={`Day ${day.day}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <PlusIcon className="mb-1 h-6 w-6" />
                    <span className="text-xs">Add Image</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRef.current[dayIndex] = el;
                  }}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleDayImageChange(dayIndex, e)}
                />
              </div>
              {(day.previewUrl || day.image) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDayImage(dayIndex);
                  }}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Right Column: Content */}
            <div className="order-1 space-y-3 md:order-2 md:col-span-2">
              {/* Day Title */}
              <div>
                <input
                  type="text"
                  placeholder="Day Title (e.g. Arrival & Welcome)"
                  value={day.title}
                  onChange={(e) => updateDay(dayIndex, "title", e.target.value)}
                  className="focus:border-brand-500 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Day Description */}
              <div>
                <textarea
                  placeholder="Brief description of the day..."
                  value={day.description}
                  onChange={(e) =>
                    updateDay(dayIndex, "description", e.target.value)
                  }
                  rows={2}
                  className="focus:border-brand-500 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Activities
                </label>
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Activity ${actIndex + 1}`}
                      value={activity}
                      onChange={(e) =>
                        updateActivity(dayIndex, actIndex, e.target.value)
                      }
                      className="focus:border-brand-500 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                    {day.activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeActivity(dayIndex, actIndex)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addActivity(dayIndex)}
                  className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-xs font-medium"
                >
                  <PlusIcon className="h-3 w-3" /> Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Day Button */}
      <button
        type="button"
        onClick={addDay}
        className="hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-500 dark:hover:text-brand-400 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-3 text-sm font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-400"
      >
        <PlusIcon className="h-5 w-5" /> Add Day
      </button>
    </div>
  );
}
