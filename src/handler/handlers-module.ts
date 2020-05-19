import { ContainerModule, interfaces } from 'inversify';

import { Handler } from '../api/handler';
import { IssueCommentHandler } from './issue-comment-handler';
import { IssueHandler } from './issue-handler';
import { PullRequestHandler } from './pull-request-handler';
import { bindMultiInjectProvider } from '../api/multi-inject-provider';

const handlersModule = new ContainerModule((bind: interfaces.Bind) => {
  bindMultiInjectProvider(bind, Handler);
  bind(Handler).to(IssueCommentHandler).inSingletonScope();
  bind(Handler).to(IssueHandler).inSingletonScope();
  bind(Handler).to(PullRequestHandler).inSingletonScope();
});

export { handlersModule };
