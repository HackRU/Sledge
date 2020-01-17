import { Component, CSSProperties } from "react";
import {Data} from "billboard.js";

export default class BillboardChart extends Component<BillboardChartProps, never> {
}

export interface BillboardChartProps {
  className?: string;
  style?: CSSProperties;
  isPure?: boolean;
  data: Data;
}
