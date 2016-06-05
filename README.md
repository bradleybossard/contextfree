contextfree.js

[![Travis](https://img.shields.io/travis/bradleybossard/contextfree.svg)](https://travis-ci.org/bradleybossard/contextfree)

Reviving some old code originally written by Aza Raskin.  Modernizing it for the frontend era.

- [ ] Add pdiff tests for the renderer
- [ ] Add some control for recursion stack depth
- [ ] Write SVG renderer

To release

- Make changes
- Edit package.json version appropriately - Major version for API breaking changes, minor for new features, minor minor for bug fixes.
- git add -A 
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
- git add -A 
- git commit -m "Commit message"
- git tag <package.json version number (with 0beta.0)>
- git push
- git push --tags
- npm publish --tag beta
- npm info <cdfg> to verify package was pushed, release will still point to stable, new beta will point to beta version
- npm install cfdg@beta to use in a project


## Notes

* [nearley - potential parser replacement](http://nearley.js.org/)
