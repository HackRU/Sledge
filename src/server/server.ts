import express  from "express";
import http     from "http";
import path     from "path";

import * as persistence from "./persistence";
import * as socket      from "./socket";

let port = 8080;

let publicdir = path.resolve(__dirname, "../../public");
let datadir = path.resolve(process.cwd(), "data");


export function start() {
    console.log("Public Directory: %s", publicdir);
    console.log("Data Directory: %s", datadir);

    let db = new persistence.DatabaseConnection(datadir);
    let app = express();
    let server = new http.Server(app);
    let sockcomm = new socket.SocketCommunication(server, db);

    app.use(express.static(publicdir));

    server.listen(port);
    console.log(`Running at http://localhost:${port}`);
}
