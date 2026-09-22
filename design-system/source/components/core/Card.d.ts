import * as React from "react";
/**
 * The system's surface container: 16px radius, warm hairline, low warm shadow.
 * @startingPoint section="Core" subtitle="Surfaces in every tone" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "surface" | "sunk" | "tint" | "warm" | "brand" | "inverse";
  /** 0-3. Default 1. */
  elevation?: 0 | 1 | 2 | 3;
  padding?: string | number;
  radius?: string | number;
  /** Lifts 2px and deepens the shadow on hover. */
  interactive?: boolean;
}
export declare function Card(props: CardProps): JSX.Element;
