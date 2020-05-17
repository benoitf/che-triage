import 'reflect-metadata';

import * as core from '@actions/core';

import { Main } from '../src/main';

jest.mock('@actions/core');

describe('Test Main', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test missing token', async () => {
    const main = new Main();
    await main.start();
    expect(core.setFailed).toBeCalled();
    const call = (core.setFailed as jest.Mock).mock.calls[0];
    expect(call[0]).toMatch('No Token provided');
  });

  test('test with token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (core as any).__setInput(Main.WRITE_TOKEN, 'foo');

    jest.mock('../src/inversify-binding');
    const main = new Main();
    await main.start();
    expect(core.setFailed).toBeCalledTimes(0);
    expect(core.setOutput).toBeCalled();
    const call = (core.setOutput as jest.Mock).mock.calls[0];
    expect(call[0]).toMatch('time');
  });
});
