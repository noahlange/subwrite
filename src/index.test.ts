import { describe, expect, test } from '@jest/globals';
import { sub, subThrows } from './index';

class Person {
  public gender = 'M';
  public first_name = 'Bob';
  public last_name = 'Johnson';
  public get name() {
    return `${this.first_name} ${this.last_name}`;
  }
}

describe('basic interpolation', () => {
  test('returns non-interpolated strings unchanged', () => {
    const text = [
      'This is text without a comma.',
      `🙂 wipes a fleck of bluish ooze off 🙂's nose.`
    ];

    for (const line of text) {
      expect(sub(line)).toBe(line);
    }
  });

  test('interpolates variables', () => {
    const text = {
      before: 'I am so {mood}. I am so very, very {mood}.',
      after: 'I am so sad. I am so very, very sad.',
      data: { mood: 'sad' }
    };
    expect(sub(text.before, text.data)).toBe(text.after);
  });

  test('falls back to property name', () => {
    const text = 'I am so {mood}. I am so very, very {mood}.';
    expect(sub(text, {})).toBe(text);
  });

  test('interpolates nested properties', () => {
    const text = {
      before: 'His name is {person.name}.',
      after: 'His name is Bobby Bobbertson.',
      data: { person: { name: 'Bobby Bobbertson' } }
    };
    expect(sub(text.before, text.data)).toBe(text.after);
  });

  test('interpolates getters', () => {
    const text = {
      before: 'My motto is {motto}.',
      after: 'My motto is "I believe in a thing called love!".',
      data: {
        get motto() {
          return '"I believe in a thing called love!"';
        }
      }
    };
    expect(sub(text.before, text.data)).toBe(text.after);
  });

  test('interpolates mix of nested, non-nested properties and accessors.', () => {
    const ctx = {
      before: '{PRP$} name is {name.full}.',
      after: 'His name is Bob Bobbertson.',
      data: {
        PRP$: 'His',
        name: {
          first: 'Bob',
          last: 'Bobbertson',
          get full(): string {
            return `${this.first} ${this.last}`;
          }
        }
      }
    };

    expect(sub(ctx.before, ctx.data)).toBe(ctx.after);
  });
});

describe('filters', () => {
  test('can apply filters', () => {
    const ctx = {
      before: 'He has {STR} ({STR|mod}) Strength!',
      after: 'He has 10 (+0) Strength!',
      data: { STR: 10 },
      filters: {
        mod: (value: number): string => {
          const mod = Math.floor((value - 10) / 2);
          return mod >= 0 ? `+${mod}` : '' + mod;
        }
      }
    };

    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });

  test('can chain filters', () => {
    const ctx = {
      before: 'He has {STR|mod|enough} Strength!',
      after: 'He has enough Strength!',
      data: { STR: 10 },
      filters: {
        mod: (value: number) => Math.floor((value - 10) / 2),
        enough: (mod: number) => (mod >= 0 ? 'enough' : 'not enough')
      }
    };

    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });

  test('can apply filters to objects', () => {
    const ctx = {
      before: `{person|PRP$} name is {person.name}—{person|prp}'s the real deal.`,
      after: "His name is Bob Johnson—he's the real deal.",
      data: { person: new Person() },
      filters: {
        prp: ({ gender }: Person): string => (gender === 'M' ? 'he' : 'she'),
        PRP$: ({ gender }: Person): string => (gender === 'M' ? 'His' : 'Her')
      }
    };

    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });

  test('can apply filters to literal text', () => {
    const ctx = {
      before: "[Hi! How're you all doing?|southern]",
      after: "Howdy! How y'all doing?",
      data: {},
      filters: {
        southern: (text: string) =>
          text
            .replaceAll('Hi', 'Howdy')
            .replaceAll("How're", 'How')
            .replaceAll('you all', "y'all")
      }
    };

    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });
});

describe('groups', () => {
  test('can nest variables within groups', () => {
    const ctx = {
      before: '[Hello {name}!|cap]',
      after: 'HELLO WORLD!',
      data: {
        name: 'World'
      },
      filters: {
        cap: (str: string) => str.toUpperCase()
      }
    };
    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });

  test('can nest groups', () => {
    const LEADER = '🤓';
    const ctx = {
      before: `[
        [Surprise everyone! It's fightin' time!|leader=🤪]
        [Ahem. Our foes appear to have arrived.|leader=🤓]
        |trim
      ]`,
      after: `Ahem. Our foes appear to have arrived.`,
      filters: {
        He: () => 'He',
        his: () => 'his',
        leader: (text: string, leader: string) => (leader === LEADER ? text : '')
      }
    };
    expect(sub(ctx.before, {}, ctx.filters)).toBe(ctx.after);
  });
});

describe('emojis', () => {
  test('can use emojis as identifiers', () => {
    const LEADER = '🤓';

    const ctx = {
      text: [
        {
          before: '{🙂} takes a long, appraising look at {😡}.',
          after: 'Foo takes a long, appraising look at Bar.'
        },
        {
          before: '{🙂|He} wipes a fleck of bluish ooze off {🙂|his} nose.',
          after: 'He wipes a fleck of bluish ooze off his nose.'
        },
        {
          before: "[Surprise everyone! It's fightin' time!|leader=🙂]",
          after: ''
        },
        {
          before: '[Ahem. Our foes appear to have arrived.|leader=🤓]',
          after: 'Ahem. Our foes appear to have arrived.'
        }
      ],
      data: {
        '🙂': 'Foo',
        '😡': 'Bar',
        '🤓': 'Baz'
      },
      filters: {
        He: () => 'He',
        his: () => 'his',
        leader: (text: string, leader: string) => (leader === LEADER ? text : '')
      }
    };
    for (const text of ctx.text) {
      expect(sub(text.before, ctx.data, ctx.filters)).toBe(text.after);
    }
  });

  test('can access properties of emoji identifiers', () => {
    const ctx = {
      before: `[👨‍🎨|PRP$] name is {👨‍🎨.name}. [👨‍🎨|PRP]'s the real deal.`,
      after: "His name is Art Artman. He's the real deal.",
      data: {
        '👨‍🎨': { name: 'Art Artman' }
      },
      filters: {
        PRP: (glyph: string) => ([...glyph].includes('♀') ? 'She' : 'He'),
        PRP$: (glyph: string) => ([...glyph].includes('♀') ? 'Her' : 'His')
      }
    };

    expect(sub(ctx.before, ctx.data, ctx.filters)).toBe(ctx.after);
  });

  test('scalar filter params are coerced', () => {
    const data = {
      '🦸‍♀️': { name: 'Sally' }
    };

    const ctx = {
      // filters are functions that take source text and an optional param.
      PRP: (glyph: string, caps: boolean) => {
        const res = [...glyph].includes('♀') ? 'she' : 'he';
        return caps ? res[0].toUpperCase() + res.slice(1) : res;
      }
    };

    expect(sub("Isn't that {🦸‍♀️.name}? Is [🦸‍♀️|PRP=false] a superhero?", data, ctx)).toBe(
      "Isn't that Sally? Is she a superhero?"
    );
  });
});

describe('errors', () => {
  test('returns an empty string on failure.', () => {
    // silence error
    const _error = console.error;
    console.error = () => void 0;
    expect(() => sub('|||')).not.toThrow();
    console.error = _error.bind(console);
  });

  test('subThrow throws on error.', () => {
    expect(() => subThrows('|||')).toThrow();
  });
});
