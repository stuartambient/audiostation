import Database from "better-sqlite3";
import { roots } from "../constant/constants.js";
const db = new Database(
  "C:/users/sambi/documents/nodeprojs/folder-function-test/db/audiofiles.db",
  { verbose: console.log }
);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = normal");
db.pragma("page_size = 32768");
db.pragma("mmap_size = 30000000000");
db.pragma("temp_store = memory");

const createTable = () => {
  const ct = db.prepare("CREATE TABLE IF NOT EXISTS mytable ( col1, col2)");
  const createtable = ct.run();
  db.close();
};

const createIndex = () => {
  const createIdx = db.prepare(
    "CREATE INDEX audiofile_idx ON files(audioFile)"
  );
  const idx = createIdx.run();
  db.close();
};

const updateRoot = () => {
  console.log(roots);
  const rootsql = db.prepare(
    `UPDATE files SET root = ? WHERE audioFile LIKE ?`
  );
  /*   const info = rootsql.run("F:/Music/", "%F:/Music/%"); */
  const updateMany = db.transaction(roots => {
    for (const r of roots) rootsql.run(`${r}`, `%${r}%`);
  });

  updateMany(roots);
  db.close();
};

/* updateRoot(); */

/* db.backup(`audiofiles-bu.db`)
  .then(() => {
    console.log("backup complete!");
  })
  .catch(err => {
    console.log("backup failed:", err);
  }); */

const insertFiles = (files, emitter) => {
  const insert = db.prepare(
    "INSERT INTO files VALUES (@afid, null, @audioFile, @modified, @extension, @year, @title, @artist, @album, @genre, @picture, @lossless, @bitrate, @sampleRate, 0)"
  );

  const insertMany = db.transaction(files => {
    console.log(this);
    for (const f of files) insert.run(f);
  });

  const info = insertMany(files);
  emitter.emit("insert-files-completed", files);
  /* db.close(); */
};

const deleteFiles = (files, emitter) => {
  const deleteFile = db.prepare("DELETE FROM files WHERE audioFile = ?");

  const deleteMany = db.transaction(files => {
    console.log(this);
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);

  emitter.emit("delete-files-completed", files);
};

const insertAlbums = (data, cb) => {
  const insert = db.prepare(
    "INSERT INTO albums(_id, rootloc, foldername, fullpath) VALUES (@_id, @root, @name, @fullpath)"
  );

  const insertMany = db.transaction(albums => {
    for (const a of albums) insert.run(a);
  });

  insertMany(data);
  cb(data);
};

const deleteAlbums = async (data, cb) => {
  const deleteA = db.prepare("DELETE FROM albums WHERE fullpath = ?");
  const deleteMany = db.transaction(data => {
    for (const d of data) deleteA.run(d);
  });
  deleteMany(data);

  cb(data);
};

const getAlbums = () => {
  const getAllAlbums = db.prepare("SELECT fullpath FROM albums");
  const albums = getAllAlbums.all();
  return albums;
};

const getFiles = () => {
  const allFiles = db.prepare("SELECT audioFile FROM files");
  const files = allFiles.all();
  return files;
};

const searchAlbums = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  console.log(info);
  /*  db.close(); */
};

const allFilesByScroll = offsetNum => {
  const stmt = db.prepare(`SELECT * FROM files LIMIT 50 OFFSET ${offsetNum}`);
  return stmt.all();
};

const requestedFile = trackId => {
  const reqTrack = db.prepare(`Select * from files where afid = ? `);
  return reqTrack.get(trackId);
};

export {
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteFiles,
  getAlbums,
  getFiles,
  allFilesByScroll,
  requestedFile,
};