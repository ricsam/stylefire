# Stylefire

### Style-setters for CSS, SVG and scroll, optimized for animation.

[![npm version](https://img.shields.io/npm/v/stylefire.svg?style=flat-square)](https://www.npmjs.com/package/stylefire)
[![npm downloads](https://img.shields.io/npm/dm/stylefire.svg?style=flat-square)](https://www.npmjs.com/package/stylefire)
[![Twitter Follow](https://img.shields.io/twitter/follow/espadrine.svg?style=social&label=Follow)](http://twitter.com/popmotionjs)

- **Tiny:** 4kb max, and all stylers can be imported separately.
- **Fast:** Optimized for use with animation libraries, Stylefire batches rendering once per frame (this can be selectively overridden).
- **Simple transforms:** Replaces the [confusing SVG `transform` model](https://css-tricks.com/transforms-on-svg-elements/) with the simpler CSS model.
- **Line drawing:** Full support for SVG path line drawing, simplified to use percentage-based measurements.
- **Cross-browser:** Detects and uses vendor CSS prefixes when necessary.
- **Extendable:** Easy to create performant stylers for other rendering targets.
- **Type-safe:** Written in TypeScript, with Flow definitions available from [flow-typed](https://github.com/flowtype/flow-typed). 'Cause animators love typesafety :)

## Install

```bash
npm install stylefire --save
```

## [Documentation](https://popmotion.io/api/stylefire)
- [CSS](https://popmotion.io/api/css)
- [SVG](https://popmotion.io/api/svg)
- [DOM Scroll](https://popmotion.io/api/dom-scroll)

## Examples

### Setting CSS properties

```javascript
import css from 'stylefire/css';

const div = document.querySelector('div');
const divStyler = css(div);

divStyler.set({
  x: 100,
  y: 100,
  background: '#f00'
});
```

**[Demo on CodePen](https://codepen.io/popmotion/pen/PJKrQo)**

### Line drawing

```javascript
import { tween } from 'popmotion';
import svg from 'stylefire/svg';

const path = document.querySelector('path');
const pathStyler = svg(path);

tween({ to: 100 })
  .start((v) => path.set('pathLength', v));
```

**[Demo on CodePen](https://codepen.io/popmotion/pen/JryxRb)**

### Overriding render batching

```javascript
import css from 'stylefire/css';

const div = document.querySelector('div');
const divStyler = css(div);

divStyler
  .set({ width: 500 })
  .render();

console.log(div.offsetWidth); // 500

divStyler.set({ width: 100 });

console.log(div.offsetWidth); // 500

divStyler.render();

console.log(div.offsetWidth); // 100
```

**[Demo on CodePen](https://codepen.io/popmotion/pen/pWrGym)**

## Supported by
<img src="https://user-images.githubusercontent.com/7850794/31086561-107648a4-a792-11e7-88bf-a0c0cfcafb79.png" width="300" alt="DriveTribe Open Source">
