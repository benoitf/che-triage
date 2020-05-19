/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddCheMilestoneOnMergedPRLogic } from '../../src/logic/add-che-milestone-on-merged-pr-logic';
import { AddMilestoneHelper } from '../../src/helpers/add-milestone-helper';
import { CheVersionFetcher } from '../../src/fetchers/che-version-fetcher';
import { Container } from 'inversify';
import { PullRequestAction } from '../../src/actions/pull-request-action';
import { PullRequestInfo } from '../../src/info/pull-request-info';

describe('Test Logic AddChe', () => {
  let container: Container;
  let pullRequestAction: PullRequestAction;
  let addMilestoneHelper: AddMilestoneHelper;
  let cheVersionFetcher: CheVersionFetcher;

  beforeEach(() => {
    container = new Container();
    container.bind(AddCheMilestoneOnMergedPRLogic).toSelf().inSingletonScope();

    pullRequestAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(PullRequestAction).toConstantValue(pullRequestAction);

    addMilestoneHelper = {
      setMilestone: jest.fn(),
    } as any;
    container.bind(AddMilestoneHelper).toConstantValue(addMilestoneHelper);

    cheVersionFetcher = {
      getVersion: jest.fn(),
    } as any;
    container.bind(CheVersionFetcher).toConstantValue(cheVersionFetcher);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test closed but not merged', async () => {
    const addCheMilestoneOnMergedPRLogic = container.get(AddCheMilestoneOnMergedPRLogic);

    addCheMilestoneOnMergedPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddCheMilestoneOnMergedPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = { merged: false } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should not call helper
    expect(addMilestoneHelper.setMilestone).toBeCalledTimes(0);
    expect(cheVersionFetcher.getVersion).toBeCalledTimes(0);
  });

  test('test closed and merged in master', async () => {
    const addCheMilestoneOnMergedPRLogic = container.get(AddCheMilestoneOnMergedPRLogic);

    const fakeMilestone = '1.2.3.4';
    (cheVersionFetcher.getVersion as jest.Mock).mockReturnValue(fakeMilestone);

    addCheMilestoneOnMergedPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddCheMilestoneOnMergedPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = { merged: true, mergingBranch: 'master' } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should call helper
    expect(addMilestoneHelper.setMilestone).toBeCalled();
    expect(cheVersionFetcher.getVersion).toBeCalled();

    const setMilestoneCall = (addMilestoneHelper.setMilestone as jest.Mock).mock.calls[0];
    expect(setMilestoneCall[0]).toEqual(fakeMilestone);
    expect(setMilestoneCall[1]).toEqual(pullRequestInfo);
  });

  test('test closed and merged but not able to find with helper', async () => {
    const addCheMilestoneOnMergedPRLogic = container.get(AddCheMilestoneOnMergedPRLogic);

    const notFoundMilestone = undefined;
    (cheVersionFetcher.getVersion as jest.Mock).mockReturnValue(notFoundMilestone);

    addCheMilestoneOnMergedPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddCheMilestoneOnMergedPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = { merged: true, mergingBranch: 'master' } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should call helper
    expect(cheVersionFetcher.getVersion).toBeCalled();
    expect(addMilestoneHelper.setMilestone).toBeCalledTimes(0);
  });

  test('test closed and merged but not in master', async () => {
    const addCheMilestoneOnMergedPRLogic = container.get(AddCheMilestoneOnMergedPRLogic);

    const fakeMilestone = '1.2.3.4';
    (cheVersionFetcher.getVersion as jest.Mock).mockReturnValue(fakeMilestone);

    addCheMilestoneOnMergedPRLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddCheMilestoneOnMergedPRLogic.PR_EVENT);
    const callback = registerCallbackCall[1];

    const pullRequestInfo: PullRequestInfo = { merged: true, mergingBranch: 'foo' } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should call helper
    expect(cheVersionFetcher.getVersion).toBeCalledTimes(0);
    expect(addMilestoneHelper.setMilestone).toBeCalledTimes(0);
  });
});
