#!/usr/bin/env node

import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultDistDirectory = resolve(repositoryRoot, 'frontend/dist');
const defaultSloFile = resolve(repositoryRoot, 'docs/deployment/performance-slo.json');

function fail(message) {
  throw new Error(message);
}

function positiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    fail(`${label} must be a positive integer`);
  }
  return value;
}

export function readBundleBudgets(sloFile = defaultSloFile) {
  const config = JSON.parse(readFileSync(sloFile, 'utf8'));
  return {
    initialGzipBytesMax: positiveInteger(
      config.bundle?.initialGzipBytesMax,
      'bundle.initialGzipBytesMax',
    ),
    totalGzipBytesMax: positiveInteger(
      config.bundle?.totalGzipBytesMax,
      'bundle.totalGzipBytesMax',
    ),
  };
}

function assetPathsFromHtml(html) {
  return [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/g)]
    .map((match) => match[1])
    .filter((asset, index, assets) => assets.indexOf(asset) === index);
}

function gzipBytes(file) {
  return gzipSync(readFileSync(file)).length;
}

export function measureBundle(distDirectory = defaultDistDirectory) {
  const indexFile = resolve(distDirectory, 'index.html');
  if (!existsSync(indexFile)) fail(`Missing build entry: ${indexFile}`);

  const initialAssets = assetPathsFromHtml(readFileSync(indexFile, 'utf8'));
  if (initialAssets.length === 0) fail('No initial JS/CSS assets were found in index.html');

  const initialGzipBytes = initialAssets.reduce((total, asset) => {
    const file = resolve(distDirectory, `.${asset}`);
    if (!existsSync(file)) fail(`Initial asset does not exist: ${asset}`);
    return total + gzipBytes(file);
  }, 0);

  const assetsDirectory = resolve(distDirectory, 'assets');
  if (!existsSync(assetsDirectory)) fail(`Missing assets directory: ${assetsDirectory}`);
  const totalGzipBytes = readdirSync(assetsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:js|css)$/.test(entry.name))
    .reduce((total, entry) => total + gzipBytes(resolve(assetsDirectory, entry.name)), 0);

  return { initialAssets, initialGzipBytes, totalGzipBytes };
}

export function enforceBundleBudget(measurement, budgets) {
  const failures = [];
  if (measurement.initialGzipBytes > budgets.initialGzipBytesMax) {
    failures.push(
      `initial gzip ${measurement.initialGzipBytes} exceeds ${budgets.initialGzipBytesMax}`,
    );
  }
  if (measurement.totalGzipBytes > budgets.totalGzipBytesMax) {
    failures.push(
      `total gzip ${measurement.totalGzipBytes} exceeds ${budgets.totalGzipBytesMax}`,
    );
  }
  if (failures.length > 0) fail(`Bundle budget failed: ${failures.join('; ')}`);
}

function appendOutput(file, lines) {
  if (!file) return;
  appendFileSync(file, `${lines.join('\n')}\n`);
}

export async function runBundleCheck({
  distDirectory = defaultDistDirectory,
  sloFile = defaultSloFile,
  outputFile = process.env.GITHUB_OUTPUT,
  summaryFile = process.env.GITHUB_STEP_SUMMARY,
} = {}) {
  const budgets = readBundleBudgets(sloFile);
  const measurement = measureBundle(distDirectory);
  enforceBundleBudget(measurement, budgets);

  appendOutput(outputFile, [
    `initial_gzip_bytes=${measurement.initialGzipBytes}`,
    `initial_gzip_budget_bytes=${budgets.initialGzipBytesMax}`,
    `total_gzip_bytes=${measurement.totalGzipBytes}`,
    `total_gzip_budget_bytes=${budgets.totalGzipBytesMax}`,
  ]);
  appendOutput(summaryFile, [
    '### Enforced bundle budgets',
    '',
    '| Metric | Observed | Budget |',
    '| --- | ---: | ---: |',
    `| Initial JS/CSS gzip | ${measurement.initialGzipBytes} | ${budgets.initialGzipBytesMax} |`,
    `| Total JS/CSS gzip | ${measurement.totalGzipBytes} | ${budgets.totalGzipBytesMax} |`,
  ]);

  return { ...measurement, ...budgets };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runBundleCheck()
    .then((result) => {
      console.log(
        `Bundle budgets passed: initial=${result.initialGzipBytes}/${result.initialGzipBytesMax}, `
        + `total=${result.totalGzipBytes}/${result.totalGzipBytesMax} gzip bytes`,
      );
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
