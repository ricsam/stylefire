import css from './css';
import createStyler from './styler';
import { Styler } from './styler/types';
import svg from './svg';

export default function(nodeOrSelector: Element | string): Styler {
  const node: Element = (typeof nodeOrSelector === 'string')
    ? document.querySelector(nodeOrSelector)
    : nodeOrSelector;

  return (node instanceof SVGGraphicsElement) ? svg(node) : css(node as HTMLElement);
}

export { createStyler, Styler };
