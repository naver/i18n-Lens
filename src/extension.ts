/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import * as i18nTextHandler from './core/i18nTextHandler';
import { getI18nControllerList } from './core/I18nController';

export const EXTENSION_NAME = 'i18n-Lens';

export function getConfiguration() {
  const configuration = vscode.workspace.getConfiguration(EXTENSION_NAME);

  const translatorFunctionName: string =
    configuration.get('translatorFunctionName') || '';
  const localeDirectoryPath: string =
    configuration.get('localeDirectoryPath') || '';

  const i18nPattern = new RegExp(
    '^' +
      translatorFunctionName +
      "\\([\\`\\']([\\w\\.\\:\\_\\-]+)[\\`\\']\\,?(\\{.*\\})?\\)",
    'g',
  );
  const translatorFunctionOpener = translatorFunctionName + '(';

  return {
    translatorFunctionOpener,
    i18nPattern,
    localeDirectoryPath,
  };
}

export async function activate(context: vscode.ExtensionContext) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  let i18nControllerList = await getI18nControllerList(
    vscode.workspace.workspaceFolders ?? [],
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(async (e) => {
      i18nControllerList = await getI18nControllerList(
        vscode.workspace.workspaceFolders ?? [],
      );
    }),
  );

  vscode.languages.registerHoverProvider(
    '*',
    new (class implements vscode.HoverProvider {
      provideHover(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.Hover> {
        const i18nController = i18nControllerList.find((i18nController) => {
          const currentDocumentPath =
            vscode.window.activeTextEditor?.document.uri.path;
          return currentDocumentPath?.includes(i18nController.rootPath);
        });
        if (!i18nController?.i18nList.length) {
          return;
        }

        const i18nKey = i18nTextHandler.getI18nKeyOnHoveredPosition(
          _document,
          _position,
        );
        if (!i18nKey) {
          return;
        }

        const contents = i18nController.getTooltipContents(i18nKey);
        contents.isTrusted = true;
        return new vscode.Hover(contents);
      }
    })(),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
