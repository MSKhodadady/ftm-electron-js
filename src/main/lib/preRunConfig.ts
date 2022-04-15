/* 
 * This file is used for configuring system, before the app runs
*/
/// <reference path="../../types/main.d.ts" />

import { existsSync, mkdirSync, readdirSync } from "fs";
import { configPath } from './constants';

import Database from "better-sqlite3";
import { getOptions, preparedSqlName } from "./utils";
import path from 'path';

export const preRunSetup = () => {
  if (!existsSync(configPath())) {
    mkdirSync(configPath());
  }

  getOptions().drivers.forEach(initDriver);
}

export const initDriver = ({ path: driverPath }: Driver) => {
  const configFolder = path.resolve(driverPath, '.ftm');

  if (!existsSync(configFolder))
    mkdirSync(configFolder);

  // const dbPath = configFolder + '/data.db';
  const dbPath = path.resolve(configFolder, 'data.db');
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

  const filesList = readdirSync(driverPath, { withFileTypes: true });

  const db = new Database(dbPath);

  filesList.forEach(dirNet => {
    if (dirNet.isFile()) {
      db
        .prepare(`INSERT OR IGNORE ${'\n'
          } INTO file_tag (file_name, tag_name) VALUES ('${preparedSqlName(dirNet.name)
          }', ':EXISTS:');`).run();
    }
  });
}