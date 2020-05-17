import { injectable, multiInject, optional } from 'inversify';

import { Context } from '@actions/github/lib/context';
import { Handler } from './api/handler';

@injectable()
export class Analysis {
  @optional()
  @multiInject(Handler)
  protected readonly handlers: Handler[];

  async analyze(context: Context): Promise<void> {
    for await (const handler of this.handlers) {
      if (handler.supports(context.eventName)) {
        console.log('handler', handler, 'supports', context.eventName);
        console.log('calling with ', context.eventName, 'payload', context.payload);
        await handler.handle(context.eventName, context.payload);
      }
    }
  }
}
