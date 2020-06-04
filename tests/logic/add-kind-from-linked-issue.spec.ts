/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { IssueInfo, IssueInfoBuilder } from '../../src/info/issue-info';

import { AddKindFromLinkedIssuesLogic } from '../../src/logic/add-kind-from-linked-issue';
import { AddLabelHelper } from '../../src/helpers/add-label-helper';
import { Container } from 'inversify';
import { PullRequestAction } from '../../src/actions/pull-request-action';
import { PullRequestInfo } from '../../src/info/pull-request-info';

describe('Test Logic AddKindFromLinkedIssuesLogic', () => {
  let container: Container;
  let pullRequestAction: PullRequestAction;
  let addLabelHelper: AddLabelHelper;

  beforeEach(() => {
    container = new Container();
    container.bind(AddKindFromLinkedIssuesLogic).toSelf().inSingletonScope();

    pullRequestAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(PullRequestAction).toConstantValue(pullRequestAction);

    addLabelHelper = {
      addLabel: jest.fn(),
    } as any;
    container.bind(AddLabelHelper).toConstantValue(addLabelHelper);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test new PR with labels to Add', async () => {
    const addKindFromLinkedIssuesLogic = container.get(AddKindFromLinkedIssuesLogic);

    addKindFromLinkedIssuesLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddKindFromLinkedIssuesLogic.PR_EVENTS);
    const callback = registerCallbackCall[1];

    const linkedIssueLabels = ['foo', 'bar', 'kind/kind1', 'kind/kind2'];
    const existingLabels = ['baz', 'kind/kind1'];
    const issueInfo: IssueInfo = new IssueInfoBuilder().build().withLabels(linkedIssueLabels);
    const pullRequestInfo: PullRequestInfo = { linkedIssues: [issueInfo], labels: existingLabels } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should call helper
    expect(addLabelHelper.addLabel).toBeCalled();
    const addLabelHelperCall = (addLabelHelper.addLabel as jest.Mock).mock.calls[0];
    expect(addLabelHelperCall[0]).toEqual(['kind/kind2']);
  });

  test('test new PR with no label to Add', async () => {
    const addKindFromLinkedIssuesLogic = container.get(AddKindFromLinkedIssuesLogic);

    addKindFromLinkedIssuesLogic.setup();

    // check
    expect(pullRequestAction.registerCallback).toBeCalled();

    const registerCallbackCall = (pullRequestAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual(AddKindFromLinkedIssuesLogic.PR_EVENTS);
    const callback = registerCallbackCall[1];

    const linkedIssueLabels = ['foo', 'bar', 'kind/kind1'];
    const existingLabels = ['baz', 'kind/kind1'];
    const issueInfo: IssueInfo = new IssueInfoBuilder().build().withLabels(linkedIssueLabels);
    const pullRequestInfo: PullRequestInfo = { linkedIssues: [issueInfo], labels: existingLabels } as any;

    // call the callback
    await callback(pullRequestInfo);

    // Should not call helper as PR already has the linked label
    expect(addLabelHelper.addLabel).toBeCalledTimes(0);
  });
});
