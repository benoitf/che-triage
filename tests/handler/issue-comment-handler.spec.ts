/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { Container } from 'inversify';
import { Handler } from '../../src/api/handler';
import { IssueCommentHandler } from '../../src/handler/issue-comment-handler';
import { IssueCommentListener } from '../../src/api/issue-comment-listener';
import { bindMultiInjectProvider } from '../../src/api/multi-inject-provider';

describe('Test Issue Comment Handler', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    bindMultiInjectProvider(container, Handler);
    bindMultiInjectProvider(container, IssueCommentListener);
    container.bind(Handler).to(IssueCommentHandler).inSingletonScope();
  });

  test('test acceptance (true)', async () => {
    const issueCommentHandler: Handler = container.get(Handler);
    const supports = issueCommentHandler.supports('issue_comment');
    expect(supports).toBeTruthy();
  });

  test('test acceptance (false)', async () => {
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueCommentHandler.name);
    const issueCommentHandler: IssueCommentHandler = handler as IssueCommentHandler;
    const supports = issueCommentHandler.supports('invalid-event');
    expect(supports).toBeFalsy();
  });

  test('test no listener', async () => {
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueCommentHandler.name);
    const issueCommentHandler: IssueCommentHandler = handler as IssueCommentHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue_comment', 'created', 'new-comment.json'));
    issueCommentHandler.handle('issue_comment', {} as any, json);
    expect(issueCommentHandler['issueCommentListeners'].getAll()).toEqual([]);
  });

  test('test call one listener', async () => {
    const listener: IssueCommentListener = { execute: jest.fn() };
    container.bind(IssueCommentListener).toConstantValue(listener);
    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueCommentHandler.name);
    const issueCommentHandler: IssueCommentHandler = handler as IssueCommentHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue_comment', 'created', 'new-comment.json'));
    issueCommentHandler.handle('issue_comment', {} as any, json);
    expect(listener.execute).toBeCalled();
  });

  test('test call several listeners', async () => {
    // bind 2 listeners
    const listener: IssueCommentListener = { execute: jest.fn() };
    container.bind(IssueCommentListener).toConstantValue(listener);
    const anotherListener: IssueCommentListener = { execute: jest.fn() };
    container.bind(IssueCommentListener).toConstantValue(anotherListener);

    const handler: Handler = container.get(Handler);
    expect(handler.constructor.name).toEqual(IssueCommentHandler.name);
    const issueCommentHandler: IssueCommentHandler = handler as IssueCommentHandler;
    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue_comment', 'created', 'new-comment.json'));
    issueCommentHandler.handle('issue_comment', {} as any, json);

    // two listeners
    expect(issueCommentHandler['issueCommentListeners'].getAll().length).toEqual(2);

    // each listener being invoked
    expect(listener.execute).toBeCalled();
    expect(anotherListener.execute).toBeCalled();
  });
});
