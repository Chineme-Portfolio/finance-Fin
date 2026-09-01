import * as React from "react";
export interface SideNavItem { label: string; icon?: string; badge?: string | number }
export interface SideNavProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<string | SideNavItem>;
  active?: string;
  onSelect?: (label: string) => void;
  footer?: React.ReactNode;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
