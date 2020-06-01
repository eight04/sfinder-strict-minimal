sfinder-strict-minimal
======================

[![Build Status](https://travis-ci.com/eight04/sfinder-strict-minimal.svg?branch=master)](https://travis-ci.com/eight04/sfinder-strict-minimal)
[![codecov](https://codecov.io/gh/eight04/sfinder-strict-minimal/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/sfinder-strict-minimal)
[![install size](https://packagephobia.now.sh/badge?p=sfinder-strict-minimal)](https://packagephobia.now.sh/result?p=sfinder-strict-minimal)

An interactive post processing tool for [solution-finder](https://github.com/knewjade/solution-finder/issues/2) that generates the minimal PC solutions to cover all patterns.

![screenshot](https://i.imgur.com/0zWeZ1t.png)

Install
-------

```
npm install -g sfinder-strict-minimal
```

Usage
-----

```
sfinder path -f csv -k pattern
sfinder-minimal output/path.csv
```

This tool will generate a markdown file named `path_minimal_strict.md` inside the current folder.

[A demo using O-based ikcco PC](demo.md)

Changelog
---------

* 0.2.0 (Jun 1, 2020)

  - **Breaking: cli is changed.**
  - **Breaking: add interactive prompt to find the best set, now the tool only outputs one file.**
  - Improve performance.

* 0.1.0 (May 30, 2020)

  - Initial release.
