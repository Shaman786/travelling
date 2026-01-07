import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const HISTORY_KEY = "search_history";
const MAX_HISTORY = 5;

export const useSearch = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load search history", e);
    }
  };

  const addToHistory = async (term: string) => {
    if (!term.trim()) return;
    try {
      const newHistory = [
        term,
        ...history.filter((h) => h !== term),
      ].slice(0, MAX_HISTORY);
      
      setHistory(newHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save search history", e);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear search history", e);
    }
  };

  return { history, addToHistory, clearHistory };
};
