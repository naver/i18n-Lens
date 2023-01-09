/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import { getConfiguration } from '../extension';

type Dictionary = {
  [key: string]: string;
};

class I18n {
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

class I18nController {
  i18nList: I18n[];
  rootPath: string;

  constructor({ i18nList, rootPath }: { i18nList: I18n[]; rootPath: string }) {
    this.i18nList = i18nList;
    this.rootPath = rootPath;
  }

  static async init(rootPath: string) {
    const i18nList = await this.getI18nList(rootPath);
    return new I18nController({ i18nList, rootPath });
  }

  static async getI18nList(rootPath: string) {
    const { localeDirectoryPath } = getConfiguration();
    const pattern = [`${rootPath}${localeDirectoryPath}/*`];

    const localePathList = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyFiles: false,
    });

    const i18nList: I18n[] = [];

    for (const localePath of localePathList) {
      const isDirectory = fs.lstatSync(localePath).isDirectory();
      const { name: locale } = path.parse(localePath);
      const i18n = new I18n(locale);
      if (!isDirectory) {
        const dictionary = JSON.parse(await fs.readFile(localePath, 'utf-8'));
        i18n.add({ dictionary });
        i18nList.push(i18n);
      } else {
        const subPathList = await fg([`${localePath}/*`], {
          ignore: ['**/node_modules'],
          onlyFiles: true,
        });
        for (const subPath of subPathList) {
          const { name } = path.parse(subPath);
          const dictionary = JSON.parse(await fs.readFile(subPath, 'utf-8'));
          i18n.add({
            division: name,
            dictionary,
          });
        }
        i18nList.push(i18n);
      }
    }
    return i18nList;
  }

  getTooltipContents(i18nKey: string) {
    const internationalizedStringList = this.i18nList.map((i18n) => {
      return `|${i18n.locale}|${i18n.internationalize(i18nKey)}|`;
    });

    return new vscode.MarkdownString(
      ['|lang|text|', '|:----|----:|', ...internationalizedStringList].join(
        '\n',
      ),
    );
  }
}

export async function getI18nControllerList(
  workspaceFolders: readonly vscode.WorkspaceFolder[],
) {
  const rootPathList = workspaceFolders.map(
    (workspaceFolder) => workspaceFolder.uri.fsPath,
  );
  const orderedRootPathList = rootPathList.sort((l, r) => r.length - l.length);
  return await Promise.all(
    orderedRootPathList.map((rootPath) => {
      return I18nController.init(rootPath);
    }) || [],
  );
}

export default I18nController;
