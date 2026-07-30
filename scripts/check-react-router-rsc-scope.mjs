import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const repositoryRoot = resolve(new URL('../', import.meta.url).pathname);
const frontendRoot = join(repositoryRoot, 'frontend');
const frontendPackage = JSON.parse(readFileSync(join(frontendRoot, 'package.json'), 'utf8'));
const exceptionContract = JSON.parse(
  readFileSync(join(repositoryRoot, 'docs/deployment/security-exceptions.json'), 'utf8'),
);

const exception = exceptionContract.exceptions?.find(
  (entry) => entry.advisory === 'GHSA-qwww-vcr4-c8h2',
);
if (
  exceptionContract.schemaVersion !== 1 ||
  exception?.applicability !== 'not-enabled' ||
  exception?.runtimeFeature !== 'React Router RSC mode'
) {
  throw new Error('the exact React Router RSC advisory exception is not checked');
}
if (frontendPackage.dependencies?.['react-router-dom'] !== '7.18.2') {
  throw new Error('the advisory scope proof must be reviewed after react-router-dom changes');
}
if (!frontendPackage.devDependencies?.vite) {
  throw new Error('the checked frontend must remain a Vite application');
}

const allDependencies = {
  ...frontendPackage.dependencies,
  ...frontendPackage.devDependencies,
};
const forbiddenPackages = [
  '@react-router/dev',
  '@react-router/node',
  '@react-router/serve',
  '@react-router/fs-routes',
];
for (const packageName of forbiddenPackages) {
  if (allDependencies[packageName]) {
    throw new Error(`RSC/framework dependency enables review scope: ${packageName}`);
  }
}
for (const configName of ['react-router.config.ts', 'react-router.config.js', 'routes.ts']) {
  if (existsSync(join(frontendRoot, configName))) {
    throw new Error(`React Router framework configuration enables review scope: ${configName}`);
  }
}

const prohibitedRuntimeMarkers = [
  'RSCHydratedRouter',
  'RSCStaticRouter',
  'createCallServer',
  'createRequestHandler',
  'getRSCStream',
  'serverAction',
  'unstable_RSC',
];
const sourceFiles = [];
const collect = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) sourceFiles.push(path);
  }
};
collect(join(frontendRoot, 'src'));
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  for (const marker of prohibitedRuntimeMarkers) {
    if (source.includes(marker)) {
      throw new Error(`RSC/server runtime marker ${marker} found in ${file}`);
    }
  }
}

const main = readFileSync(join(frontendRoot, 'src/main.tsx'), 'utf8');
if (!main.includes('BrowserRouter')) {
  throw new Error('the client-only BrowserRouter entrypoint is no longer present');
}
console.log('Verified Roots uses client-only BrowserRouter and does not enable React Router RSC mode.');
