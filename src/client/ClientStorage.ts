/**
 * Sledge - A judging system for Hackathons
 * Copyright (C) 2019 The Sledge Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Checks local storage for the id of the currently logged in Judge. If there's
 * a valid judge id, returns it. Otherwise returns 0.
 */
export function getLoggedInJudgeId(): number {
  const storedJudgeId = parseInt(localStorage["judgeId"]);
  if (!Number.isInteger(storedJudgeId) || storedJudgeId < 0) {
    return 0;
  } else {
    return storedJudgeId;
  }
}

/**
 * Sets the given judge id as the currently logged in judge in localstorage
 */
export function setLoggedInJudgeId(judgeId: number) {
  localStorage["judgeId"] = judgeId.toString();
}
