import {
  ASSIGNMENT_TYPE_RANKING,
  ASSIGNMENT_TYPE_RATING
} from "./constants";

export interface GetFullScoresResponseData {
  submissions: Array<{id: number, name: string, trackIndex: number, location: number}>;
  judges: Array<{id: number, name: string, anchor: number}>;
  categories: Array<{id: number, name: string, trackIndex: number}>;
  prizes: Array<{id: number, name: string, eligibleSubmissions: Array<number>}>;
  tracks: Array<{id: number, name: string}>;
  assignments: Array<Assignment>;
}

export type Assignment = RatingAssignment | RankingAssignment;

export interface RatingAssignment {
  id: number,
  type: 1,
  judgeIndex: number,
  priority: number,
  active: boolean

  submissionIndex: number,
  noShow: boolean,
  rating: number,
  ratings: Array<number>
}

export interface RankingAssignment {
  id: number,
  type: number,
  judgeIndex: number,
  priority: number,
  active: boolean

  // For RatingAssignments
  submissionIndex?: number,
  noShow?: boolean,
  rating?: number,
  ratings?: Array<number>

  // For Ranking Assignments
  prizeIndex?: number,
  rankings?: Array<{
    submissionIndex: number,
    score:number
  }>
}

export function getPlaceholderFullScoresResponseData(): GetFullScoresResponseData {
  return {
    submissions: [],
    judges: [],
    categories: [],
    prizes: [],
    tracks: [],
    assignments: []
  };
}
