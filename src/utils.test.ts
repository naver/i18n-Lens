/**
 * i18n-Lens
 * Copyright (c) 2022-present NAVER Corp.
 * Apache License v2.0
 */

import assert from 'assert';
import {
  flattenObject,
  flattenDictionary,
  getDistanceBetweenDirectories,
} from './utils';

describe('flattenObject', () => {
  it('does not any change if the object is already flattened', () => {
    assert.deepEqual(
      flattenObject({
        foo: 'foo',
        bar: 'bar',
      }),
      {
        foo: 'foo',
        bar: 'bar',
      },
    );
  });

  it('flatten the 2-layer object', () => {
    assert.deepEqual(
      flattenObject({
        foo: 'foo',
        bar: {
          baz: 'baz',
          qux: 'qux',
        },
      }),
      {
        foo: 'foo',
        baz: 'baz',
        qux: 'qux',
      },
    );
  });

  it('flatten the 3-layer object', () => {
    assert.deepEqual(
      flattenObject({
        foo: 'foo',
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      }),
      {
        foo: 'foo',
        qux: 'qux',
      },
    );
  });
});

describe('flattenDictionary', () => {
  it('does not any change if the object is already flattened', () => {
    assert.deepEqual(
      flattenDictionary({
        ko: {
          foo: 'foo',
          bar: 'bar',
        },
        en: {
          foo: 'foo',
          bar: 'bar',
        },
      }),
      {
        ko: {
          foo: 'foo',
          bar: 'bar',
        },
        en: {
          foo: 'foo',
          bar: 'bar',
        },
      },
    );
  });

  it('flatten the 2-layer object', () => {
    assert.deepEqual(
      flattenDictionary({
        ko: {
          foo: 'foo',
          bar: {
            baz: 'baz',
            qux: 'qux',
          },
        },
        en: {
          foo: 'foo',
          bar: {
            baz: 'baz',
            qux: 'qux',
          },
        },
      }),
      {
        ko: {
          foo: 'foo',
          baz: 'baz',
          qux: 'qux',
        },
        en: {
          foo: 'foo',
          baz: 'baz',
          qux: 'qux',
        },
      },
    );
  });

  it('flatten the 3-layer object', () => {
    assert.deepEqual(
      flattenDictionary({
        ko: {
          foo: 'foo',
          bar: {
            baz: 'baz',
          },
        },
        en: {
          bar: {
            baz: {
              qux: 'qux',
            },
          },
        },
      }),
      {
        ko: {
          foo: 'foo',
          baz: 'baz',
        },
        en: {
          qux: 'qux',
        },
      },
    );
  });
});

describe('getDistanceBetweenDirectories', () => {
  it('returns 0 if two directories are the same', () => {
    assert.equal(getDistanceBetweenDirectories('/', '/'), 0);
    assert.equal(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop',
        '/Users/user/Desktop',
      ),
      0,
    );
  });

  it('returns depth of one directory if depth of the other directory is zero', () => {
    assert.equal(getDistanceBetweenDirectories('/', '/Users/user/Desktop'), 3);
    assert.equal(getDistanceBetweenDirectories('', '/Users/user/Desktop'), 3);
  });

  it('returns distance between two directories if one is included in the other', () => {
    assert.equal(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project',
        '/Users/user/Desktop/',
      ),
      1,
    );
    assert.equal(
      getDistanceBetweenDirectories('/Users/user/Desktop', '/Users'),
      2,
    );
  });

  it('returns distance between two directories', () => {
    assert.equal(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project',
        '/Users/user/Desktop/Data',
      ),
      2,
    );
    assert.equal(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project/i18n-Lens',
        '/Users/user/Desktop/Data',
      ),
      3,
    );
  });
});
