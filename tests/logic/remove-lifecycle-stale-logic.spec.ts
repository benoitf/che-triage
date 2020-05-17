import 'reflect-metadata';

import { Container } from 'inversify';
import { IssueCommentAction } from '../../src/actions/issue-comment-action';
import { RemoveLabelHelper } from '../../src/helpers/remove-label-helper';
import { RemoveLifeCycleStaleLogic } from '../../src/logic/remove-lifecycle-stale-logic';

describe('Test Logic RemoveLifeCycleStale', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(RemoveLifeCycleStaleLogic).toSelf().inSingletonScope();
  });

  test('test not execute', async () => {
    const issueCommentAction: IssueCommentAction = {
      registerIssueCommentCommand: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    container.bind(IssueCommentAction).toConstantValue(issueCommentAction);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeLabelHelper: RemoveLabelHelper = {
      removeLabel: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    container.bind(RemoveLabelHelper).toConstantValue(removeLabelHelper);

    const removeLifeCycleStale = container.get(RemoveLifeCycleStaleLogic);
    removeLifeCycleStale.setup();

    // check
    expect(issueCommentAction.registerIssueCommentCommand).toBeCalled();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerIssueCommentCommandCall = (issueCommentAction as any).registerIssueCommentCommand.mock.calls[0];

    expect(registerIssueCommentCommandCall[0]).toEqual(RemoveLifeCycleStaleLogic.REMOVE_LIFECYCLE_STALE_COMMAND);

    const callback = registerIssueCommentCommandCall[1];

    const issueInfo = jest.fn();
    // call the callback
    await callback(issueInfo);

    // now check the other mock, removeLabelHelper
    expect(removeLabelHelper.removeLabel).toBeCalled();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const removeLabelHelperCall = (removeLabelHelper as any).removeLabel.mock.calls[0];
    // check label to remove
    expect(removeLabelHelperCall[0]).toEqual(RemoveLifeCycleStaleLogic.LABEL_TO_REMOVE);
    // should be the parameter given as input
    expect(removeLabelHelperCall[1]).toEqual(issueInfo);
  });
});
