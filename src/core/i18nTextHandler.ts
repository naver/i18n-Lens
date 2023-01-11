/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import * as vscode from 'vscode';
import { getConfiguration } from '../extension';

export function getI18nKeyOnHoveredPosition(
  _document: vscode.TextDocument,
  _position: vscode.Position,
): string | null {
  const range = getRangeOfI18nText(_document, _position);
  if (!range) {
    return null;
  }

  const i18nKey = getI18nKeyInRange(_document, range);
  if (!i18nKey) {
    return null;
  }

  return i18nKey;
}

function getRangeOfI18nText(
  _document: vscode.TextDocument,
  _position: vscode.Position,
): vscode.Range | null {
  const i18nOpeningPosition = getI18nOpeningPosition(_document, _position);
  if (!i18nOpeningPosition) {
    return null;
  }

  const i18nClosingPosition = getI18nClosingPosition(
    _document,
    i18nOpeningPosition,
  );
  if (
    !i18nClosingPosition ||
    comparePosition(i18nClosingPosition, _position) <= 0
  ) {
    return null;
  }

  return new vscode.Range(i18nOpeningPosition, i18nClosingPosition);
}

function getI18nKeyInRange(
  _document: vscode.TextDocument,
  range: vscode.Range,
): string | null {
  const { i18nPattern } = getConfiguration();

  const targetWord = _document.getText(range).replace(/\s/g, '');
  const i18nKey = i18nPattern.exec(targetWord)?.[1] ?? null;
  return i18nKey;
}

function getI18nOpeningPosition(
  _document: vscode.TextDocument,
  _position: vscode.Position,
): vscode.Position | null {
  const { translatorFunctionOpener } = getConfiguration();

  const rangeOfWordAtPosition = _document.getWordRangeAtPosition(_position);

  const endOfHoveredWord = rangeOfWordAtPosition?.end;
  if (!endOfHoveredWord) {
    return null;
  }

  const openingIndexInCurrentLine = _document
    .lineAt(_position.line)
    .text.slice(0, endOfHoveredWord.character + 1)
    .lastIndexOf(translatorFunctionOpener);

  if (openingIndexInCurrentLine >= 0) {
    return new vscode.Position(_position.line, openingIndexInCurrentLine);
  }

  const openingIndexInPrevLine = _document
    .lineAt(_position.line - 1)
    .text.lastIndexOf(translatorFunctionOpener);
  if (openingIndexInPrevLine >= 0) {
    return new vscode.Position(_position.line - 1, openingIndexInPrevLine);
  }

  return null;
}

function getI18nClosingPosition(
  _document: vscode.TextDocument,
  i18nOpeningPosition: vscode.Position,
): vscode.Position | null {
  const { translatorFunctionOpener } = getConfiguration();

  let parenthesisDepth = 1;
  let pointer = i18nOpeningPosition.character + translatorFunctionOpener.length;
  for (
    let line = i18nOpeningPosition.line;
    line < _document.lineCount;
    line++
  ) {
    const lineText = _document.lineAt(line).text;
    for (pointer; pointer < lineText.length; pointer++) {
      if (lineText[pointer] === '(') {
        parenthesisDepth += 1;
      }
      if (lineText[pointer] === ')') {
        parenthesisDepth += -1;
      }
      if (parenthesisDepth === 0) {
        return new vscode.Position(line, pointer + 1);
      }
    }
    pointer = 0;
  }
  return null;
}

function comparePosition(
  leftP: vscode.Position,
  rightP: vscode.Position,
): number {
  if (leftP.line !== rightP.line) {
    return leftP.line - rightP.line;
  }
  return leftP.character - rightP.character;
}
