# Change Log

All notable changes to the "i18n-Lens" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 0.2.0

_Released 11/01/2023_

### Features

- Allow i18n key to include underline and hyphen. ([#2](https://github.com/naver/i18n-Lens/pull/2))
- Manage locales data by locales directory basis not workspace bases. ([#4](https://github.com/naver/i18n-Lens/pull/4))
- Modify `i18nController` to refer to the nearest locales file from the current file. ([#4](https://github.com/naver/i18n-Lens/pull/4))
- Allow i18n key to include multiple delimiter `:`. ([#4](https://github.com/naver/i18n-Lens/pull/4))

### Bug Fixes

- Prevent tooltip from activating when registered `i18nController.selectedDictionaryHandler.dictionary` does not exists. ([#3](https://github.com/naver/i18n-Lens/pull/3))

## 0.1.0

_Released 04/01/2023_

### Features

- Displays the translated values when the i18n key is being hovered.
