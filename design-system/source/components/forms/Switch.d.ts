import * as React from "react";
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange"> {
  label: React.ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
