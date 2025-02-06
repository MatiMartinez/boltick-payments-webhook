import { build } from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

interface TsConfig {
  compilerOptions: {
    paths: Record<string, string[]>;
  };
}

const tsconfig: TsConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'tsconfig.json'), 'utf-8'));

const alias = Object.entries(tsconfig.compilerOptions.paths).reduce<Record<string, string>>((acc, [key, value]) => {
  const aliasKey = key.replace('/*', '');
  const aliasPath = path.resolve(__dirname, value[0].replace('/*', ''));
  acc[aliasKey] = aliasPath;
  return acc;
}, {});

build({
  entryPoints: ['./src/handler.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: './build/handler.js',
  resolveExtensions: ['.ts', '.js'],
  alias,
}).catch(() => process.exit(1));
