/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import fg from 'fast-glob';
import path from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import DictionaryHandler from './DictionaryHandler';
import { getConfiguration } from '../extension';
import { getDistanceBetweenDirectories } from '../utils';
import { Dictionary } from '../types';

class I18nController {
  dictionaryHandlerList: DictionaryHandler[];
  selectedDictionaryHandler: DictionaryHandler;

  constructor(dictionaryHandlerList: DictionaryHandler[]) {
    this.dictionaryHandlerList = dictionaryHandlerList;
    this.selectedDictionaryHandler = dictionaryHandlerList[0];
  }

  static async init(workspaceFolders: readonly vscode.WorkspaceFolder[]) {
    const localePathSet = await this.getLocalePathSet(workspaceFolders);
    const dictionaryHandlerList = await this.getDictionaryHandlerList(
      localePathSet,
    );
    return new I18nController(dictionaryHandlerList);
  }

  static async getLocalePathSet(
    workspaceFolders: readonly vscode.WorkspaceFolder[],
  ): Promise<Set<string>> {
    const { localeDirectoryPath } = getConfiguration();
    const workspacePathList = workspaceFolders.map(
      (workspaceFolder) => workspaceFolder.uri.fsPath,
    );
    const localePathList = _.flatten(
      await Promise.all(
        workspacePathList.map((workspacePath) => {
          const pattern = [`${workspacePath}${localeDirectoryPath}`];
          return fg(pattern, {
            ignore: ['**/node_modules'],
            onlyFiles: false,
          });
        }),
      ),
    );
    return new Set(localePathList);
  }

  static async createDictionary(parentPath: string): Promise<Dictionary> {
    const pathList = await fg([`${parentPath}/*`], {
      ignore: ['**/node_modules'],
      onlyFiles: false,
    });

    let dictionary: Dictionary = {};
    for (const currentPath of pathList) {
      const isDirectory = fs.lstatSync(currentPath).isDirectory();

      let value;
      if (isDirectory) {
        value = await this.createDictionary(currentPath);
      } else {
        value = JSON.parse(await fs.readFile(currentPath, 'utf-8'));
      }

      const { name } = path.parse(currentPath);
      dictionary = {
        ...dictionary,
        [name]: value,
      };
    }
    return dictionary;
  }

  static async getDictionaryHandlerList(
    localePathSet: Set<string>,
  ): Promise<DictionaryHandler[]> {
    const dictionary = await Promise.all(
      Array.from(localePathSet).map(async (localePath) => {
        const dictionary = await this.createDictionary(localePath);
        return new DictionaryHandler({
          localePath,
          dictionary,
        });
      }),
    );
    return dictionary;
  }

  setClosestDictionaryHandler(uriPath?: string) {
    if (!uriPath) {
      return;
    }
    const MAX_DISTANCE = 999999;
    let minimumDistance = MAX_DISTANCE;
    for (const dictionaryHandler of this.dictionaryHandlerList) {
      const distance = getDistanceBetweenDirectories(
        uriPath,
        dictionaryHandler.localePath,
      );
      if (distance < minimumDistance) {
        minimumDistance = distance;
        this.selectedDictionaryHandler = dictionaryHandler;
      }
    }
    return this.selectedDictionaryHandler;
  }

  getTooltipContents(i18nKey: string) {
    const selectedDictionaryHandler = this.selectedDictionaryHandler;
    const localeList = Object.keys(selectedDictionaryHandler.dictionary);
    const internationalizedStringList = localeList.map((locale) => {
      return `|${locale}|${selectedDictionaryHandler.internationalize(
        locale,
        i18nKey,
      )}|`;
    });

    return new vscode.MarkdownString(
      ['|lang|text|', '|:----|----:|', ...internationalizedStringList].join(
        '\n',
      ),
    );
  }
}

export default I18nController;
