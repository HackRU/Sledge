import { Database } from "./Database";
import { ASSIGNMENT_TYPE_RATING } from "../shared/constants";
import { log } from "./log";
import { createIdMap } from "../shared/util";

export class OnTheFlyAssigner {
  constructor(private db: Database) {}

  createAssignment(judgeId: number): number {
    let plausibleIds = this.getPlausibleSubmissionIds(judgeId);
    if (plausibleIds.length < 1) {
      log("OnTheFlyAssigner: No Plausible Ids!");
      return -1;
    }

    let lastLocation = this.getLastLocation(judgeId);
    let submissions = this.getSubmissions();
    let submissionsById = createIdMap(submissions);

    log(" == OnTheFlyAssigner createAssignment ==");
    log(`Plausible ids: ${plausibleIds.join(", ")}`);
    log(`Last location: ${lastLocation}`);


    // Create array of plausible submissions and their current scores. Each
    // plausible submission starts with with a random score which will be
    // the tie breaker.
    let submissionScores: Array<{id: number, score: number}> = [];
    for (let id of plausibleIds) {
      submissionScores.push({
        id,
        score: Math.random() / 1000
      });
    }

    // If the judge has a last location, take into account forward distances
    if (lastLocation > 0) {
      let distances = calculateForwardDistancesFrom(submissions, lastLocation);
      for (let ss of submissionScores) {
        let dist = distances.get(ss.id);
        if (dist === 1) {
          ss.score += 1.5;
        } else if (dist === 2) {
          ss.score += 1.4;
        } else if (dist === 3) {
          ss.score += 1.3;
        }
      }
    }

    // Give a large priority to submissions with less than 2 ratings
    for (let ss of submissionScores) {
      if (this.getSubmissionRatings(ss.id) < 2) {
        ss.score += 10;
      }
    }

    // Sort the scores and return the top one, and use randomness to settle ties
    let topSubScores = submissionScores.sort(
      (a, b) => Math.sign(b.score - a.score)
    );
    let bestSubmissionId = topSubScores[0].id;

    // Log top 5 highest rated
    for (let i=0;i<3&&i<topSubScores.length;i++) {
      let sub = submissionsById.get(topSubScores[i].id)!;
      log(
        `topSubscores[${i}] = ${sub.name} `+
          `(loc: ${sub.location}) SCORE: ${topSubScores[i].score}`
      );
    }

    // Create the Assignment
    const priority = this.getNextAssignmentPriority(judgeId);
    const newAssignmentId = this.db.run(
      "INSERT INTO Assignment(judgeId, priority, type, active) "+
        "VALUES(?, ?, ?, 1);",
      [judgeId, priority, ASSIGNMENT_TYPE_RATING]
    );
    this.db.run(
      "INSERT INTO RatingAssignment(assignmentId, submissionId) "+
        "VALUES(?, ?);",
      [newAssignmentId, bestSubmissionId]
    );

    log(`New assignment created with id ${newAssignmentId}`);
    log(` --------------`)

    return newAssignmentId;
  }

  /**
   * Gets the last location a judge visited by their completed assignments. If one
   * doesn't exist, use their anchor. Otherwise, returns -1.
   */
  getLastLocation(judgeId: number): number {
    const lastSubmission = this.db.get<{
      location: number
    }|null>(
      "SELECT Submission.location AS location "+
        "FROM RatingAssignment "+
        "LEFT JOIN Assignment ON RatingAssignment.assignmentId = Assignment.id "+
        "LEFT JOIN Submission ON RatingAssignment.submissionId = Submission.id "+
        "WHERE Assignment.judgeId=? AND Assignment.active=0 "+
        "ORDER BY priority DESC;",
      judgeId
    );

    if (lastSubmission) {
      return lastSubmission.location;
    } else {
      const judge = this.db.get<{
        anchor?: number
      }>(
        "SELECT anchor FROM Judge WHERE id=?;",
        judgeId
      );

      if (typeof judge.anchor === "number") {
        return judge.anchor;
      } else {
        return -1;
      }
    }
  }

  getSeenSubmissionIds(judgeId: number): Set<number> {
    const submissions = this.db.all<{
      id: number
    }>(
      "SELECT RatingAssignment.submissionId AS id "+
        "FROM RatingAssignment "+
        "LEFT JOIN Assignment ON RatingAssignment.assignmentId = Assignment.id "+
        "WHERE Assignment.judgeId = ?;",
      judgeId
    );

    return new Set(submissions.map(sub => sub.id));
  }

  getPlausibleSubmissionIds(judgeId: number): number[] {
    // We're willing to assign submissions that are not seen and active
    const submissions = this.db.all<{
      id: number
    }>(
      "SELECT id FROM Submission WHERE active=1;",
      []
    );

    let set = new Set(submissions.map(sub => sub.id));
    let seen = this.getSeenSubmissionIds(judgeId);
    for (let id of seen) {
      set.delete(id);
    }

    return Array.from(set.values());
  }

  getSubmissions(): Submission[] {
    let submissions = this.db.all<Submission>(
      "SELECT id, name, trackId, location, active FROM Submission;",
      []
    );

    return submissions;
  }

  getSubmissionRatings(submissionId: number): number {
    let query = this.db.get<{
      count: number
    }>(
      "SELECT COUNT(RatingAssignment.id) AS count "+
        "FROM RatingAssignment "+
        "LEFT JOIN Assignment ON Assignment.id=assignmentId "+
        "WHERE submissionId=? AND active=0;",
      submissionId
    );

    return query.count;
  }

  getNextAssignmentPriority(judgeId: number): number {
    const highestPriorityAssignment = this.db.get<{
      priority: number
    }|null>(
      "SELECT priority FROM Assignment "+
        "WHERE judgeId=? "+
        "ORDER BY priority DESC;",
      judgeId
    );

    if (highestPriorityAssignment) {
      return highestPriorityAssignment.priority + 1;
    } else {
      return 1;
    }
  }
}

/**
 * The forward location distance is defined as the number of submissions you
 * would pass walking forward from a given location, while wrapping around to
 * location 1 after reaching the highest submission.
 *
 * We discourage submissions from having the same location, but this method
 * intentionally supports it.
 */
function calculateForwardDistancesFrom(
  allSubmissions: Submission[],
  location: number
): Map<number, number> {
  // Create the map and handle the trvial case
  let map = new Map<number, number>();
  if (allSubmissions.length <= 0) {
    return map;
  }

  // Our strategy is to walk the submissions, sorted by location starting with
  // the first submission of the given location
  const subsByLoc = allSubmissions.sort(
    (a, b) => Math.sign(a.location - b.location)
  );

  // Find the startIndex, or the first index with the given location.
  let start = 0;
  while (
    start < subsByLoc.length &&
    subsByLoc[start].location < location
  ) {
    start++;
  }
  start = start % subsByLoc.length;

  // Walk through the list and return the map
  let dist = 0;
  let lastLoc = location;
  for (let i=0;i<subsByLoc.length;i++) {
    let pos = (start + i) % subsByLoc.length;
    if (subsByLoc[pos].location !== lastLoc) {
      dist++;
    }

    map.set(subsByLoc[pos].id, dist);
  }
  return map;
}

interface Submission {
  id: number;
  name: string;
  trackId: number;
  location: number;
  active: number;
}
