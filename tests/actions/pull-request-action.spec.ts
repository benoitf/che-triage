/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as path from 'path';

import { PullRequestInfo, PullRequestInfoBuilder } from '../../src/info/pull-request-info';

import { Container } from 'inversify';
import { IssuesHelper } from '../../src/helpers/issue-helper';
import { PullRequestAction } from '../../src/actions/pull-request-action';
import { PullRequestInfoLinkedIssuesExtractor } from '../../src/info/pull-request-info-linked-issues-extractor';
import { WebhookPayloadPullRequest } from '@octokit/webhooks';

describe('Test Action PullRequestAction', () => {
  let container: Container;

  let pullRequestInfoLinkedIssuesExtractor: PullRequestInfoLinkedIssuesExtractor;
  let issuesHelper: IssuesHelper;

  beforeEach(() => {
    container = new Container();
    pullRequestInfoLinkedIssuesExtractor = {
      extract: jest.fn(),
    } as any;
    container.bind(PullRequestInfoLinkedIssuesExtractor).toConstantValue(pullRequestInfoLinkedIssuesExtractor);

    issuesHelper = {
      getIssue: jest.fn(),
    } as any;
    container.bind(IssuesHelper).toConstantValue(issuesHelper);

    container.bind(PullRequestAction).toSelf().inSingletonScope();
    container.bind(PullRequestInfoBuilder).toSelf().inSingletonScope();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test not execute as event is unknown', async () => {
    const pullRequestAction = container.get(PullRequestAction);

    const payload: WebhookPayloadPullRequest = jest.fn() as any;

    let receivedPullRequestInfo: PullRequestInfo | undefined = undefined;

    const fooMock: any = { dummyCall: jest.fn() };
    pullRequestAction.registerCallback(['unknown-event'], async (pullRequestInfo: PullRequestInfo) => {
      fooMock.dummyCall();
      receivedPullRequestInfo = pullRequestInfo;
    });

    // duplicate callback to check we add twice the callbacks
    pullRequestAction.registerCallback(['unknown-event'], async (pullRequestInfo: PullRequestInfo) => {
      fooMock.dummyCall();
      receivedPullRequestInfo = pullRequestInfo;
    });

    await pullRequestAction.execute(payload);
    expect(fooMock.dummyCall).toBeCalledTimes(0);
    expect(receivedPullRequestInfo).toBeUndefined();
  });

  // opened event should trigger action
  test('test single opened execute', async () => {
    const pullRequestAction = container.get(PullRequestAction);

    const json = await fs.readJSON(path.join(__dirname, '..', '_data', 'pull_request', 'opened', 'create-pr.json'));

    let receivedPullRequestInfo: PullRequestInfo = jest.fn() as any;
    const fooMock: any = { dummyCall: jest.fn() };
    await pullRequestAction.registerCallback(['opened'], async (pullRequestInfo: PullRequestInfo) => {
      fooMock.dummyCall();
      receivedPullRequestInfo = pullRequestInfo;
    });

    await pullRequestAction.execute(json);
    expect(fooMock.dummyCall).toHaveBeenCalled();
    expect(receivedPullRequestInfo).toBeDefined();
    expect(receivedPullRequestInfo?.repo).toEqual('demo-gh-event');
    expect(receivedPullRequestInfo?.number).toEqual(9);
    expect(receivedPullRequestInfo?.owner).toEqual('benoitf');
    expect(receivedPullRequestInfo?.author).toEqual('chetrend');
  });
});
