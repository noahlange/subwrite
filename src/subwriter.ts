import { AnyObject, Filters } from './types';
import { render } from './render';
import { TOKEN, tokenize } from './tokenize';
import { parse } from './parse';

interface SubwriterOptions {
  tokens?: string;
  throws?: boolean;
  ctx?: Filters;
}

const tokenList = [
  TOKEN.VAR_START,
  TOKEN.VAR_END,
  TOKEN.GROUP_START,
  TOKEN.GROUP_END,
  TOKEN.FILTER,
  TOKEN.PARAM
];

export function configure(options?: SubwriterOptions) {
  const o = Object.assign({ tokens: '{}[]|=', throws: false, ctx: {} }, options);
  const tokens = tokenList.reduce(
    (a, token, i) => ({ ...a, [o.tokens[i]]: token }),
    {} as Record<string, TOKEN>
  );

  return (text: string, data: AnyObject = {}, ctx: Filters = {}): string => {
    try {
      return render(parse(tokenize(text, tokens)), data, Object.assign(ctx, o.ctx));
    } catch (e) {
      const message = `Failed to sub string "${text}".`;
      if (o.throws) {
        throw new Error(message);
      } else {
        console.error(message);
      }
      return '';
    }
  };
}
