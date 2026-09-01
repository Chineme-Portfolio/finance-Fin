import * as React from "react";
/** The brand's divider: a 2px bar with fully rounded caps. Replaces 1px borders between rows and sections. */
export interface RuleProps extends React.HTMLAttributes<HTMLHRElement> {
  tone?: "hairline" | "strong" | "brand";
  vertical?: boolean;
  /** Pull the rule in from both ends, in px. */
  inset?: number;
}
export declare function Rule(props: RuleProps): JSX.Element;
