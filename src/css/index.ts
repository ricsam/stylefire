import createStyler from '../styler';
import { Styler } from '../styler/types';
import prefixer from './prefixer';
import buildStyles, { aliasMap } from './render';
import { isTransformProp } from './transform-props';
import getValueType from './value-types';

type Props = {
  enableHardwareAcceleration?: boolean,
  preparseOutput?: boolean
};

const cssStyler = createStyler({
  onRead: (key, { element, preparseOutput }) => {
    const valueType = getValueType(key);

    if (isTransformProp(key)) {
      return (valueType)
        ? valueType.default || 0
        : 0;
    } else {
      const domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer(key, true)) || 0;
      return (preparseOutput && valueType && valueType.parse) ? valueType.parse(domValue) : domValue;
    }
  },
  onRender: (state, { element, enableHardwareAcceleration }, changedValues) => {
    element.style.cssText += buildStyles(state, changedValues, enableHardwareAcceleration);
  },
  aliasMap
});

export default (element: HTMLElement, props?: Props): Styler => {
  return cssStyler({
    element,
    enableHardwareAcceleration: true,
    preparseOutput: true,
    ...props
  });
};
