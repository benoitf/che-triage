/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { AddWelcomeFirstIssueLogic } from '../../src/logic/add-welcome-first-issue';
import { AddWelcomeFirstPRLogic } from '../../src/logic/add-welcome-first-pr';
import { Container } from 'inversify';
import { IssueAction } from '../../src/actions/issue-action';
import { IssuesHelper } from '../../src/helpers/issue-helper';
import { PullRequestInfo } from '../../src/info/pull-request-info';

describe('Test Logic AddWelcomeFirstIssue', () => {
  let container: Container;
  let issueAction: IssueAction;
  let issueHelper: IssuesHelper;
  let addCommentHelper: AddCommentHelper;

  beforeEach(() => {
    container = new Container();
    container.bind(AddWelcomeFirstIssueLogic).toSelf().inSingletonScope();

    issueAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(IssueAction).toConstantValue(issueAction);

    issueHelper = {
      isFirstTime: jest.fn(),
    } as any;
    container.bind(IssuesHelper).toConstantValue(issueHelper);

    addCommentHelper = {
      addComment: jest.fn(),
    } as any;
    container.bind(AddCommentHelper).toConstantValue(addCommentHelper);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test Is First Time', async () => {
    const addWelcomeFirstIssueLogic = container.get(AddWelcomeFirstIssueLogic);

    // will return true
    (issueHelper.isFirstTime as jest.Mock).mockReturnValue(true);

    addWelcomeFirstIssueLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;

    // call the callback
    await callback(pullRequestInfo);

    expect(issueHelper.isFirstTime).toBeCalled();
    const isFirstTimeContributorCall = (issueHelper as any).isFirstTime.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

    expect(addCommentHelper.addComment).toBeCalled();
    const addCommentCall = (addCommentHelper as any).addComment.mock.calls[0];
    expect(addCommentCall[0]).toMatch('Is it first time');
  });

  test('test Is Not First Time', async () => {
    const addWelcomeFirstIssueLogic = container.get(AddWelcomeFirstIssueLogic);

    // will return true
    (issueHelper.isFirstTime as jest.Mock).mockReturnValue(false);

    addWelcomeFirstIssueLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;

    // call the callback
    await callback(pullRequestInfo);

    expect(issueHelper.isFirstTime).toBeCalled();
    const isFirstTimeContributorCall = (issueHelper as any).isFirstTime.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

    expect(addCommentHelper.addComment).toBeCalledTimes(0);
  });
});
