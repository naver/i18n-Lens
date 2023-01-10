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
    const workspacePathList = workspaceFolders.map(
      (workspaceFolder) => workspaceFolder.uri.fsPath,
    );
    const dictionaryHandlerList = await this.getDictionaryHandlerList(
      workspacePathList,
    );
    return new I18nController(dictionaryHandlerList);
  }

  static async createDictionary(rootPath: string) {
    const { localeDirectoryPath } = getConfiguration();
    const pattern = [`${rootPath}${localeDirectoryPath}/*`];
    const pathList = await fg(pattern, {
      ignore: ['**/node_modules'],
      onlyFiles: false,
    });

    let dictionary: Dictionary = {};
    for (const currentPath of pathList) {
      const isDirectory = fs.lstatSync(currentPath).isDirectory();

      let value;
      if (isDirectory) {
        const subPathList = await fg([`${currentPath}/*`], {
          ignore: ['**/node_modules'],
          onlyFiles: true,
        });
        let subDictionary: Dictionary = {};
        for (const subPath of subPathList) {
          const { name: division } = path.parse(subPath);
          subDictionary = {
            ...subDictionary,
            [division]: JSON.parse(await fs.readFile(subPath, 'utf-8')),
          };
        }
        value = subDictionary;
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
    workspacePathList: string[],
  ): Promise<DictionaryHandler[]> {
    const dictionary = await Promise.all(
      workspacePathList.map(async (workspacePath) => {
        const dictionary = await this.createDictionary(workspacePath);
        return new DictionaryHandler({
          dictionary,
          workspacePath,
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
        dictionaryHandler.workspacePath,
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
