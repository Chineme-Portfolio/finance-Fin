import * as React from "react";
/**
 * A message from Fin: avatar left, white bubble with one squared corner.
 * @startingPoint section="Chat" subtitle="Fin's message bubble" viewport="700x200"
 */
export interface BuddyMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders three pulsing dots instead of content. */
  typing?: boolean;
  /** Hide the avatar on consecutive messages from Fin. */
  showAvatar?: boolean;
  /** Actions or a chart slotted under a rule inside the bubble. */
  footer?: React.ReactNode;
}
export declare function BuddyMessage(props: BuddyMessageProps): JSX.Element;
