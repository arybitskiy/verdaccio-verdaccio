import { pseudoRandomBytes } from 'crypto';
import fs from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';

import { Config, getDefaultConfig } from '@verdaccio/config';
import { setup } from '@verdaccio/logger';
import { ConfigYaml } from '@verdaccio/types';

import { Storage } from '../src';
import { configExample } from './helpers';

function generateRandomStorage() {
  const tempStorage = pseudoRandomBytes(5).toString('hex');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), '/verdaccio-plugin-test'));

  return path.join(tempRoot, tempStorage);
}

setup({ type: 'stdout', format: 'pretty', level: 'trace' });

const pluginsPartialsFolder = path.join(__dirname, './fixtures/plugins');

const getConfig = (file, override: Partial<ConfigYaml> = {}): Config => {
  const config = new Config(
    configExample(
      {
        ...getDefaultConfig(),
        storage: generateRandomStorage(),
        ...override,
      },
      `./fixtures/config/${file}`,
      __dirname
    )
  );
  return config;
};

describe('storage plugin', () => {
  beforeEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
    jest.clearAllMocks();
  });

  describe('getLocalDatabase', () => {
    test('should return no results', async () => {
      const configJSON = getConfig('storage/plugin-legacy.yaml');
      const config = new Config(
        configExample({
          ...configJSON,
          plugins: pluginsPartialsFolder,
          storage: generateRandomStorage(),
        })
      );

      const storage = new Storage(config);
      await storage.init(config);
      await expect(storage.getLocalDatabase()).resolves.toHaveLength(0);
    });
  });
});
