export class IssueInfo {
  
  constructor(
    private issueNumber: number,
    private ownerName: string,
    private repository: string,
    private labels: string[]
  ) {}

  public get repo(): string {
    return this.repository;
  }

  public get owner(): string {
    return this.ownerName;
  }

  public get number(): number {
    return this.issueNumber;
  }

  public hasLabel(labelName: string): boolean {
    return this.labels.includes(labelName);
  }
}
