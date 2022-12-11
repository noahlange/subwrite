# subwriter

A tiny (~2kb), writer-first, minimally-invasive DSL for token substitution in long-form text. You can think of it as a presentation layer for writers working with randomly-generated data. **subwriter** strictly separates the text from the content generation process. By way of constrast, [Tracery](https://github.com/galaxykate/tracery) hybridizes the two.

**subwriter** is designed to be as minimal as possible, and reserves only 5 characters (`[ { | } ]`), with 1 additional character (`=`) reserved within filter declarations. Anything else is fair game as content or as an identifier.

Including emojis, because why not.

## Why?

- unreadable text is hard to write and even harder to proofread
- because for large amounts of text content, content-as-content is better than content-as-code
- sometimes `sprintf-js` just doesn't cut it and pulling in a real templating language is overkill

## Requirements

- an environment with support for `Intl.Segmenter`,

## Example

```ts
const data = {
  '🦸‍♀️': { name: 'Sally' }
};

const ctx = {
  // filters are functions that take source text and an optional param.
  PRP: (glyph, caps = true) => {
    const res = [...glyph].includes('♀') ? 'she' : 'he';
    return caps ? res.toLocaleString() : res;
  }
};

sub("Isn't that {🦸‍♀️.name}? Is [🦸‍♀️|PRP=false] a superhero?", data, ctx);
// Isn't that Sally? Is she a superhero?
```

## Features

| Feature            | Example                     | Output       |
| :----------------- | :-------------------------- | ------------ |
| Interpolation      | `{name}`                    | World        |
| Property Access    | `{data.name}`               | Bob          |
| Filters            | `{data.name\|cap}`          | BOB          |
| Filters (Params)   | `{data.name\|pre=123}`      | 123Bob       |
| Filters (Chained)  | `{data.name\|cap\|pre=123}` | 123BOB       |
| Filter Expressions | `[bobbbbbb!\|cap\|pre=123]` | 123BOBBBBBB! |
| Nesting            | `[Hello {name}!\|cap]`      | HELLO WORLD! |

Numbers, strings and booleans are passed as such to filters. Both `null` and `undefined` filter args are passed as `undefined` to support default parameters.

Property access, filters, &c., are evaluated left to right.

## Non-features

- dynamic properties
- control flow
- conditional logic
- transclusion
- RNG
- anything else

## Priorities/Principles

1. Be readable.
2. Be writeable.
3. Minimize conflicts between syntax and real-world prose.
4. Minimize conflicts between syntax and Markdown.
5. When in doubt, _use a filter_.

```js
import { sub } from 'subwriter';

// properties -> "His name is Bob."
sub(`His name is {name}.`, { name: 'Bob' });

// complex objects
const data = {
  PRP$: 'His',
  name: {
    first: 'Bob',
    last: 'Bobbertson',
    get full(): string {
      return `${this.first} ${this.last}`;
    }
  }
};

// nested properties, accessors -> "his name is Bob Bobbertson."
sub('{PRP$} name is {name.full}.', data);

// filters!
const filters = {
  max: (str, chars) => str.slice(0, chars),
  case: (str, method = 'toUpperCase') => str[method]?.()
};

// filters -> "his name is Bo."
sub(`{PRP$} name is {name.first|max=2}.`, data, filters);

// filters with default params -> "His name is Bob."
sub(`{PRP$|case} name is {name.first}`, data, filters);

// chained filters -> "His name is BO."
sub(`{PRP$} name is {name.first|case|max=2}`, data, filters);
```

```ts
class Person {
  public glyph = '👨‍🎨';
  public first_name = 'Art';
  public last_name = 'Artman';
  public gender = 'M';
  public get name() {
    return `${this.first_name} ${this.last_name}`;
  }
}

// "His name is Art Artman. He's the real deal."
sub(
  `{👨‍🎨|PRP$} name is {👨‍🎨.name}. {👨‍🎨|PRP}'s the real deal.`,
  { '👨‍🎨': new Person() },
  {
    PRP$: person => ({ M: 'His', F: 'Her' }[person.gender] ?? 'Its'),
    PRP: person => ({ M: 'He', F: 'She' }[person.gender] ?? 'It')
  }
);
```

## Inspiration

A good chunk of my inspiration here came from reading the tutorials on creating new content for the game Wildermyth, though it could be more accurately described as "counter-inspiration."

Some sample text using Wildermyth's text interpolation DSL.

```
<leader> takes a long, appraising look at <hothead>.
<leader.mf:He/She> wipes a fleck of bluish ooze off <leader.mf:his/her> nose.
```

And the equivalent using **subwriter** and emojis.

```
{🫡} takes a long, appraising look at {😡}.
{🫡|He} wipes a fleck of bluish ooze off {🫡|his} nose.
```

A more complex example using Wildermyth's "splits":

```
<leader.goofball/bookish:
Surprise everyone! It's fightin' time!
/Ahem. Our foes appear to have arrived.>
```

Which resolves to:

> Ahem. Our foes appear to have arrived.

And the corresponding **subwriter** source, which resolves to the same text (after trimming).

```
[Surprise, everyone! It's fightin' time!|leader=🤪]
[Ahem. Our foes appear to have arrived.|leader=🤓]
```
