import { createContext } from 'react';

import type { translationsType } from '@/types/translations';

export type localeType = 'en' | 'ru';
export interface Context {
  locale: localeType;
  translations: translationsType;
  setLocale: (locale: localeType) => void;
}

export const initialTranslations: translationsType = {
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  h1: 'Welcome',
  errorBoundaryTitle: 'Error... Something went wrong!',
  errorBoundaryBtn: 'Reload Page',
  notFoundTitile: 'Not Found Page',
  notFoundBtn: 'Back To Home',
};

const initialAppContext: Context = {
  locale: 'en',
  translations: initialTranslations,
  setLocale: () => {},
};

export const AppContext = createContext<Context>(initialAppContext);
