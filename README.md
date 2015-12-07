contextfree.js

Reviving some old code originally written by Aza Raskin.  Modernizing it for the frontend era.

- [ ] Move CFDG grammers from index.html to JSON format
- [ ] Refactor javascript to remove textarea element manipulation from library
- [ ] Rewrite for loops using functions

To release

- Make changes
- Edit package.json version appropriately - Major version for API breaking changes, minor for new features, minor minor for bug fixes.
- git add "*"
- git commit -m "Commit message"
- git tag <package.json version number>
- git push
- git push --tags
- npm publish
- npm info <cdfg> to verify package was pushed

