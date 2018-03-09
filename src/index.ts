import css from './css';
import buildStyles from './css/render';
import { Styler, Props } from './styler/types';
import svg from './svg';

const cache = new WeakMap<Element, Styler>();

const createStyler = (node: Element, props: Props) => {
  const styler = (node instanceof SVGElement) ? svg(node) : css(node as HTMLElement, props);
  cache.set(node, styler);
  return styler;
};

const getStyler = (node: Element, props: Props) => cache.has(node) ? cache.get(node) : createStyler(node, props);

export default function(nodeOrSelector: Element | string, props: Props): Styler {
  const node: Element = (typeof nodeOrSelector === 'string')
    ? document.querySelector(nodeOrSelector)
    : nodeOrSelector;

  return getStyler(node, props);
}

export { createStyler, Styler, buildStyles };
