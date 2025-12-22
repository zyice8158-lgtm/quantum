export interface SelectProps {
  tag: string;
  modelValue: string;
  options?: OptionItem[];
  otherProps: object
}
export interface OptionItem {
  value: string
  iconPath: string,
  text: string,
  onClick: () => void
}