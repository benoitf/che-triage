import 'reflect-metadata';

import { Container } from 'inversify';
import { PullRequestInfoBuilder } from '../../src/info/pull-request-info';

describe('Test PullRequestInfo', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(PullRequestInfoBuilder).toSelf().inSingletonScope();
  });

  test('test info', async () => {
    const pullRequestInfoBuilder = container.get(PullRequestInfoBuilder);
    expect(pullRequestInfoBuilder).toBeDefined();

    const mergingBranch = 'my-custom-branch';
    const mergedState = true;

    const pullRequestInfo = pullRequestInfoBuilder
      .build()
      .withMergingBranch(mergingBranch)
      .withMergedState(mergedState);

    expect(pullRequestInfo.mergingBranch).toBe(mergingBranch);
    expect(pullRequestInfo.merged).toBe(mergedState);
  });
});
