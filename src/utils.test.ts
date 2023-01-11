import {
  flattenObject,
  flattenDictionary,
  getDistanceBetweenDirectories,
} from './utils';

describe('flattenObject', () => {
  it('does not any change if the object is already flattened', () => {
    expect(
      flattenObject({
        foo: 'foo',
        bar: 'bar',
      }),
    ).toEqual({
      foo: 'foo',
      bar: 'bar',
    });
  });

  it('flatten the 2-layer object', () => {
    expect(
      flattenObject({
        foo: 'foo',
        bar: {
          baz: 'baz',
          qux: 'qux',
        },
      }),
    ).toEqual({
      foo: 'foo',
      baz: 'baz',
      qux: 'qux',
    });
  });

  it('flatten the 3-layer object', () => {
    expect(
      flattenObject({
        foo: 'foo',
        bar: {
          baz: {
            qux: 'qux',
          },
        },
      }),
    ).toEqual({
      foo: 'foo',
      qux: 'qux',
    });
  });
});

describe('flattenDictionary', () => {
  it('does not any change if the object is already flattened', () => {
    expect(
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
    ).toEqual({
      ko: {
        foo: 'foo',
        bar: 'bar',
      },
      en: {
        foo: 'foo',
        bar: 'bar',
      },
    });
  });

  it('flatten the 2-layer object', () => {
    expect(
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
    ).toEqual({
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
    });
  });

  it('flatten the 3-layer object', () => {
    expect(
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
    ).toEqual({
      ko: {
        foo: 'foo',
        baz: 'baz',
      },
      en: {
        qux: 'qux',
      },
    });
  });
});

describe('getDistanceBetweenDirectories', () => {
  it('returns 0 if two directories are the same', () => {
    expect(getDistanceBetweenDirectories('/', '/')).toBe(0);
    expect(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop',
        '/Users/user/Desktop',
      ),
    ).toBe(0);
  });

  it('returns depth of one directory if depth of the other directory is zero', () => {
    expect(getDistanceBetweenDirectories('/', '/Users/user/Desktop')).toBe(3);
    expect(getDistanceBetweenDirectories('', '/Users/user/Desktop')).toBe(3);
  });

  it('returns distance between two directories if one is included in the other', () => {
    expect(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project',
        '/Users/user/Desktop/',
      ),
    ).toBe(1);
    expect(getDistanceBetweenDirectories('/Users/user/Desktop', '/Users')).toBe(
      2,
    );
  });

  it('returns distance between two directories', () => {
    expect(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project',
        '/Users/user/Desktop/Data',
      ),
    ).toBe(2);
    expect(
      getDistanceBetweenDirectories(
        '/Users/user/Desktop/Project/i18n-Lens',
        '/Users/user/Desktop/Data',
      ),
    ).toBe(3);
  });
});
