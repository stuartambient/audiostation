import express from "express";
import { Router } from "express";
import fs from "node:fs";
import cors from "cors";
import { parseFile } from "music-metadata";
import { streamAudio, audioLibrary } from "./controllers/audioController.js";
import initAlbums from "./controllers/albumsController.js";
import initFiles from "./controllers/filesController.js";

/* console.log(db); */
const app = express();
const port = 3008;

app.disable("etag");
app.use(cors());

app.get("/alltracks", audioLibrary);
app.get("/tracks/:trackId", streamAudio);
app.get("/update-albums", initAlbums);
app.get("/update-files", initFiles);

process.on("exit", () => {
  console.log("exiting.....");
  db.close();
});
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));

app.listen(port, () => {
  console.log(`App running on port ${3008}`);
});
