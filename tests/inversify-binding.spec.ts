import 'reflect-metadata';

import { Analysis } from '../src/analysis';
import { Container } from 'inversify';
import { Handler } from '../src/api/handler';
import { InversifyBinding } from '../src/inversify-binding';
import { IssueCommentAction } from '../src/actions/issue-comment-action';
import { IssueCommentHandler } from '../src/handler/issue-comment-handler';
import { IssueCommentListener } from '../src/api/issue-comment-listener';
import { OctokitBuilder } from '../src/github/octokit-builder';
import { RemoveLabelHelper } from '../src/helpers/remove-label-helper';
import { RemoveLifeCycleStaleLogic } from '../src/logic/remove-lifecycle-stale-logic';

describe('Test InversifyBinding', () => {
  test('test acceptance (true)', async () => {
    const inversifyBinding = new InversifyBinding('foo');
    const container: Container = inversifyBinding.initBindings();

    expect(inversifyBinding).toBeDefined();

    // check we have all objects there
    const issueCommentAction = container.get(IssueCommentAction);
    expect(issueCommentAction).toBeDefined();

    const issueCommentListeners: IssueCommentListener[] = container.getAll(IssueCommentListener);
    expect(issueCommentListeners).toBeDefined();
    expect(issueCommentListeners.includes(issueCommentAction)).toBeTruthy();

    const handlers: Handler[] = container.getAll(Handler);
    expect(handlers.find((handler) => handler.constructor.name === IssueCommentHandler.name)).toBeTruthy();

    const octokitBuilder = container.get(OctokitBuilder);
    expect(octokitBuilder).toBeDefined();

    const removeLabelHelper = container.get(RemoveLabelHelper);
    expect(removeLabelHelper).toBeDefined();

    const removeLifeCycleStaleLogic = container.get(RemoveLifeCycleStaleLogic);
    expect(removeLifeCycleStaleLogic).toBeDefined();

    const analysis = container.get(Analysis);
    expect(analysis).toBeDefined();
  });
});
