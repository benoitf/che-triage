/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { Container } from 'inversify';
import { Handler } from '../../src/api/handler';
import { IssueHandler } from '../../src/handler/issue-handler';
import { IssueListener } from '../../src/api/issue-listener';
import { bindMultiInjectProvider } from '../../src/api/multi-inject-provider';

describe('Test Issue Handler', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    bindMultiInjectProvider(container, Handler);
    bindMultiInjectProvider(container, IssueListener);
    container.bind(Handler).to(IssueHandler).inSingletonScope();
  });

  test('test acceptance (true)', async () => {
    const issueHandler: Handler = container.get(Handler);
    const supports = issueHandler.supports('issues');
    expect(supports).toBeTruthy();
  });

  test('test acceptance (false)', async () => {
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueHandler.name);
    const issueHandler: IssueHandler = handler as IssueHandler;
    const supports = issueHandler.supports('invalid-event');
    expect(supports).toBeFalsy();
  });

  test('test no listener', async () => {
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueHandler.name);
    const issueHandler: IssueHandler = handler as IssueHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue', 'opened', 'create-new-issue.json'));
    issueHandler.handle('issues', {} as any, json);
    expect(issueHandler['issueListeners'].getAll()).toEqual([]);
  });

  test('test call one listener', async () => {
    const listener: IssueListener = { execute: jest.fn() };
    container.bind(IssueListener).toConstantValue(listener);
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueHandler.name);
    const issueHandler: IssueHandler = handler as IssueHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue', 'opened', 'create-new-issue.json'));
    issueHandler.handle('issues', {} as any, json);
    expect(listener.execute).toBeCalled();
  });

  test('test call several listeners', async () => {
    // bind 2 listeners
    const listener: IssueListener = { execute: jest.fn() };
    container.bind(IssueListener).toConstantValue(listener);
    const anotherListener: IssueListener = { execute: jest.fn() };
    container.bind(IssueListener).toConstantValue(anotherListener);

    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueHandler.name);
    const issueHandler: IssueHandler = handler as IssueHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue', 'opened', 'create-new-issue.json'));
    issueHandler.handle('issues', {} as any, json);

    // two listeners
    expect(issueHandler['issueListeners'].getAll().length).toEqual(2);

    // each listener being invoked
    expect(listener.execute).toBeCalled();
    expect(anotherListener.execute).toBeCalled();
  });
});
