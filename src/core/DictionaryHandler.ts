/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import { flattenDictionary } from '../utils';
import type { Dictionary } from '../types';

class DictionaryHandler {
  localePath: string;
  dictionary: Dictionary;
  flattenedDictionary: Dictionary;
  constructor({
    localePath,
    dictionary,
  }: {
    localePath: string;
    dictionary: Dictionary;
  }) {
    this.localePath = localePath;
    this.dictionary = dictionary;
    this.flattenedDictionary = flattenDictionary(dictionary);
  }

  internationalize(locale: string, key: string): string {
    const translatedValue: string = (() => {
      // If no delimiter exists, use this.flattenedDictionary to quickly get the translated value.
      if (!key.includes(':')) {
        const localeFlattenedDictionary = this.flattenedDictionary[
          locale
        ] as Dictionary;
        return localeFlattenedDictionary?.[key] as string;
      }

      // If delimiter exists, travel this.dictionary to get the translated value.
      return key.split(':').reduce((value, subKey) => {
        if (typeof value === 'string') {
          return value;
        }
        return value?.[subKey];
      }, this.dictionary[locale]) as string;
    })();

    return translatedValue?.replace(/\n/g, '\\n') || '-';
  }
}

export default DictionaryHandler;
