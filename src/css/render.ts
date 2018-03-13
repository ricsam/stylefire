import { isTransformProp, sortTransformProps } from './transform-props';
import prefixer from './prefixer';
import getValueType from './value-types';
import { State } from '../styler/types';

export type AliasMap = { [key: string]: string };

export const aliasMap: AliasMap = {
  x: 'translateX',
  y: 'translateY',
  z: 'translateZ',
  originX: 'transformOriginX',
  originY: 'transformOriginY'
};

export default function buildStylePropertyString(
  state: State,
  changedValues: string[] | true = true,
  enableHardwareAcceleration: boolean = true
 ) {
  const valuesToChange = (changedValues === true) ? Object.keys(state) : changedValues;
  let propertyString = '';
  let transformString = '';
  let hasTransform = false;
  let transformHasZ = false;

  // First check if there are any changed transform values
  // and if true add all transform values
  const numChangedValues = valuesToChange.length;
  for (let i = 0; i < numChangedValues; i++) {
    const key = valuesToChange[i];

    // If this is a transform property, add all other transform props
    // to changedValues and then break
    if (isTransformProp(key)) {
      hasTransform = true;

      for (const stateKey in state) {
        if (isTransformProp(stateKey) && valuesToChange.indexOf(stateKey) === -1) {
          valuesToChange.push(stateKey);
        }
      }

      break;
    }
  }

  valuesToChange.sort(sortTransformProps);

  // Now run through each property, and decide which is a plain style props,
  // a transform property and CSS vars and handle accordingly
  const totalNumChangedValues = valuesToChange.length;
  for (let i = 0; i < totalNumChangedValues; i++) {
    const key = valuesToChange[i];
    let value: any = state[key];

    // If this is a number or object and we have filter, apply filter
    const valueType = getValueType(key);
    if (valueType && (typeof value === 'number' || typeof value === 'object') && valueType.transform) {
      value = valueType.transform(value);
    }

    // If a transform prop, add to transform string
    if (isTransformProp(key)) {
      transformString += key + '(' + value + ') ';
      transformHasZ = (key === 'translateZ') ? true : transformHasZ;

    // Or if a simple CSS property, set
    } else {
      propertyString += ';' + prefixer(key, true) + ':' + value;
    }
  }

  // If we have transform props, build a transform string
  if (hasTransform) {
    if (!transformHasZ && enableHardwareAcceleration) {
      transformString += 'translateZ(0)';
    }

    propertyString += ';' + prefixer('transform', true) + ':' + transformString;
  }

  return propertyString;
}
