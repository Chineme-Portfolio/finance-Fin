import * as React from "react";
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  /** Renders a dismiss glyph when provided. */
  onRemove?: () => void;
}
export declare function Tag(props: TagProps): JSX.Element;
