import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./ar.json";
import en from "./en.json";
import hi from "./hi.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ar: { translation: ar },
};

i18next.use(initReactI18next).init({
  resources,
  lng: getLocales()[0]?.languageCode || "en",
  fallbackLng: "en",
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18next;
