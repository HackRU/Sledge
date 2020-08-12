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
    });
  }

  render() {
    return (
      <Container id="OverallRatingsPage">
        <h1>{`Overall Ratings`}</h1>
        {this.state.status === "READY" && (
          <OverallRatingsBarChart
            data={getAvgOverall(this.state.response!)}
          />
        )}
        {this.state.status === "READY" && (
          <OverallRatingsTable
            data={getAvgOverall(this.state.response!)}
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

const OverallRatingsBarChart = (props: OverallRatingsBarChartProps) => (
  <BarChart width={1000} height={500} data={props.data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip/>
    <Legend />
    <Bar dataKey="average" />
  </BarChart>
);

const OverallRatingsTable = (props: OverallRatingsBarChartProps) => (
  <table>
    <thead>
      <tr>
        <th>Location</th>
        <th>Score</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
    {props.data.map(s => (
      <tr>
        <td>{s.location}</td>
        <td>{s.average}</td>
        <td>{s.name}</td>
      </tr>
    ))}
    </tbody>
  </table>
);

interface OverallRatingsBarChartProps {
  data: BarData
}

function getAvgOverall(data: GetFullScoresResponseData): BarData {
  // Initialize the sum and count to 0 for each submission
  let sumCount = data.submissions.map(_s => ({
    sum: 0,
    count: 0
  }));

  // Considering only inactive rating assignments, add up the total
  // and sum of ratings
  for (let asm of data.assignments) {
    if (asm.type === ASSIGNMENT_TYPE_RATING && !asm.active) {
      sumCount[asm.submissionIndex!].sum += asm.rating!;
      sumCount[asm.submissionIndex!].count++;
    }
  }

  // Return the name of each submission with the calculated average, or slightly
  // negative if unrated
  return sumCount.map((sc, i) => ({
    name: data.submissions[i].name,
    average: sc.count > 0 ? sc.sum / sc.count : -.01,
    location: data.submissions[i].location,
    index: i
  })).sort((a,b) => {
    return data.submissions[a.index].location - data.submissions[b.index].location
  });
}

interface BarData extends Array<{
  name: string,
  average: number,
  location: number
}> {}
