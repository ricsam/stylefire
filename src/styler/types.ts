export type State = { [key: string]: string | number };
export type Props = { [key: string]: any };
export type ChangedValues = string[];

export type Config = {
  onRead: (key: string, props: Props) => any,
  onRender: (state: State, props: Props, changedValues: ChangedValues) => void,
  aliasMap?: { [key: string]: string },
  useCache?: boolean
};

export type Setter = (value: any) => any;

export type CreateSetter = (key: string) => Setter;
export type SetMap = (values: State) => Styler;
export type SetValue = (key: string, value: any) => Styler;

export type Styler = {
  get: (key: string) => any;
  set: CreateSetter | SetMap | SetValue;
  render: (forceRender?: boolean) => Styler;
};
