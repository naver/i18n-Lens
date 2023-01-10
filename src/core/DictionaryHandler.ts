/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import { flattenDictionary } from '../utils';
import { Dictionary } from '../types';

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

  internationalize(locale: string, key: string) {
    const translatedValue = (() => {
      // If no delimiter exists, use this.flattenedDictionary to quickly get the translated value.
      if (!key.includes(':')) {
        return (this.flattenedDictionary?.[locale] as Dictionary)?.[key];
      }

      // If delimiter exists, travel this.dictionary to get the translated value.
      return key.split(':').reduce((value: any, key) => {
        return value?.[key];
      }, this.dictionary[locale]);
    })();

    return translatedValue?.replace(/\n/g, '\\n') || '-';
  }
}

export default DictionaryHandler;
