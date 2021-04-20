require('ts-node').register({ project: __dirname + '/configs/main/tsconfig.dev.json', pretty: true });
require(__dirname + '/src/main/main.ts');