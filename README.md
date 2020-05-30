sfinder-strict-minimal
======================

[![Build Status](https://travis-ci.com/eight04/sfinder-strict-minimal.svg?branch=master)](https://travis-ci.com/eight04/sfinder-strict-minimal)
[![codecov](https://codecov.io/gh/eight04/sfinder-strict-minimal/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/sfinder-strict-minimal)
[![install size](https://packagephobia.now.sh/badge?p=sfinder-strict-minimal)](https://packagephobia.now.sh/result?p=sfinder-strict-minimal)

A post processing tool for solution-finder that generates the minimal PC solutions to cover all patterns.

Installation
------------

```
npm install -g sfinder-strict-minimal
```

Usage
-----

```
sfinder path -f csv -k pattern
sfinder-minimal < sfinder/output/path.csv
```

This tool will generate some markdown files named `path_minimal_strict_*.md` inside the current folder.

Changelog
---------

* 0.1.0 (May 30, 2020)

  - Initial release.
