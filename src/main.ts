import * as core from '@actions/core';
import * as github from '@actions/github';

import { Analysis } from './analysis';
import { InversifyBinding } from './inversify-binding';

export class Main {
  public static readonly WRITE_TOKEN: string = 'write-token';

  protected async doStart(): Promise<void> {
    // github write token
    const writeToken = core.getInput(Main.WRITE_TOKEN);
    if (!writeToken) {
      throw new Error('No Token provided');
    }

    const inversifyBinbding = new InversifyBinding(writeToken);
    const container = inversifyBinbding.initBindings();
    const analysis = container.get(Analysis);
    await analysis.analyze(github.context);

    // now execute
    const endTime = new Date().toTimeString();
    core.setOutput('time', endTime);
  }

  async start(): Promise<boolean> {
    try {
      await this.doStart();
      return true;
    } catch (error) {
      core.setFailed(error.message);
      return false;
    }
  }
}
