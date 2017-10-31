import { onFrameRender } from 'framesync';
import { ChangedValues, Config, Props, State } from './types';

const createStyler = ({ onRead, onRender, aliasMap = {}, useCache = true }: Config) => (props?: Props) => {
  const state: State = {};
  const changedValues: ChangedValues = [];
  let hasChanged: boolean = false;

  const setValue = (unmappedKey: string, value: any) => {
    const key = aliasMap[unmappedKey] || unmappedKey;
    const currentValue = state[key];
    state[key] = value;
    if (state[key] !== currentValue) {
      hasChanged = true;
      changedValues.push(key);
    }
  };

  const render = () => {
    onRender(state, props, changedValues);
    hasChanged = false;
    changedValues.length = 0;
  };

  return {
    get(unmappedKey: string) {
      const key = aliasMap[unmappedKey] || unmappedKey;

      return (key)
        ? (useCache && state[key] !== undefined)
          ? state[key]
          : onRead(key, props)
        : state;
    },
    set(values: string | State, value?: any) {
      if (typeof values === "string") {
        if (value !== undefined) {
          setValue(values, value);
        } else {
          return (v: any) => {
            setValue(values, v);
            if (hasChanged) onFrameRender(render);
          }
        }
      } else {
        for (const key in values) {
          if (values.hasOwnProperty(key)) {
            setValue(key, values[key]);
          }
        }
      }

      if (hasChanged) onFrameRender(render);

      return this;
    },
    render(forceRender = false) {
      if (forceRender || hasChanged) render();

      return this;
    },
  };
};

export default createStyler;
