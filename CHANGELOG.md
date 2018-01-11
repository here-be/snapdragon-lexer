# Release history

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<details>
  <summary><strong>Guiding Principles</strong></summary>

- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- Versions and sections should be linkable.
- The latest version comes first.
- The release date of each versions is displayed.
- Mention whether you follow Semantic Versioning.

</details>

<details>
  <summary><strong>Types of changes</strong></summary>

Changelog entries are classified using the following labels _(from [keep-a-changelog](http://keepachangelog.com/)_):

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

</details>


## [3.0.0] - 2018-01-11

### Breaking changes

- removed `lexer.last()`
- bumped [snapdragon-stack](https://github.com/here-be/snapdragon-stack), which has replaced all getters with methods that must be called.

## [2.0.0] - 2018-01-08

### Breaking changes

The following changes were made in an effort to make the API closer to other popular parsing libraries, such as babel and acorn. 

- Renamed `token.val` to `token.value` 
- `lexer.loc.column` was changed from a 1-index number to a 0-index number
- `.current` is now a property set by the `.handle()` method. The value of `lexer.current` is whatever is returned by a handler.
- `.prev()` now returns the previously lexed token
- `.push()`

## Added

- If `lexer.options.mode` is set to `character`, `lexer.advance()` will consume and return a single character each time it's called, instead of iterating over the handlers.
- the `token.match` array is now decorated with a `.consumed` property, which is the value of `lexer.consumed` _before_ the match was created.
- adds `lexer.stack` for tracking opening/closing structures
- adds `lexer.stash` for storing an array of strings (in addition to `lexer.tokens`, which stores objects)
- adds `.append`
- adds `.skipWhile`
- adds `.skipSpaces`

## [1.0.0] - 2017-11-30

- run update
- update code comments, add `.skipType` method
- add examples
- update metadata and urls

[3.0.0]: https://github.com/here-be/snapdragon-lexer/compare/3.0.0...2.0.0
[2.0.0]: https://github.com/here-be/snapdragon-lexer/compare/2.0.0...1.0.0
[1.0.0]: https://github.com/here-be/snapdragon-lexer/compare/1.0.0...0.1.0
[keep-a-changelog]: https://github.com/olivierlacan/keep-a-changelog

