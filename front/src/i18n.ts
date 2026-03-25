import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { fr } from "./locales/fr";
import { en } from "./locales/en";
import { kab } from "./locales/kab";

const resources = {
    fr: { translation: fr },
    en: { translation: en },
    kab: { translation: kab }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "fr", // default language
        fallbackLng: "fr",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
