import 'reflect-metadata';

import { Analysis } from './analysis';
import { Container } from 'inversify';
import { Handler } from './api/handler';
import { IssueCommentAction } from './actions/issue-comment-action';
import { IssueCommentHandler } from './handler/issue-comment-handler';
import { IssueCommentListener } from './api/issue-comment-listener';
import { Octokit } from '@octokit/rest';
import { OctokitBuilder } from './github/octokit-builder';
import { RemoveLabelHelper } from './helpers/remove-label-helper';
import { RemoveLifeCycleStaleLogic } from './logic/remove-lifecycle-stale-logic';
import { bindMultiInjectProvider } from './api/multi-inject-provider';
import { Logic } from './api/logic';

export class InversifyBinding {
  private container: Container;

  constructor(private writeToken: string) {}

  public initBindings(): Container {
    this.container = new Container();

    bindMultiInjectProvider(this.container, Handler);
    bindMultiInjectProvider(this.container, IssueCommentListener);
    bindMultiInjectProvider(this.container, Logic);

    // action
    this.container.bind(IssueCommentAction).toSelf().inSingletonScope();
    this.container.bind(IssueCommentListener).toService(IssueCommentAction);

    // helper
    this.container.bind(RemoveLabelHelper).toSelf().inSingletonScope();

    // logic 
    this.container.bind(RemoveLifeCycleStaleLogic).toSelf().inSingletonScope();
    this.container.bind(Logic).toService(RemoveLifeCycleStaleLogic);

        
    // token
    this.container.bind(OctokitBuilder).toSelf().inSingletonScope();

    const writeOctokit = this.container.get(OctokitBuilder).build(this.writeToken);
    this.container.bind(Octokit).toConstantValue(writeOctokit).whenTargetNamed('WRITE_TOKEN');

    // handler
    this.container.bind(Handler).to(IssueCommentHandler).inSingletonScope();

    // Analyze
    this.container.bind(Analysis).toSelf().inSingletonScope();
    
    // resolve all logics to create instances
    this.container.getAll(Logic);

    return this.container;
  }
}
