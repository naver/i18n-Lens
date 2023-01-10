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
      if (!key.includes(':')) {
        return (this.flattenedDictionary?.[locale] as Dictionary)?.[key];
      }
      return key.split(':').reduce((value: any, key) => {
        return value?.[key];
      }, this.dictionary[locale]);
    })();

    return translatedValue?.replace(/\n/g, '\\n') || '-';
  }
}

export default DictionaryHandler;
