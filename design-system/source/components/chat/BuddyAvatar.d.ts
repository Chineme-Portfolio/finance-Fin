import * as React from "react";
/** Fin's stand-in: a serif "F" in a clay circle. There is no illustrated character — this is the whole persona mark. */
export interface BuddyAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  tone?: "clay" | "ink" | "apricot";
}
export declare function BuddyAvatar(props: BuddyAvatarProps): JSX.Element;
