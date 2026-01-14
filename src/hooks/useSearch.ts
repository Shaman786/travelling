import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

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

  const addToHistory = useCallback(async (term: string) => {
    if (!term.trim()) return;
    try {
      // Use functional state update to access latest history without dependency
      setHistory((prevHistory) => {
        const newHistory = [
          term,
          ...prevHistory.filter((h) => h !== term),
        ].slice(0, MAX_HISTORY);

        AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory)).catch(
          (e) => console.error("Failed to save search history", e)
        );

        return newHistory;
      });
    } catch (e) {
      console.error("Failed to update history", e);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear search history", e);
    }
  }, []);

  return { history, addToHistory, clearHistory };
};
