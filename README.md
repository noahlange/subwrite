# subwriter

A tiny (~2kb), writer-first, minimally-invasive DSL for token substitution in long-form text. You can think of it as a presentation layer for writers working with randomly-generated data. **subwriter** strictly separates the text from the content generation process. By way of constrast, [Tracery](https://github.com/galaxykate/tracery) hybridizes the two.

**subwriter** is designed to be as minimal as possible, and reserves only 5 characters (`[ { | } ]`), with 2 additional characters (`=`, `"`) reserved within filter declarations. Anything else is fair game as content or as an identifier.

&hellip;including emojis, because why not?

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

const PRP = (glyph, caps = false) => {
  const res = [...glyph].includes('♀') ? 'she' : 'he';
  return caps ? res[0].toUpperCase() + res.slice(1) : res;
};

const ctx = {
  // filters are functions that take source text and an optional param.
  he: PRP,
  she: PRP,
  He: text => PRP(text, true),
  She: text => PRP(text, true)
};

sub("Isn't that {🦸‍♀️.name}? Is [🦸‍♀️|PRP] a superhero?", data, ctx);
// Isn't that Sally? Is she a superhero?
```

## Features

Property access, filters, &c., are evaluated left to right.

| Feature                    | Example                       | Output           |
| :------------------------- | :---------------------------- | ---------------- |
| Interpolation              | `{name}`                      | World            |
| Property access            | `{data.name}`                 | Bob              |
| Filters                    | `{data.name\|cap}`            | BOB              |
| Filters (literal params)   | `{data.name\|pre=123}`        | 123Bob           |
| Filters (reference params) | `{🍾} [bottle\|s=🍾] of beer` | 1 bottle of beer |
| Chained filters            | `{data.name\|cap\|pre=123}`   | 123BOB           |
| Filter expressions         | `[bobbbbbb!\|cap\|pre=123]`   | 123BOBBBBBB!     |
| Nested expressions         | `[Hello {name}!\|cap]`        | HELLO WORLD!     |

## Filters vs. accessors

While most filters a) operate on a scalar value and an optional argument and b) return text, filters can _technically_ operate on arbitrary data and return anything—even content to be passed through additional filters. However, this increases your filters' dependency on data structure and introduces more room for runtime errors. `get()`-style accessors on your data
can be used to the same effect.

```ts
const ctx = {
  ageText: person => numberToText(person.age),
  text: num => numberToText(num)
};

const data = {
  name: 'Bob',
  age: 2,
  get ageText() {
    return numberToText(this.age);
  }
};

// Bob is two years old; good solution
sub('{person.name} is {person.age|text} years old.', data, ctx);
// Bob is two years old; passable solution
sub('{person.name} is {person.ageText} years old.', data, ctx);
// Bob is two years old; worst solution
sub('{person.name} is {person|ageText} years old.', data, ctx);
```

Because **subwrite** has no understanding of a filter's input, param or return types, it's easy
to shoot yourself in the face using a filter that expects an object with a specific structure
instead of a scalar value.

So as a general rule: if you need a param or are applying a general-purpose text operation, use
a filter. If you don't, an accessor in your data is probably better.

## Filter params

When passed as filter args, numbers and booleans are coerced from strings. Double-quoted strings are passed as literal text.

Unquoted strings are passed as their corresponding value in `data`.

Both `null` and `undefined` values given as params are passed as `undefined` to make default params more useful.

| Example            | Argument value |
| :----------------- | :------------- |
| `[foo\|bar=1]`     | `1`            |
| `[foo\|bar=true]`  | `true`         |
| `[foo\|bar]`       | `undefined`    |
| `[foo\|bar=null]`  | `undefined`    |
| `[foo\|bar="key"]` | `'key'`        |
| `[foo\|bar=key]`   | `data[key]`    |

## Non-features

- control flow, conditional logic
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
import { configure } from 'subwriter';

const sub = configure({
  tokens: '{}[]|=', // custom tokens (variable start/end, group start/end, filter, param)
  throws: true // throw on syntax errors
});

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
[Surprise, everyone! It's fightin' time!|leader="🤪"]
[Ahem. Our foes appear to have arrived.|leader="🤓"]
```

## Notes

### Use with yarn-bound

Text written with **subwriter** is partially compatible with content navigated using Yarn. Escape braces and brackets with a starting `\` and everything should work as expected. Alternatively, you can set a custom token set by creating a custom Subwriter instance. (I prefer `«` and `»` for interpolation, since `alt+\` and `alt+shift+\`. are reasonably accessible on MacOS by keyboard.)

```ts
import { Subwriter } from 'subwriter';

const { _ } = new Subwriter({ tokens: '«»‹›|=' });

_("Isn't that «player.name»?");
```
