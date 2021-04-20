/* 
 * This file is used for configuring system, before the app runs
*/

import { existsSync, mkdirSync, readFileSync } from "fs";
import { configPath, optionsPath } from './constants';

import Database from "better-sqlite3";
import { getOptions } from "./utils";


if (!existsSync(configPath)) {
    mkdirSync(configPath);
}

let { drivers } = getOptions();

drivers.forEach(
    ({ path }) => {
        const configFolder = path + '/.ftm';
        if (!existsSync(configFolder))
            mkdirSync(configFolder);

        const dbPath = configFolder + '/data.db'
        if (! existsSync(dbPath)) {
            const db = new Database(dbPath);

            //: run migrations
            db.exec(`CREATE TABLE "file_tag" (
                "file_name"	TEXT NOT NULL,
                "tag_name"	TEXT NOT NULL,
                "tag_value"	TEXT,
                PRIMARY KEY("file_name","tag_name")
            );`);
        }
    }
)