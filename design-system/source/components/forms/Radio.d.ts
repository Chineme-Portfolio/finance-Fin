import * as React from "react";
export interface RadioProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange"> {
  label: React.ReactNode;
  description?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  /** Card-style option: 16px radius, clay tint when selected. Used in onboarding. */
  boxed?: boolean;
}
export declare function Radio(props: RadioProps): JSX.Element;
