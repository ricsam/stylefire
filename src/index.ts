import css from './css';
import buildStyles from './css/render';
import svg from './svg';
import createStyler from './styler';
import { Styler, Props } from './styler/types';

const cache = new WeakMap<Element, Styler>();

const createDOMStyler = (node: Element, props: Props) => {
  const styler =
    node instanceof SVGElement ? svg(node) : css(node as HTMLElement, props);
  cache.set(node, styler);
  return styler;
};

const getStyler = (node: Element, props: Props) =>
  cache.has(node) ? cache.get(node) : createDOMStyler(node, props);

export default function(
  nodeOrSelector: Element | string,
  props: Props
): Styler {
  const node: Element =
    typeof nodeOrSelector === 'string'
      ? document.querySelector(nodeOrSelector)
      : nodeOrSelector;

  return getStyler(node, props);
}

export { createStyler, Styler, buildStyles };
