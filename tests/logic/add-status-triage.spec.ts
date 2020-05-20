/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

import { AddLabelHelper } from '../../src/helpers/add-label-helper';
import { AddStatusTriageLogic } from '../../src/logic/add-status-triage';
import { AddWelcomeFirstPRLogic } from '../../src/logic/add-welcome-first-pr';
import { Container } from 'inversify';
import { IssueAction } from '../../src/actions/issue-action';
import { IssueInfo } from '../../src/info/issue-info';

describe('Test Logic AddStatusTriage', () => {
  let container: Container;
  let issueAction: IssueAction;
  let addLabelHelper: AddLabelHelper;

  beforeEach(() => {
    container = new Container();
    container.bind(AddStatusTriageLogic).toSelf().inSingletonScope();

    issueAction = {
      registerCallback: jest.fn(),
    } as any;
    container.bind(IssueAction).toConstantValue(issueAction);

    addLabelHelper = {
      addLabel: jest.fn(),
    } as any;
    container.bind(AddLabelHelper).toConstantValue(addLabelHelper);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test new issue', async () => {
    const addStatusTriageLogic = container.get(AddStatusTriageLogic);

    addStatusTriageLogic.setup();

    // check
    expect(issueAction.registerCallback).toBeCalled();
    const registerCallbackCall = (issueAction as any).registerCallback.mock.calls[0];

    expect(registerCallbackCall[0]).toEqual([AddWelcomeFirstPRLogic.PR_EVENT]);
    const callback = registerCallbackCall[1];

    const issueInfo: IssueInfo = jest.fn() as any;

    // call the callback
    await callback(issueInfo);

    expect(addLabelHelper.addLabel).toBeCalled();
    const addCommentCall = (addLabelHelper as any).addLabel.mock.calls[0];
    expect(addCommentCall[0]).toEqual([AddStatusTriageLogic.LABEL_TO_ADD]);
    expect(addCommentCall[1]).toBe(issueInfo);
  });
});
