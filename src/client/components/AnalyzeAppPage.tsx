import React from "react";
import { Container } from "reactstrap";
import { GetFullScoresResponseData } from "../../shared/GetFullScoresRequestTypes";
import BillboardChart from "react-billboardjs";

export const AnalyzeAppPage = (props: AnalyzeAppPageProps) => (
  <Container id="AnalyzeAppPage">
    <h1>{`Analyze`}</h1>

    <BillboardChart
      data={{
        columns: [
          ["first", 1, 2, 3, 4, 5, 6],
          ["second", 5, 3.5, 2, .5, -1, -2.5]
        ],
        type: "bar"
      }}
    />
  </Container>
);

export interface AnalyzeAppPageProps {
  data?: GetFullScoresResponseData
}
