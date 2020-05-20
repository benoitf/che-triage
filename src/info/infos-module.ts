import { ContainerModule, interfaces } from 'inversify';

import { IssueCommentInfoBuilder } from './issue-comment-info';
import { IssueInfoBuilder } from './issue-info';
import { PullRequestInfoBuilder } from './pull-request-info';
import { PullRequestInfoLinkedIssuesExtractor } from './pull-request-info-linked-issues-extractor';

const infosModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(IssueInfoBuilder).toSelf().inSingletonScope();
  bind(IssueCommentInfoBuilder).toSelf().inSingletonScope();
  bind(PullRequestInfoBuilder).toSelf().inSingletonScope();
  bind(PullRequestInfoLinkedIssuesExtractor).toSelf().inSingletonScope();
});

export { infosModule };
