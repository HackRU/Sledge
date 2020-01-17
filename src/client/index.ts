import { Router } from "./Router";

// Import styles
import "./global.scss";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap-grid.css";
import "billboard.js/dist/billboard.css"

window.addEventListener("load", function () {
  let global = window as any;

  const router = new Router();
  router.start();

  global.router = router;
});
