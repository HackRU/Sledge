import React from "react";

import {VisualizeRatingsPage} from "../components/VisualizeRatingsPage";

import {Socket} from "../Socket";
import {GetRatingScoresRequestResponseData} from "../../shared/GetRatingScoresRequestTypes";
import {VisualizeRatingsPageProps} from "../components/VisualizeRatingsPage";

export class VisualizeRatingsApp extends React.Component<any, VisualizeRatingsAppState> {
  socket: Socket;

  constructor(props) {
    super(props);

    this.state = {
      lastUpdateTimestamp: 0,
      lastResponse: {
        submissions: [],
        judges: [],
        scores: []
      }
    };

    this.socket = new Socket();

    this.loadVisualization();
  }

  loadVisualization() {
    this.socket.sendRequest({
      requestName: "REQUEST_GET_RATING_SCORES"
    }).then((response: GetRatingScoresRequestResponseData) => {
      this.setState({
        lastUpdateTimestamp: Date.now(),
        lastResponse: response
      });
    });
  }

  getPageProps(): VisualizeRatingsPageProps {
    return {
      response: this.state.lastResponse,
      timestamp: this.state.lastUpdateTimestamp,

      onReload: () => this.loadVisualization()
    };
  }

  render() {
    return React.createElement(
      VisualizeRatingsPage,
      this.getPageProps()
    );
  }
}

interface VisualizeRatingsAppState {
  lastUpdateTimestamp: number;
  lastResponse: GetRatingScoresRequestResponseData;
}
