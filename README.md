# document-search

- Clone the repository
- `cd html; ddev start`
- `cd ../`
- `gulp`

Site will be available at: [document-search.ddev.site]()

`gulp` rebuilds the site entirely.

`gulp build` does a limited build for use by continuous integration.

Continuous integration is set up at
[CircleCI](https://app.circleci.com/pipelines/github/ourhiddenhistory).

Main branch changes deploy to
[ourhiddenhistory.org](https://ourhiddenhistory.org).

Others deploy to
[b.ourhiddenhistory.org](https://b.ourhiddenhistory.org).

`sh deploy.sh` will deploy directly to the website, bypassing CI.

Connects to Elasticsearch index at api.ourhiddenhistory.org.
