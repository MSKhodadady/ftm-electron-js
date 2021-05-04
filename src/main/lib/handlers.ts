import { ipcMain, dialog, shell } from "electron";
import Database from 'better-sqlite3';
import { Driver } from "../../common/types";

import path from 'path';
import { getOptions } from "./utils";
import fs from "fs";

const getDB = (selectedDriver: Driver) => new Database(selectedDriver.path + '/.ftm/data.db');

//: list of handlers' name and their function
const handlersList: any = [
  ['choose-file',
    (): Promise<Electron.OpenDialogReturnValue> => {
      return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    }
  ],

  ['tag-list',
    (event, query, selectedDriver: Driver) => {
      const dbPath = selectedDriver.path + '/.ftm/data.db';
      const db = new Database(dbPath);

      const dbQuery = `SELECT DISTINCT tag_name FROM file_tag WHERE tag_name LIKE '${query + '%'}';`;
      const res = db
        .prepare(dbQuery)
        .all()

      return res.map(v => v.tag_name);
    }
  ],

  ['get-drivers', e => {
    const { drivers } = getOptions();

    return drivers;
  }],

  ['save-file',
    async (event, selectedPaths: string[], selectedTags: string[] | [], selectedDriver: Driver, moveFile: boolean) => {
      const dbPath = selectedDriver.path + '/.ftm/data.db';
      const db = new Database(dbPath);

      for (const selectedPath of selectedPaths) {
        const fileName = path.basename(selectedPath);

        try {
          //: copy file
          await fs.promises.copyFile(selectedPath, path.resolve(selectedDriver.path, fileName));

          // delete file
          if (moveFile)
            await fs.promises.rm(selectedPath);

          // set tags to files
          if (selectedTags != [])
            selectedTags.forEach(tag => {
              const query = `INSERT INTO file_tag (file_name, tag_name, tag_value) VALUES('${fileName}', '${tag}', NULL);`;
              db.prepare(query).run();
            });

        } catch (error) {
          console.log(error);
          return error;
        }
      }

    }
  ],

  ['test', e => 'I came back'],

  ['files-list', (e, selectedDriver: Driver) => {
    return getDB(selectedDriver).prepare(`SELECT file_name, tag_name FROM file_tag;`).all();
  }],

  ['open-file',
    (e, selectedDriver: Driver, fileName: string) => shell.openPath(selectedDriver.path + '/' + fileName)],

  ['rename-file',
    async (e, selectedDriver: Driver, oldFileName: string, newFileName: string) => {
      await fs.promises.rename(
        path.resolve(selectedDriver.path, oldFileName),
        path.resolve(selectedDriver.path, newFileName)
      );

      getDB(selectedDriver).prepare(
        `UPDATE file_tag SET file_name ='${newFileName}' WHERE file_name='${oldFileName}';`
      ).run();
    }]
];

//: register all handlers
handlersList.forEach(v => {
  try {
    //: remove handlers (because of hot reloading for this module)
    ipcMain.removeHandler(v[0]);
    //: register handlers
    ipcMain.handle(v[0], v[1]);
  } catch (error) {
    console.error(error);
  }
});