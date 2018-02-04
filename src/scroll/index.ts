import createStyler from '../styler';
import { Styler } from '../styler/types';

const domScrollStyler = createStyler({
  useCache: false,
  onRead: (key, { element }) => {
    return (key === 'top') ? element.scrollTop : element.scrollLeft;
  },
  onRender: ({ top, left }, { element }) => {
    element.scrollLeft = left;
    element.scrollTop = top;
  }
});

const viewportScrollStyler = createStyler({
  useCache: false,
  onRead: (key) => {
    if (typeof window === 'undefined') return 0;
    return (key === 'top') ? window.pageYOffset : window.pageXOffset;
  },
  onRender: ({ top = 0, left = 0 }) => {
    if (typeof window !== 'undefined' && typeof top === 'number' && typeof left === 'number') {
      window.scrollTo(left, top);
    }
  }
});

export default (element?: HTMLElement): Styler => element
  ? domScrollStyler({ element })
  : viewportScrollStyler();
