"use client";

import { SearchIcon } from "@/icons";
import { useEffect, useState } from "react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchInput({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="focus:border-brand-500 focus:ring-brand-500 block min-w-[250px] rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:ring-1 focus:outline-none sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
