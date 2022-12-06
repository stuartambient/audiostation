import fs from "node:fs";
import { EventEmitter } from "node:events";
import { v4 as uuidv4 } from "uuid";
import { roots } from "../constant/constants.js";
import { insertAlbums, deleteAlbums, getAlbums } from "../sql/sql.js";
const [...newroots] = roots;
const emitter = new EventEmitter();

const parseNewEntries = (newEntries, insCb) => {
  const albumsArr = [];

  for (const entry of newEntries) {
    const _id = uuidv4();
    let name, root, fullpath;

    for (const r of newroots) {
      if (entry.startsWith(r)) {
        const newStr = entry.replace(`${r}/`, "");
        root = r;
        name = newStr;
      }
      const _id = uuidv4();
      fullpath = entry;
    }
    albumsArr.push({ _id, root, name, fullpath });
  }

  insertAlbums(albumsArr, insCb);
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const checkAgainstEntries = (data, cb) => {
  /* const ce = dbEntries.all(); */
  const dbAlbums = getAlbums();
  const dbAlbumsFullpath = dbAlbums.map(album => album.fullpath);

  const allAlbums = new Set(data);
  const dbEntries = new Set(dbAlbumsFullpath);

  const newEntries = Array.from(difference(allAlbums, dbEntries));
  const missingEntries = Array.from(difference(dbEntries, allAlbums));

  if (newEntries.length > 0) {
    parseNewEntries(newEntries, insCb => cb(insCb));
  }
  if (missingEntries.length > 0) {
    deleteAlbums(missingEntries, x => cb(x));
  } else if (!newEntries.length && !missingEntries.length) {
    cb(["no changes"]);
  }
};

const runAlbums = (roots, all = [], cb) => {
  if (!roots.length) return checkAgainstEntries(all, cb);
  const root = roots.shift();
  const dirs = fs.readdirSync(root).map(r => `${root}/${r}`);
  all.push(...dirs);
  runAlbums(roots, all, cb);
};

const initAlbums = async (req, res) => {
  const [...newroots] = roots;
  const final = [];
  const results = x => x.forEach(y => final.push(y));
  runAlbums(newroots, [], results);
  setImmediate(() => res.send(final));
};

export default initAlbums;
