/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { Container } from 'inversify';
import { IssueAction } from '../../src/actions/issue-action';
import { WebhookPayloadIssues } from '@octokit/webhooks';

describe('Test Action IssueAction', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(IssueAction).toSelf().inSingletonScope();
    container.bind(IssueInfoBuilder).toSelf().inSingletonScope();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test not execute as event is unknown', async () => {
    const issueAction = container.get(IssueAction);

    const payload: WebhookPayloadIssues = jest.fn() as any;

    let receivedIssueInfo: IssueInfo | undefined = undefined;

    const fooMock: any = { dummyCall: jest.fn() };
    issueAction.registerCallback('unknown-event', async (issueInfo: IssueInfo) => {
      fooMock.dummyCall();
      receivedIssueInfo = issueInfo;
    });

    await issueAction.execute(payload);
    expect(fooMock.dummyCall).toBeCalledTimes(0);
    expect(receivedIssueInfo).toBeUndefined();
  });

  // opened event should trigger action
  test('test single opened execute', async () => {
    const issueAction = container.get(IssueAction);

    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'issue', 'opened', 'create-new-issue.json'));

    let receivedIssueInfo: IssueInfo = jest.fn() as any;
    const fooMock: any = { dummyCall: jest.fn() };
    await issueAction.registerCallback('opened', async (issueInfo: IssueInfo) => {
      fooMock.dummyCall();
      receivedIssueInfo = issueInfo;
    });

    await issueAction.execute(json);
    expect(fooMock.dummyCall).toHaveBeenCalled();
    expect(receivedIssueInfo).toBeDefined();
    expect(receivedIssueInfo?.repo).toEqual('demo-gh-event');
    expect(receivedIssueInfo?.number).toEqual(8);
    expect(receivedIssueInfo?.owner).toEqual('benoitf');
    expect(receivedIssueInfo?.author).toEqual('chetrend');
  });
});
