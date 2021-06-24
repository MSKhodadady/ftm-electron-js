const DB = require('better-sqlite3');
const fs = require('fs');

const optionsPath = '/home/sadeq/.ftm/options.json';

function getOptions(): { drivers: [{ name: string, path: string }] } {
  return JSON.parse(
    fs.readFileSync(optionsPath, { encoding: 'utf-8' })
  );
}

const { drivers } = getOptions();

drivers.forEach((driver: any) => {
  const dbPath = driver.path + '/.ftm' + '/data.db'

  const db = new DB(dbPath);

  const allFiles: string[] = db
    .prepare(`SELECT DISTINCT file_name FROM file_tag;`)
    .all()
    .map((v: any) => v.file_name);

  allFiles.forEach(file => {
    db
      .prepare(`INSERT OR IGNORE INTO file_tag (file_name, tag_name) VALUES('${file
        }', ':EXISTS:');`)
      .run();
  });
});