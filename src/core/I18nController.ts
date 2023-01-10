/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import DictionaryHandler from './DictionaryHandler';
import { getConfiguration } from '../extension';
import { Dictionary } from '../types';

class I18nController {
  dictionaryHandlerList: DictionaryHandler[];
  rootPath: string;

  constructor({
    dictionaryHandlerList,
    rootPath,
  }: {
    dictionaryHandlerList: DictionaryHandler[];
    rootPath: string;
  }) {
    this.dictionaryHandlerList = dictionaryHandlerList;
    this.rootPath = rootPath;
  }

  static async init(rootPath: string) {
    const dictionaryHandlerList = await this.getDictionaryHandlerList(rootPath);
    return new I18nController({ dictionaryHandlerList, rootPath });
  }

  static async getDictionaryHandlerList(rootPath: string) {
    const { localeDirectoryPath } = getConfiguration();
    const pattern = [`${rootPath}${localeDirectoryPath}/*`];

    const localePathList = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyFiles: false,
    });

    const dictionaryHandlerList: DictionaryHandler[] = [];

    for (const localePath of localePathList) {
      const isDirectory = fs.lstatSync(localePath).isDirectory();
      const { name: locale } = path.parse(localePath);
      const dictionaryHandler = new DictionaryHandler(locale);
      if (!isDirectory) {
        const dictionary = JSON.parse(await fs.readFile(localePath, 'utf-8'));
        dictionaryHandler.add({ dictionary });
        dictionaryHandlerList.push(dictionaryHandler);
      } else {
        const subPathList = await fg([`${localePath}/*`], {
          ignore: ['**/node_modules'],
          onlyFiles: true,
        });
        for (const subPath of subPathList) {
          const { name } = path.parse(subPath);
          const dictionary = JSON.parse(await fs.readFile(subPath, 'utf-8'));
          dictionaryHandler.add({
            division: name,
            dictionary,
          });
        }
        dictionaryHandlerList.push(dictionaryHandler);
      }
    }
    return dictionaryHandlerList;
  }

  getTooltipContents(i18nKey: string) {
    const internationalizedStringList = this.dictionaryHandlerList.map(
      (dictionaryHandler) => {
        return `|${
          dictionaryHandler.locale
        }|${dictionaryHandler.internationalize(i18nKey)}|`;
      },
    );

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
