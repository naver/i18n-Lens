import type { Dictionary } from './types';

export function flattenObject(parentObject: object) {
  let object: object = parentObject;
  while (Object.values(object).some((value) => typeof value === 'object')) {
    object = Object.entries(object).reduce((obj: any, [key, subObject]) => {
      if (typeof subObject === 'object') {
        return { ...obj, ...subObject };
      }
      return { ...obj, [key]: subObject };
    }, {});
  }
  return object;
}

export function flattenDictionary(dictionary: Dictionary) {
  return Object.entries(dictionary).reduce(
    (flattenedDictionary, [locale, subDictionary]) => {
      return {
        ...flattenedDictionary,
        [locale]: flattenObject(subDictionary as object),
      };
    },
    {},
  );
}

export function getDistanceBetweenDirectories(
  uriPathLeft: string,
  uriPathRight: string,
) {
  const routeStackLeft = uriPathLeft.split('/').filter((route) => route);
  const routeStackRight = uriPathRight.split('/').filter((route) => route);
  while (
    routeStackLeft[0] &&
    routeStackRight[0] &&
    routeStackLeft[0] === routeStackRight[0]
  ) {
    routeStackLeft.shift();
    routeStackRight.shift();
  }
  return routeStackLeft.length + routeStackRight.length;
}
