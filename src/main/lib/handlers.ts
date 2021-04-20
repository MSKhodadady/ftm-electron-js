import { ipcMain, dialog } from "electron";
import Database from 'better-sqlite3';
import { Driver } from "../../common/types";

import path from 'path';
import { getOptions } from "./utils";
import fs from "fs";

ipcMain.handle('choose-file', (): Promise<Electron.OpenDialogReturnValue> => {
  return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
});

ipcMain.handle('tag-list', (event, query, selectedDriver: Driver) => {
  const dbPath = selectedDriver.path + '/.ftm/data.db';
  const db = new Database(dbPath);

  const dbQuery = `SELECT DISTINCT tag_name FROM file_tag WHERE tag_name LIKE '${query + '%'}';`;
  const res = db
    .prepare(dbQuery)
    .all()

  return res.map(v => v.tag_name);
});

ipcMain.handle('get-drivers', e => {
  const { drivers } = getOptions();

  return drivers;
});

ipcMain.handle(
  'save-file',
  async (event, selectedPaths: string[], selectedTags: string[] | [], selectedDriver: Driver, moveFile: boolean) => {
    const dbPath = selectedDriver.path + '/.ftm/data.db';
    const db = new Database(dbPath);

    for (const selectedPath of selectedPaths) {
      const fileName = path.basename(selectedPath);

      try {
        //: copy file
        await fs.promises.copyFile(selectedPath, path.resolve(selectedDriver.path, fileName));

        // delete file
        if (moveFile) {
          await fs.promises.rm(selectedPath);
        }

        // set tags to files
        if (selectedTags != []) {
          selectedTags.forEach(tag => {
            const query = `INSERT INTO file_tag (file_name, tag_name, tag_value) VALUES('${fileName}', '${tag}', NULL);`;
            db.prepare(query).run();
          });
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  });