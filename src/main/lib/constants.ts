import { app } from 'electron';
import path from 'path';

export const configPath = () => (path.resolve(
    app.getPath('home'), '.ftm'
));
export const optionsPath = () => (path.resolve(
    configPath(), 'options.json'
));