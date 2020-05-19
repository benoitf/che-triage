import 'reflect-metadata';

import { Container } from 'inversify';
import { IssueInfoBuilder } from '../../src/info/issue-info';

describe('Test IssueInfo', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(IssueInfoBuilder).toSelf().inSingletonScope();
  });

  test('test info', async () => {
    const issueInfoBuilder = container.get(IssueInfoBuilder);
    expect(issueInfoBuilder).toBeDefined();

    const htmlLink = 'http://foo';

    const pullRequestInfo = issueInfoBuilder.build().withHtmlLink(htmlLink);

    expect(pullRequestInfo.htmlLink).toBe(htmlLink);
  });
});
