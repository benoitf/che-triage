import { ContainerModule, interfaces } from 'inversify';

import { IssueCommentInfoBuilder } from './issue-comment-info';
import { IssueInfoBuilder } from './issue-info';
import { PullRequestInfoBuilder } from './pull-request-info';

const infosModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(IssueInfoBuilder).toSelf().inSingletonScope();
  bind(IssueCommentInfoBuilder).toSelf().inSingletonScope();
  bind(PullRequestInfoBuilder).toSelf().inSingletonScope();
});

export { infosModule };
