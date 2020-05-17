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

export class InversifyBinding {
  private container: Container;

  constructor(private writeToken: string) {}

  public initBindings(): Container {
    this.container = new Container();

        // token
        this.container.bind(OctokitBuilder).toSelf().inSingletonScope();

        const writeOctokit = this.container.get(OctokitBuilder).build(this.writeToken);
        this.container.bind(Octokit).toConstantValue(writeOctokit).whenTargetNamed('WRITE_TOKEN');
        
    // action
    this.container.bind(IssueCommentAction).toSelf().inSingletonScope();
    this.container.bind(IssueCommentListener).toService(IssueCommentAction);

    // handler
    this.container.bind(Handler).to(IssueCommentHandler).inSingletonScope();

    // helper
    this.container.bind(RemoveLabelHelper).toSelf().inSingletonScope();

    // logic
    this.container.bind(RemoveLifeCycleStaleLogic).toSelf().inSingletonScope();

    // Analyze
    this.container.bind(Analysis).toSelf().inSingletonScope();



    return this.container;
  }
}
