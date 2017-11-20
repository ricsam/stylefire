import { camelToDash } from '../styler/utils';

type StringMap = { [key: string]: string };

const camelCache: StringMap = {};
const dashCache: StringMap = {};
const prefixes: string[] = ['Webkit','Moz','O','ms', ''];
const numPrefixes = prefixes.length;

let testElement: HTMLElement;

/*
  Test style property for prefixed version

  @param [string]: Style property
  @return [string]: Cached property name
*/
const testPrefix = (key: string) => {
  testElement = testElement || document.createElement('div');

  for (let i = 0; i < numPrefixes; i++) {
    const prefix = prefixes[i];
    const noPrefix = (prefix === '');
    const prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);

    if (prefixedPropertyName in testElement.style) {
      camelCache[key] = prefixedPropertyName;
      dashCache[key] = `${(noPrefix ? '' : '-')}${camelToDash(prefixedPropertyName)}`;
    }
  }
};

export default (key: string, asDashCase: boolean = false) => {
  const cache = asDashCase ? dashCache : camelCache;

  if (!cache[key]) testPrefix(key);

  return cache[key];
};
