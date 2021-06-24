/* 
 * This file is used for configuring system, before the app runs
*/

import { existsSync, mkdirSync, readdirSync } from "fs";
import { configPath } from './constants';

import Database from "better-sqlite3";
import { getOptions } from "./utils";
import { Driver } from "../../common/types";

export const preRunSetup = () => {
  if (!existsSync(configPath())) {
    mkdirSync(configPath());
  }

  getOptions().drivers.forEach(initDriver);
}

export const initDriver = ({ path }: Driver) => {
  const configFolder = path + '/.ftm';

  if (!existsSync(configFolder))
    mkdirSync(configFolder);

  const dbPath = configFolder + '/data.db';
  if (!existsSync(dbPath)) {
    const db = new Database(dbPath);

    //: run migrations
    db.exec(`CREATE TABLE "file_tag" (
            "file_name"	TEXT NOT NULL,
            "tag_name"	TEXT NOT NULL,
            "tag_value"	TEXT,
            PRIMARY KEY("file_name","tag_name")
        );`);
  }

  const filesList = readdirSync(path, { withFileTypes: true });

  const db = new Database(dbPath);

  filesList.forEach(dirNet => {
    if (dirNet.isFile()) {
      db
        .prepare(`INSERT OR IGNORE ${'\n'
          } INTO file_tag (file_name, tag_name) VALUES ('${dirNet.name
          }', ':EXISTS:');`).run();
    }
  });
}