import React from "react";
import { AnalyzeAppPage, AnalyzeAppPageProps } from "../components/AnalyzeAppPage";

export class AnalyzeApp extends React.Component {
  constructor(props: any) {
    super(props);
  }

  getPageProps(): AnalyzeAppPageProps {
    return {
    };
  }

  render() {
    return React.createElement(
      AnalyzeAppPage,
      this.getPageProps()
    );
  }
}

interface AnalyzeAppState {
}
