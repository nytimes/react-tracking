# Contributing

First, thank you for contributing! 🎉

## Local Development

The local development workflow is fairly straightfowrad:

1. Fork the repo and then git clone your fork locally (be sure to work on a new branch, not on your `master` branch)
1. `npm install`
1. `npm run test:watch` this will run the tests in watch mode

## Testing against your own app

If you'd like to test out a local version of `react-tracking` in an app you're using it in, you can:

1. Add `react-tracking` to your project (`npm i react-tracking`)
1. `npm install` in your local checkout of react-tracking
1. `npm link` in react-tracking
1. `npm link react-tracking` in the project you want to use it in
1. `npm run build:watch` in react-tracking to run the watcher to get updates as you develop

Then you'll be pointing at the local checkout of react-tracking to test your changes from within your app.
