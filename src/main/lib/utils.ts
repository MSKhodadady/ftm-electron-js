import fs from 'fs';
import { existsSync } from 'fs';
import { writeFileSync } from 'original-fs';
import { optionsPath } from "./constants";

export interface Options {
  drivers: Driver[]
}

export function getOptions(): Options {
  const op = optionsPath();
  if (!existsSync(op)) {
    writeFileSync(op, "{\"drivers\": []}", { encoding: "utf-8" });
  }
  return JSON.parse(
    fs.readFileSync(optionsPath(), { encoding: 'utf-8' })
  );
}

export function writeOptions(options: Options) {
  return fs.writeFileSync(optionsPath(), JSON.stringify(options));
}

export function preparedSqlName(s: string) { return s.replace(/\'/g, "''"); }

