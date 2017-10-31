import css from './css';
import createStyler from './styler';
import { Styler } from './styler/types';
import svg from './svg';

export default function(node: (SVGGraphicsElement & SVGPathElement) | HTMLElement): Styler {
  return (node instanceof SVGGraphicsElement) ? svg(node) : css(node);
}

export { createStyler, Styler };
