/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import * as i18nTextHandler from './core/i18nTextHandler';
import I18nController from './core/I18nController';

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

  const i18nController = await I18nController.init(
    vscode.workspace.workspaceFolders ?? [],
  );

  vscode.languages.registerHoverProvider(
    '*',
    new (class implements vscode.HoverProvider {
      provideHover(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.Hover> {
        i18nController.setClosestDictionaryHandler(
          vscode.window.activeTextEditor?.document.uri.path,
        );

        if (
          !i18nController.selectedDictionaryHandler ||
          !Object.keys(i18nController.selectedDictionaryHandler.dictionary)
            .length
        ) {
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
