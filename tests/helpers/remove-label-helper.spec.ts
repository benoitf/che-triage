import 'reflect-metadata';

import { Container } from 'inversify';
import { IssueInfo } from '../../src/info/issue-info';
import { Octokit } from '@octokit/rest';
import { RemoveLabelHelper } from '../../src/helpers/remove-label-helper';

describe('Test Helper RemoveLabelHelper', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.bind(RemoveLabelHelper).toSelf().inSingletonScope();
  });

  // check with label existing
  test('test call correct API', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit: any = { issues: { deleteLabel: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const removeLabelHelper = container.get(RemoveLabelHelper);

    const labelToRemove = 'foo';
    const issueInfo: IssueInfo = new IssueInfo(123, 'my-owner', 'repository', [labelToRemove]);

    await removeLabelHelper.removeLabel(labelToRemove, issueInfo);

    expect(octokit.issues.deleteLabel).toBeCalled();
    const params: Octokit.IssuesRemoveLabelParams = octokit.issues.deleteLabel.mock.calls[0][0];

    expect(params.name).toBe(labelToRemove);
    expect(params.issue_number).toBe(issueInfo.number);
    expect(params.owner).toBe(issueInfo.owner);
    expect(params.repo).toBe(issueInfo.repo);
  });

  // check if label does not exist on the issue
  test('test skip call API', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit: any = { issues: { deleteLabel: jest.fn() } };

    container.bind(Octokit).toConstantValue(octokit);
    const removeLabelHelper = container.get(RemoveLabelHelper);

    const labelToRemove = 'baz';

    // issue has not the label to remove
    const issueInfo: IssueInfo = new IssueInfo(123, 'my-owner', 'repository', ['foo', 'bar']);

    await removeLabelHelper.removeLabel(labelToRemove, issueInfo);

    expect(octokit.issues.deleteLabel).toBeCalledTimes(0);
  });
});
