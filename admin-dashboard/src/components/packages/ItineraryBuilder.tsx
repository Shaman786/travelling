"use client";
import { PlusIcon, TrashBinIcon } from "@/icons";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (value: ItineraryDay[]) => void;
}

export default function ItineraryBuilder({
  value,
  onChange,
}: ItineraryBuilderProps) {
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
    newValue: string | string[],
  ) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
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

          {/* Day Title */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Day Title (e.g. Arrival & Welcome)"
              value={day.title}
              onChange={(e) => updateDay(dayIndex, "title", e.target.value)}
              className="focus:border-brand-500 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Day Description */}
          <div className="mb-3">
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
