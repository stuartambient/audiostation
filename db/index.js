import Database from "better-sqlite3";

const db = new Database(
  "C:/users/sambi/documents/nodeprojs/folder-function-test/db/audiofiles.db"
);
db.pragma("journal_mode = WAL");

export default db;
