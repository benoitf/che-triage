import { ContainerModule, interfaces } from 'inversify';

import { AddCommentHelper } from './add-comment-helper';
import { AddLabelHelper } from './add-label-helper';
import { AddMilestoneHelper } from './add-milestone-helper';
import { AddReactionCommentHelper } from './add-reaction-comment-helper';
import { CloseIssueHelper } from './close-issue-helper';
import { IssuesHelper } from './issue-helper';
import { PullRequestHelper } from './pull-request-helper';
import { RemoveLabelHelper } from './remove-label-helper';

const helpersModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(AddCommentHelper).toSelf().inSingletonScope();
  bind(AddLabelHelper).toSelf().inSingletonScope();
  bind(AddMilestoneHelper).toSelf().inSingletonScope();
  bind(AddReactionCommentHelper).toSelf().inSingletonScope();
  bind(IssuesHelper).toSelf().inSingletonScope();
  bind(PullRequestHelper).toSelf().inSingletonScope();
  bind(RemoveLabelHelper).toSelf().inSingletonScope();
  bind(CloseIssueHelper).toSelf().inSingletonScope();
});

export { helpersModule };
