import * as React from "react";
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: string[];
  active?: string;
  onSelect?: (item: string) => void;
}
export declare function Tabs(props: TabsProps): JSX.Element;
