import { ContainerModule, interfaces } from 'inversify';

import { IssueAction } from './issue-action';
import { IssueCommentAction } from './issue-comment-action';
import { IssueCommentListener } from '../api/issue-comment-listener';
import { IssueListener } from '../api/issue-listener';
import { PullRequestAction } from './pull-request-action';
import { PullRequestListener } from '../api/pull-request-listener';

const actionsModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(IssueCommentAction).toSelf().inSingletonScope();
  bind(IssueCommentListener).toService(IssueCommentAction);

  bind(IssueAction).toSelf().inSingletonScope();
  bind(IssueListener).toService(IssueAction);

  bind(PullRequestAction).toSelf().inSingletonScope();
  bind(PullRequestListener).toService(PullRequestAction);
});

export { actionsModule };
