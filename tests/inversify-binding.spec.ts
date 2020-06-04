import 'reflect-metadata';

import { AddCheMilestoneOnMergedPRLogic } from '../src/logic/add-che-milestone-on-merged-pr-logic';
import { AddCommentHelper } from '../src/helpers/add-comment-helper';
import { AddKindFromLinkedIssuesLogic } from '../src/logic/add-kind-from-linked-issue';
import { AddLabelHelper } from '../src/helpers/add-label-helper';
import { AddMilestoneHelper } from '../src/helpers/add-milestone-helper';
import { AddReactionCommentHelper } from '../src/helpers/add-reaction-comment-helper';
import { AddStatusTriageLogic } from '../src/logic/add-status-triage';
import { AddWelcomeFirstIssueLogic } from '../src/logic/add-welcome-first-issue';
import { AddWelcomeFirstPRLogic } from '../src/logic/add-welcome-first-pr';
import { Analysis } from '../src/analysis';
import { CheVersionFetcher } from '../src/fetchers/che-version-fetcher';
import { CloseIssueHelper } from '../src/helpers/close-issue-helper';
import { Container } from 'inversify';
import { CronAddStaleIssuesLogic } from '../src/logic/cron-add-stale-issues';
import { CronCloseStaleIssuesLogic } from '../src/logic/cron-close-stale-issues';
import { Handler } from '../src/api/handler';
import { InversifyBinding } from '../src/inversify-binding';
import { IssueAction } from '../src/actions/issue-action';
import { IssueCommentAction } from '../src/actions/issue-comment-action';
import { IssueCommentHandler } from '../src/handler/issue-comment-handler';
import { IssueCommentInfoBuilder } from '../src/info/issue-comment-info';
import { IssueCommentListener } from '../src/api/issue-comment-listener';
import { IssueHandler } from '../src/handler/issue-handler';
import { IssueInfoBuilder } from '../src/info/issue-info';
import { IssueListener } from '../src/api/issue-listener';
import { IssuesHelper } from '../src/helpers/issue-helper';
import { Logic } from '../src/api/logic';
import { OctokitBuilder } from '../src/github/octokit-builder';
import { PullRequestAction } from '../src/actions/pull-request-action';
import { PullRequestHandler } from '../src/handler/pull-request-handler';
import { PullRequestHelper } from '../src/helpers/pull-request-helper';
import { PullRequestInfoBuilder } from '../src/info/pull-request-info';
import { PullRequestListener } from '../src/api/pull-request-listener';
import { RemoveLabelHelper } from '../src/helpers/remove-label-helper';
import { RemoveLifeCycleStaleLogic } from '../src/logic/remove-lifecycle-stale-logic';
import { ScheduleHandler } from '../src/handler/schedule-handler';
import { ScheduleListener } from '../src/api/schedule-listener';
import { TemplateReader } from '../src/template/template-reader';

describe('Test InversifyBinding', () => {
  test('test bindings', async () => {
    const inversifyBinding = new InversifyBinding('foo', 'bar');
    const container: Container = inversifyBinding.initBindings();

    expect(inversifyBinding).toBeDefined();

    // check all actions
    const issueCommentAction = container.get(IssueCommentAction);
    expect(issueCommentAction).toBeDefined();
    const issueCommentListeners: IssueCommentListener[] = container.getAll(IssueCommentListener);
    expect(issueCommentListeners).toBeDefined();
    expect(issueCommentListeners.includes(issueCommentAction)).toBeTruthy();

    const issueAction = container.get(IssueAction);
    expect(issueAction).toBeDefined();
    const issueListeners: IssueListener[] = container.getAll(IssueListener);
    expect(issueListeners).toBeDefined();
    expect(issueListeners.includes(issueAction)).toBeTruthy();

    const pullRequestAction = container.get(PullRequestAction);
    expect(pullRequestAction).toBeDefined();
    const pullRequestListeners: PullRequestListener[] = container.getAll(PullRequestListener);
    expect(pullRequestListeners).toBeDefined();
    expect(pullRequestListeners.includes(pullRequestAction)).toBeTruthy();

    // Handler
    const handlers: Handler[] = container.getAll(Handler);
    expect(handlers.find(handler => handler.constructor.name === IssueCommentHandler.name)).toBeTruthy();
    expect(handlers.find(handler => handler.constructor.name === IssueHandler.name)).toBeTruthy();
    expect(handlers.find(handler => handler.constructor.name === PullRequestHandler.name)).toBeTruthy();
    expect(handlers.find(handler => handler.constructor.name === ScheduleHandler.name)).toBeTruthy();

    const scheduleListeners: ScheduleListener[] = container.getAll(ScheduleListener);
    expect(scheduleListeners).toBeDefined();
    expect(scheduleListeners.find(listener => listener.constructor.name === CronAddStaleIssuesLogic.name)).toBeTruthy();
    expect(scheduleListeners.find(listener => listener.constructor.name === CronCloseStaleIssuesLogic.name)).toBeTruthy();

    // fetcher
    expect(container.get(CheVersionFetcher)).toBeDefined();

    // helpers
    expect(container.get(AddCommentHelper)).toBeDefined();
    expect(container.get(AddLabelHelper)).toBeDefined();
    expect(container.get(AddMilestoneHelper)).toBeDefined();
    expect(container.get(AddReactionCommentHelper)).toBeDefined();
    expect(container.get(IssuesHelper)).toBeDefined();
    expect(container.get(PullRequestHelper)).toBeDefined();
    expect(container.get(RemoveLabelHelper)).toBeDefined();
    expect(container.get(CloseIssueHelper)).toBeDefined();

    // check all info
    expect(container.get(IssueInfoBuilder)).toBeDefined();
    expect(container.get(IssueCommentInfoBuilder)).toBeDefined();
    expect(container.get(PullRequestInfoBuilder)).toBeDefined();

    // fetcher
    expect(container.get(TemplateReader)).toBeDefined();

    // logic
    const logics: Logic[] = container.getAll(Logic);
    expect(logics).toBeDefined();
    expect(logics.find(logic => logic.constructor.name === AddCheMilestoneOnMergedPRLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === AddStatusTriageLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === AddWelcomeFirstIssueLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === AddWelcomeFirstPRLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === RemoveLifeCycleStaleLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === AddKindFromLinkedIssuesLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === CronAddStaleIssuesLogic.name)).toBeTruthy();
    expect(logics.find(logic => logic.constructor.name === CronCloseStaleIssuesLogic.name)).toBeTruthy();

    const octokitBuilder = container.get(OctokitBuilder);
    expect(octokitBuilder).toBeDefined();

    const analysis = container.get(Analysis);
    expect(analysis).toBeDefined();
  });
});
