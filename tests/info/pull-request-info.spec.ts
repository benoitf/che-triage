import 'reflect-metadata';

import { Container } from 'inversify';
import { IssuesHelper } from '../../src/helpers/issue-helper';
import { PullRequestInfoBuilder } from '../../src/info/pull-request-info';
import { PullRequestInfoLinkedIssuesExtractor } from '../../src/info/pull-request-info-linked-issues-extractor';

describe('Test PullRequestInfo', () => {
  let container: Container;

  let pullRequestInfoLinkedIssuesExtractor: PullRequestInfoLinkedIssuesExtractor;
  let issuesHelper: IssuesHelper;

  beforeEach(() => {
    container = new Container();
    pullRequestInfoLinkedIssuesExtractor = {
      extract: jest.fn(),
    } as any;
    container.bind(PullRequestInfoLinkedIssuesExtractor).toConstantValue(pullRequestInfoLinkedIssuesExtractor);

    issuesHelper = {
      getIssue: jest.fn(),
    } as any;
    container.bind(IssuesHelper).toConstantValue(issuesHelper);

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
