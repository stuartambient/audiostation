import fs from "node:fs";
import { allFilesByScroll, requestedFile } from "../sql/sql.js";

const audioLibrary = async (req, res) => {
  let query;
  if (req.query.text) {
    query = { $text: { $search: req.query.text } };
  } else {
    query = {};
  }

  const offsetNum = Number(req.query.page * 50);
  const results = allFilesByScroll(offsetNum);
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
