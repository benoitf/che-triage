/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddCommentHelper } from '../../src/helpers/add-comment-helper';
import { AddWelcomeFirstPRLogic } from '../../src/logic/add-welcome-first-pr';
import { Container } from 'inversify';
import { PullRequestAction } from '../../src/actions/pull-request-action';
import { PullRequestHelper } from '../../src/helpers/pull-request-helper';
import { PullRequestInfo } from '../../src/info/pull-request-info';

describe('Test Logic AddWelcomeFirstPr', () => {
  let container: Container;
  let pullRequestAction: PullRequestAction;
  let pullRequestHelper: PullRequestHelper;
  let addCommentHelper: AddCommentHelper;

  beforeEach(() => {
    container = new Container();
    container.bind(AddWelcomeFirstPRLogic).toSelf().inSingletonScope();

    pullRequestAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(PullRequestAction).toConstantValue(pullRequestAction);

    pullRequestHelper = {
      isFirstTimeContributor: jest.fn(),
    } as any;
    container.bind(PullRequestHelper).toConstantValue(pullRequestHelper);

    addCommentHelper = {
      addComment: jest.fn(),
    } as any;
    container.bind(AddCommentHelper).toConstantValue(addCommentHelper);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test Is First Time', async () => {
    const addWelcomeFirstPRLogic = container.get(AddWelcomeFirstPRLogic);

    // will return true
    (pullRequestHelper.isFirstTimeContributor as jest.Mock).mockReturnValue(true);

    addWelcomeFirstPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();
    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;

    // call the callback
    await callback(pullRequestInfo);

    expect(pullRequestHelper.isFirstTimeContributor).toBeCalled();
    const isFirstTimeContributorCall = (pullRequestHelper as any).isFirstTimeContributor.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

    expect(addCommentHelper.addComment).toBeCalled();
    const addCommentCall = (addCommentHelper as any).addComment.mock.calls[0];
    expect(addCommentCall[0]).toMatch('Is it first time');
  });

  test('test Is Not First Time', async () => {
    const addWelcomeFirstPRLogic = container.get(AddWelcomeFirstPRLogic);

    // will return true
    (pullRequestHelper.isFirstTimeContributor as jest.Mock).mockReturnValue(false);

    addWelcomeFirstPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();
    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddWelcomeFirstPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = jest.fn() as any;

    // call the callback
    await callback(pullRequestInfo);

    expect(pullRequestHelper.isFirstTimeContributor).toBeCalled();
    const isFirstTimeContributorCall = (pullRequestHelper as any).isFirstTimeContributor.mock.calls[0];
    expect(isFirstTimeContributorCall[0]).toBe(pullRequestInfo);

    expect(addCommentHelper.addComment).toBeCalledTimes(0);
  });
});
