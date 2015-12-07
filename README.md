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
- npm install cfdg to use in a project

To release a beta version

- Make changes
- Edit package.json with version -beta.<beta-version-release> i.e. "version": "1.4.0-beta.0",
- git add "*"
- git commit -m "Commit message"
- git tag <package.json version number (with 0beta.0)>
- git push
- git push --tags
- npm publish --tag beta
- npm info <cdfg> to verify package was pushed, release will still point to stable, new beta will point to beta version
- npm install cfdg@beta to use in a project
