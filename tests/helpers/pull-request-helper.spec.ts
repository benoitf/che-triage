/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import { PullRequestInfo, PullRequestInfoBuilder } from '../../src/info/pull-request-info';

import { Container } from 'inversify';
import { Octokit } from '@octokit/rest';
import { PullRequestHelper } from '../../src/helpers/pull-request-helper';

describe('Test Helper PullRequestHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(PullRequestHelper).toSelf().inSingletonScope();
  });

  test('test with firstTime true', async () => {
    const octokit: any = { search: { issues: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const prHelper = container.get(PullRequestHelper);

    const prInfo: PullRequestInfo = new PullRequestInfoBuilder()
      .build()
      .withNumber(123)
      .withAuthor('author')
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    // eslint-disable-next-line @typescript-eslint/camelcase
    const response: any = { data: { total_count: 0 } };
    (octokit.search.issues as jest.Mock).mockReturnValue(response);
    const isFirstTime: boolean = await prHelper.isFirstTimeContributor(prInfo);

    expect(octokit.search.issues).toBeCalled();
    const params: Octokit.SearchIssuesParams = octokit.search.issues.mock.calls[0][0];

    expect(params.q).toBe(`repo:${prInfo.owner}/${prInfo.repo} type:pr author:${prInfo.author}`);
    expect(params.per_page).toBe(1);

    expect(isFirstTime).toBeTruthy();
  });

  test('test with firstTime false', async () => {
    const octokit: any = { search: { issues: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const prHelper = container.get(PullRequestHelper);

    const prInfo: PullRequestInfo = new PullRequestInfoBuilder()
      .build()
      .withNumber(123)
      .withAuthor('author')
      .withOwner('my-owner')
      .withRepo('repository')
      .withNumber(1234);

    // response with count = 10, not a first time user
    // eslint-disable-next-line @typescript-eslint/camelcase
    const response: any = { data: { total_count: 10 } };
    (octokit.search.issues as jest.Mock).mockReturnValue(response);
    const isFirstTime: boolean = await prHelper.isFirstTimeContributor(prInfo);

    expect(octokit.search.issues).toBeCalled();
    const params: Octokit.SearchIssuesParams = octokit.search.issues.mock.calls[0][0];

    expect(params.q).toBe(`repo:${prInfo.owner}/${prInfo.repo} type:pr author:${prInfo.author}`);
    expect(params.per_page).toBe(1);

    expect(isFirstTime).toBeFalsy();
  });
});
