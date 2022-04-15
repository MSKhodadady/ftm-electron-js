import { ipcMain, dialog, shell } from "electron";
import Database from 'better-sqlite3';
import { Database as DBType } from "better-sqlite3";

import path from 'path';
import { getOptions, Options, preparedSqlName, writeOptions } from "./lib/utils";
import fs from "fs";
import { initDriver } from "./lib/preRunConfig";
import { deduplicate, EXISTS } from "./common/lib";

const getDB = (selectedDriver: Driver): DBType => new Database(path.resolve(selectedDriver.path, '.ftm', 'data.db'));
type DBFileTagRecord = {
  file_name: string,
  tag_name: string
}

//: list of handlers' name and their function
const handlersList: [string, (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any][] = [
  ['choose-file',
    (): Promise<Electron.OpenDialogReturnValue> => {
      return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    }
  ],

  ['choose-folder', (e) => {
    return dialog.showOpenDialog({ properties: ['openDirectory'] });
  }],

  ['tag-list',
    (event, query, selectedDriver: Driver) => {
      const dbPath = path.resolve(selectedDriver.path, '.ftm', 'data.db');
      const db = new Database(dbPath);

      const dbQuery = `SELECT DISTINCT tag_name FROM file_tag WHERE tag_name LIKE '${query + '%'}';`;
      const res = db
        .prepare(dbQuery)
        .all()

      return res.map(v => v.tag_name);
    }
  ],

  ['get-drivers', e => {
    return getOptions().drivers;
  }],

  ['save-file',
    async (event, selectedPaths: string[], selectedTags: string[] | [], selectedDriver: Driver, moveFile: boolean) => {
      const dbPath = path.resolve(selectedDriver.path, '.ftm', 'data.db');
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
              const query = `INSERT INTO file_tag (file_name, tag_name, tag_value) VALUES(
                '${preparedSqlName(fileName)}',
                '${tag}',
                NULL
              );`;
              db.prepare(query).run();
            });

        } catch (error) {
          console.log(error);
          return error;
        }
      }

    }
  ],

  ['import-files',
    async (
      event, selectedDriver: Driver, selectedFiles: MoveableFileTag[], moveFile: boolean
    ) => {
      const db = getDB(selectedDriver);

      await Promise.all(
        selectedFiles.map(async f => {
          //: copy file
          await fs.promises.copyFile(
            f.path, path.resolve(selectedDriver.path, f.fileName));

          //: delete file
          if (moveFile)
            await fs.promises.rm(f.path);

          //: add to db and set tags
          //: - add `:EXISTS:` tag to the list of tags, and deduplicate
          deduplicate([...f.tagList, EXISTS]).forEach(tag => {
            db
              .prepare(`INSERT INTO file_tag (file_name, tag_name, tag_value)
              VALUES(
                  '${preparedSqlName(f.fileName)}',
                  '${tag}',
                  NULL
                );`)
              .run();
          });
        }));
    }],

  ['files-list', (e, selectedDriver: Driver, limit: number, offset: number, filterTags: string[]): FileTag[] => {
    const filterVers = filterTags.length == 0 ? '' :
      `WHERE ${filterTags
        .map(t => `file_name IN (SELECT DISTINCT file_name FROM file_tag WHERE tag_name = '${t}')`).join(' AND\n')
      }`;

    const query = `SELECT file_name, tag_name FROM file_tag${''
      } WHERE file_name IN (SELECT DISTINCT file_name FROM file_tag ${filterVers
      } ORDER BY file_name ASC LIMIT ${limit} OFFSET ${offset});`;

    const output = getDB(selectedDriver).prepare(query).all();

    return output.reduce((acc: FileTag[], record: DBFileTagRecord): FileTag[] => (
      acc.some(r => r.fileName === record.file_name) ?
        acc.map(r =>
          (r.fileName == record.file_name ? { fileName: r.fileName, tagList: [...r.tagList, record.tag_name] } : r)
        )
        : [...acc, { fileName: record.file_name, tagList: [record.tag_name] }]
    ), []);
  }],

  ['open-file',
    (e, selectedDriver: Driver, fileName: string) => shell.openPath(selectedDriver.path + '/' + fileName)],

  ['open-external-file',
    (e, filePath: string) => shell.openPath(filePath)],

  ['rename-file',
    async (e, selectedDriver: Driver, oldFileName: string, newFileName: string) => {
      await fs.promises.rename(
        path.resolve(selectedDriver.path, oldFileName),
        path.resolve(selectedDriver.path, newFileName)
      );

      getDB(selectedDriver).prepare(
        `UPDATE file_tag
        SET file_name ='${preparedSqlName(newFileName)}'
        WHERE file_name='${preparedSqlName(oldFileName)}';`
      ).run();
    }],

  ['files-tag-add',
    async (e, selectedDriver: Driver, selectedFiles: FileTag[], selectedTags: string[]) => {
      selectedFiles.forEach(file =>
        selectedTags && selectedTags.forEach(tag => getDB(selectedDriver)
          .prepare(`INSERT OR IGNORE INTO file_tag (file_name, tag_name) VALUES('${preparedSqlName(file.fileName)
            }', '${tag}');`).run())
      );
    }],

  ['tag-remove',
    async (e, selectedDriver: Driver, fileTag: FileTag, tag: string) => {
      getDB(selectedDriver)
        .prepare(`DELETE FROM file_tag WHERE file_name='${preparedSqlName(fileTag.fileName)}' AND tag_name='${tag}';`)
        .run();
    }],

  ['remove-files',
    async (e, selectedDriver: Driver, files: FileTag[]) => {
      //: a recursive async func
      const removeFiles = async (db: DBType, driverPath: string, files: FileTag[]) => {
        const [file, ...tail] = files;
        //: end loop
        if (!file) {
          return true;
        }
        //: remove tas from db
        db
          .prepare(`DELETE FROM file_tag WHERE file_name = '${preparedSqlName(file.fileName)}';`)
          .run();

        //: remove file
        await fs.promises.rm(path.resolve(driverPath, file.fileName));
        //: recurse
        return await removeFiles(db, driverPath, tail);
      }

      await removeFiles(getDB(selectedDriver), selectedDriver.path, files);
    }],

  ['add-driver',
    async (e, driver: Driver) => {
      const options = getOptions();

      initDriver(driver);

      const newOptions = {
        ...options,
        drivers: [
          ...options.drivers,
          driver
        ]
      };

      writeOptions(newOptions);

      return newOptions.drivers;
    }],

  ['remove-driver',
    async (e, driver: Driver) => {
      const options = getOptions();

      const newOptions: Options = {
        ...options,
        drivers: options.drivers.filter(
          ({ name, path }) => !(driver.name == name && driver.path == path)
        )
      };

      writeOptions(newOptions);

      return newOptions.drivers;
    }],

  ['rename-driver',
    async (e, driver: Driver, newName: string) => {
      const options = getOptions();

      const newOptions: Options = {
        ...options,

        drivers: options.drivers.map(
          f => (
            (f.name == driver.name && f.path == driver.path) ?
              ({ name: newName, path: f.path }) : f
          )
        )
      };

      writeOptions(newOptions);

      return newOptions.drivers;
    }],

  ['tag-list-all', (e, selectedDriver: Driver, limit: null | number = null) => {
    const db = getDB(selectedDriver);
    const tagCount: { tagName: string, c: number }[] = db.prepare(`
    SELECT 
      tag_name AS tagName, COUNT(tag_name)AS c 
    FROM file_tag
    WHERE tag_name IN (
      SELECT DISTINCT tag_name FROM file_tag WHERE tag_name NOT LIKE ':%'
    ) GROUP BY tag_name ORDER BY c DESC ${limit ? 'LIMIT ' + limit : ''};`).all();

    const allCount: number = db.prepare(`SELECT COUNT(DISTINCT file_name) AS count FROM file_tag;`).get()['count'];
    const allCount2: number = tagCount.reduce((sum, v) => sum + v.c, 0);

    const tagPercentage: { tagName: string, c: number, p: number, p2: number }[] = tagCount
      .map(v => ({ ...v, p: v.c * 100 / allCount, p2: v.c * 100 / allCount2 }));

    return { tagPercentage, allCount, allCount2 };

  }]
];

//: register all handlers
export const registerHandlers = () => {
  handlersList.forEach(v => {
    try {
      const [handlerName, handlerMethod] = v;
      //: remove handlers (because of hot reloading for this module)
      ipcMain.removeHandler(handlerName);
      //: register handlers
      ipcMain.handle(handlerName, handlerMethod);
    } catch (error) {
      console.error(error);
    }
  });
}