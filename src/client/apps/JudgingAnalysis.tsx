import React from "react";
import {Container} from "reactstrap";
import {GetFullScoresResponseData} from "../../shared/GetFullScoresRequestTypes";
import {getSocket, Socket} from "../Socket";
import {Application, ApplicationProps} from "../Application";
import {ASSIGNMENT_TYPE_RATING} from "../../shared/constants";
import {Bar, BarChart, CartesianAxis, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from "recharts";

export class JudgingAnalysis extends Application<JudgingAnalysisState> {
  socket: Socket;

  constructor(props: ApplicationProps) {
    super(props);

    this.state = {
      status: "LOADING"
    };

    this.socket = getSocket();
  }

  ready() {
    this.socket.sendRequest({
      requestName: "REQUEST_GET_FULL_SCORES"
    }).then((res: GetFullScoresResponseData) => {
      this.setState({
        status: "READY",
        response: res
      });
      console.log(res);
    });
  }

  render() {
    return (
      <Container id="OverallRatingsPage">
        <h1>{`Hacks Judged per Judge`}</h1>
        {this.state.status === "READY" && (
          <JudgingAnalyticsBarChart
            data={getHacksPerJudge(this.state.response!)}
          />
        )}
        {this.state.status === "READY" && (
          <OverallRatingsTable
            data={getHacksPerJudge(this.state.response!)}
          />
        )}
        {this.state.status === "LOADING" && (
          <div>
            <p>Loading...</p>
          </div>
        )}
      </Container>
    );
  }
}

interface JudgingAnalysisState {
  status: "LOADING" | "READY";
  response?: GetFullScoresResponseData;
}

const JudgingAnalyticsBarChart = (props: JudgingAnalyticsBarChartProps) => (
  <BarChart width={1000} height={500} data={props.data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="Judge" />
    <YAxis />
    <Tooltip/>
    <Legend />
    <Bar dataKey="Hacks Judged" />
  </BarChart>
);

const OverallRatingsTable = (props: JudgingAnalyticsBarChartProps) => (
  <table>
    <thead>
      <tr>
        <th>Judge</th>
        <th>Hacks Judged</th>
      </tr>
    </thead>
    <tbody>
    {props.data.map(s => (
      <tr>
        <td>{s.judge}</td>
        <td>{s.hacksjudged}</td>
      </tr>
    ))}
    </tbody>
  </table>
);

interface JudgingAnalyticsBarChartProps {
  data: BarData
}

function getHacksPerJudge(data: GetFullScoresResponseData): BarData {

}

interface BarData extends Array<{
  judge: string,
  hacksjudged: number
}> {}
