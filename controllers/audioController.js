import fs from "node:fs";
import {
  allFilesByScroll,
  allFilesBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  requestedFile,
} from "../sql/sql.js";

const audioLibrary = async (req, res) => {
  if (!req.query.page) return;
  console.log(req.query.type);
  const offsetNum = Number(req.query.page * 50);

  let results;
  if (req.query.type === "files") {
    if (req.query.text !== "") {
      results = allFilesBySearchTerm(offsetNum, req.query.text);
    } else {
      results = allFilesByScroll(offsetNum);
    }
  } else if (req.query.type === "albums") {
    if (req.query.text !== "") {
      results = allAlbumsBySearchTerm(offsetNum, req.query.text);
    } else {
      results = allAlbumsByScroll(offsetNum);
    }
  }

  /* console.log(results); */
  res.status(200).send({ results });
};

const streamAudio = async (req, res) => {
  let track;

  track = requestedFile(req.params.trackId);
  const range = req.headers.range || "0";
  const audioSize = fs.statSync(track.audioFile).size;
  const chunkSize = 10 * 1e6; //  10MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, audioSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${audioSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "audio/mpeg",
  };

  const options = {
    headers,
  };

  res.writeHead(206, headers);

  const stream = fs.createReadStream(track.audioFile, {
    start,
    end,
  });
  stream.pipe(res);
};

export { streamAudio, audioLibrary };
