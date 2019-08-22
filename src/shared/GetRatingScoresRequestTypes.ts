export interface GetRatingScoresRequestResponseData {
  submissions: Array<{
    id: number,
    name: string,
    location: number
  }>;
  judges: Array<{
    id: number,
    name: string,
    anchor: number
  }>;
  scores: Array<{
    submissionIndex: number,
    judgeIndex: number,
    active: boolean,
    rating: number
  }>;
}
