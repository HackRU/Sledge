import {BadRouteApp} from "./apps/BadRouteApp";
import {DebugApp} from "./apps/DebugApp";
import {PopulateApp} from "./apps/PopulateApp";
import {DevpostApp} from "./apps/DevpostApp";
import {LoginApp} from "./apps/LoginApp";
import {JudgeApp} from "./apps/JudgeApp";
import {VisualizeRatingsApp} from "./apps/VisualizeRatingsApp";
import {ControlPanelApp} from "./apps/ControlPanelApp";
import {VisualizePrizesApp} from "./apps/VisualizePrizesApp";
import {SubmissionManagementApp} from "./apps/SubmissionManagementApp";
import {HomeApp} from "./apps/HomeApp";
import { AnalyzeApp } from "./apps/AnalyzeApp";

export interface ApplicationConstructor {
  new(props: {}): React.Component<{}, any>;
}

export interface PageListing {
  name: string;
  path: string;
  component: ApplicationConstructor;
};

export const pages: Array<PageListing> = [{
  name: "Socket Debugger",
  path: "debug",
  component: DebugApp
}, {
  name: "Populate",
  path: "populate",
  component: PopulateApp
}, {
  name: "Devpost Importer",
  path: "devpost",
  component: DevpostApp
}, {
  name: "Login",
  path: "login",
  component: LoginApp
}, {
  name: "Judge",
  path: "judge",
  component: JudgeApp
}, {
  name: "Visualize Ratings",
  path: "visualizeratings",
  component: VisualizeRatingsApp
}, {
  name: "Visualize Prizes",
  path: "visualizeprizes",
  component: VisualizePrizesApp
}, {
  name: "Control Panel",
  path: "controlpanel",
  component: ControlPanelApp
}, {
  name: "Submission Management",
  path: "submissionmanagement",
  component: SubmissionManagementApp
}, {
  name: "Analyze Results",
  path: "analyze",
  component: AnalyzeApp
}];
