import { ContainerModule, interfaces } from 'inversify';

import { IssueCommentListener } from '../api/issue-comment-listener';
import { IssueListener } from '../api/issue-listener';
import { PullRequestListener } from '../api/pull-request-listener';
import { bindMultiInjectProvider } from '../api/multi-inject-provider';

const apisModule = new ContainerModule((bind: interfaces.Bind) => {
  bindMultiInjectProvider(bind, IssueCommentListener);
  bindMultiInjectProvider(bind, IssueListener);
  bindMultiInjectProvider(bind, PullRequestListener);
});

export { apisModule };
