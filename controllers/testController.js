import { promises as fsPromises } from "node:fs";
import { promisify } from "node:util";

/* const writeFile = files => {
  for (const f of files) {
    fsPromises.writeFile("f-files.txt", `${f}\r\n`, {
      encoding: "utf8",
      flag: "a",
    });
  }
  const finishedfile = fsPromises.readFile("f-files.txt", "utf8");
  return finishedfile;
};

const test = (req, res) => {
  fsPromises
    .readdir("F:/Music")
    .then(files => writeFile(files))
    .then(f => res.status(200).send(f));
}; */

const secFunc = () => {
  return new Promise((resolve, reject) => {
    resolve(100);
  });
};

const callSync = async () => {
  const sfret = await secFunc();
  return sfret;
};

const test = async (req, res) => {
  const x = await callSync();
  res.status(200).send({ x });
};

export default test;
