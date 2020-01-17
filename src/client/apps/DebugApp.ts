import React from "react";

import {
  Container,
  Input,
  ButtonGroup,
  Button
} from "reactstrap";

import {catchOnly} from "../../shared/util";

import {Socket} from "../Socket";
import { DebugPage, DebugPageProps } from "../components/DebugPage";

export class DebugApp extends React.Component<any,any> {
  socket: Socket;
  templates: Map<string, string>;

  constructor(props: any) {
    super(props);

    this.socket = new Socket();
    (window as any).socket = this.socket;

    this.state = {
      templatesReady: false
    };

    this.loadTemplates();

    this.templates = new Map([
      ["status", "{\"requestName\": \"REQUEST_GLOBAL_STATUS\"}"],
      ["beginJudging", "{\"requestName\": \"REQUEST_BEGIN_JUDGING\"}"]
    ]);
  }

  loadTemplates() {
    let that = this;
    const xhr = new XMLHttpRequest();
    const outsideThis = this;
    xhr.addEventListener("load", function () {
      const templateData = JSON.parse(this.responseText);
      const keys = Object.keys(templateData);
      for (let key of keys) {
        if (!outsideThis.templates.has(key)) {
          outsideThis.templates.set(key, JSON.stringify(templateData[key]))
        }
      }
      that.setState({templatesReady: true});
    });
    xhr.open("GET", "/templates.json");
    xhr.send();
  }

  getPageProps(): DebugPageProps {
    return {
      templatesReady: this.state.templatesReady,
      templates: this.templates
    };
  }

  render() {
    return React.createElement(
      DebugPage,
      this.getPageProps()
    );
  }
}
