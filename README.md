sfinder-strict-minimal
======================

An interactive post processing tool for [solution-finder](https://github.com/knewjade/solution-finder/issues/2) that generates the minimal PC solutions to cover all patterns.

![screenshot](https://i.imgur.com/0zWeZ1t.png)

Install
-------

```
npm install -g sfinder-strict-minimal
```

Usage
-----

Using the classic PC opener for example:
https://knewjade.github.io/fumen-for-mobile/#?d=v115@9gC8EeE8DeF8CeG8DeC8JeAgH

```
sfinder path -f csv -k pattern -t v115@9gC8EeE8DeF8CeG8DeC8JeAgH --patterns I,*!
sfinder-minimal output/path.csv
```

This tool will generate a markdown file named `path_minimal_strict.md` inside the current folder.

[A demo of PC opener](demo.md)

Changelog
---------

* 0.3.0 (Feb 21, 2025)

  - Change: update fumen-svg-server endpoint.
  - Bump dependencies.

* 0.2.0 (Jun 1, 2020)

  - **Breaking: cli is changed.**
  - **Breaking: add interactive prompt to find the best set, now the tool only outputs one file.**
  - Improve performance.

* 0.1.0 (May 30, 2020)

  - Initial release.
