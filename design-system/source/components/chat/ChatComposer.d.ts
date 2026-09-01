import * as React from "react";
export interface ChatComposerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  placeholder?: string;
  /** Suggested questions shown as pills above the field. */
  suggestions?: string[];
  value?: string;
  onChange?: (next: string) => void;
  onSend?: (text: string) => void;
  onSuggestion?: (text: string) => void;
}
export declare function ChatComposer(props: ChatComposerProps): JSX.Element;
