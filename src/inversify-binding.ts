import 'reflect-metadata';

import { Analysis } from './analysis';
import { Container } from 'inversify';
import { Logic } from './api/logic';
import { Octokit } from '@octokit/rest';
import { OctokitBuilder } from './github/octokit-builder';
import { actionsModule } from './actions/actions-module';
import { apisModule } from './api/apis-module';
import { fetchersModule } from './fetchers/fetchers-module';
import { handlersModule } from './handler/handlers-module';
import { helpersModule } from './helpers/helpers-module';
import { infosModule } from './info/infos-module';
import { logicModule } from './logic/logic-module';

export class InversifyBinding {
  private container: Container;

  constructor(private writeToken: string, private readToken: string) {}

  public initBindings(): Container {
    this.container = new Container();

    this.container.load(actionsModule);
    this.container.load(apisModule);
    this.container.load(fetchersModule);
    this.container.load(handlersModule);
    this.container.load(helpersModule);
    this.container.load(infosModule);
    this.container.load(logicModule);

    // token
    this.container.bind(OctokitBuilder).toSelf().inSingletonScope();
    const writeOctokit = this.container.get(OctokitBuilder).build(this.writeToken);
    this.container.bind(Octokit).toConstantValue(writeOctokit).whenTargetNamed('WRITE_TOKEN');

    const readOctokit = this.container.get(OctokitBuilder).build(this.readToken);
    this.container.bind(Octokit).toConstantValue(readOctokit).whenTargetNamed('READ_TOKEN');

    // Analyze
    this.container.bind(Analysis).toSelf().inSingletonScope();

    // resolve all logics to create instances
    this.container.getAll(Logic);

    return this.container;
  }
}
