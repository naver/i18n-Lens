/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import { Dictionary } from '../types';

class DictionaryHandler {
  locale: string;
  layeredDictionary: {
    [division: string]: Dictionary;
  };
  dictionary: Dictionary;
  constructor(locale: string) {
    this.locale = locale;
    this.layeredDictionary = {};
    this.dictionary = {};
  }
  add({ division, dictionary }: { division?: string; dictionary: Dictionary }) {
    if (division) {
      this.layeredDictionary = {
        ...this.layeredDictionary,
        [division]: dictionary,
      };
    }
    this.dictionary = {
      ...this.dictionary,
      ...dictionary,
    };
  }
  internationalize(key: string) {
    if (key.includes(':')) {
      const [division, subKey] = key.split(':');
      return (
        this.layeredDictionary?.[division]?.[subKey]?.replace(/\n/g, '\\n') ||
        '-'
      );
    }
    return this.dictionary?.[key]?.replace(/\n/g, '\\n') || '-';
  }
}

export default DictionaryHandler;
