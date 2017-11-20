import createStyler from '../styler';
import { Styler } from '../styler/types';
import prefixer from './prefixer';
import render from './render';
import { isTransformProp } from './transform-props';
import getValueType from './value-types';

type Props = {
  enableHardwareAcceleration?: boolean
};

const cssStyler = createStyler({
  onRead: (key, { element }) => {
    const valueType = getValueType(key);

    if (isTransformProp(key)) {
      return (valueType)
        ? valueType.default || 0
        : 0;
    } else {
      const domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer(key)) || 0;
      return (valueType && valueType.parse) ? valueType.parse(domValue) : domValue;
    }
  },
  onRender: (state, { element, enableHardwareAcceleration }, changedValues) => {
    render(element, state, changedValues, enableHardwareAcceleration);
  },
  aliasMap: {
    x: 'translateX',
    y: 'translateY',
    z: 'translateZ',
    originX: 'transform-origin-x',
    originY: 'transform-origin-y'
  }
});

export default (element: HTMLElement, props?: Props): Styler => {
  return cssStyler({
    element,
    enableHardwareAcceleration: true,
    ...props
  });
};
