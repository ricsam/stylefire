import css from './css';
import { Styler } from './styler/types';
import svg from './svg';

const cache = new WeakMap<Element, Styler>();

const createStyler = (node: Element) => {
  const styler = (node instanceof SVGElement) ? svg(node) : css(node as HTMLElement);
  cache.set(node, styler);
  return styler;
};

const getStyler = (node: Element) => cache.has(node) ? cache.get(node) : createStyler(node);

export default function(nodeOrSelector: Element | string): Styler {
  const node: Element = (typeof nodeOrSelector === 'string')
    ? document.querySelector(nodeOrSelector)
    : nodeOrSelector;

  return getStyler(node);
}

export { createStyler, Styler };
