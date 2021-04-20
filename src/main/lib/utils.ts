import fs from 'fs';
import { optionsPath } from "./constants";

export function getOptions(): { drivers: [{ name: string, path: string }] } {
    return JSON.parse(
        fs.readFileSync(optionsPath, { encoding: 'utf-8' })
    );
}