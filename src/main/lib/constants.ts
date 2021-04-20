import { app } from 'electron';

export const configPath = app.getPath('home') + '/.ftm';
export const optionsPath = configPath + '/options.json';