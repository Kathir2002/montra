import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en';
import ta from './ta';
import zh from './zh';
import ml from './ml';
import te from './te';
import ru from './ru';
import nl from './nl';
import ko from './ko';
import kn from './kn';
import it from './it';
import id from './id';
import hi from './hi';
import gu from './gu';
import fr from './fr';
import es from './es';
import de from './de';
import ar from './ar';
import pt from './pt';
import ja from './ja';
import {languageDetectorPlugin} from './languageDetector';

const resources = {
  // list of languages
  en,
  ta,
  zh,
  ml,
  te,
  ru,
  nl,
  ko,
  kn,
  it,
  id,
  hi,
  gu,
  fr,
  es,
  de,
  ar,
  pt,
  ja,
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    compatibilityJSON: 'v3',
    resources,
    // lng: 'ar',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
export default i18n;
