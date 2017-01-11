# nyt-react-tracking

## Motivation

- React specific tracking library, to be shared across teams.
- Reduce development cost to add tracking to a codebase.
- Expressive and declarative (as opposed to imperative) API to add tracking.


## Installation

```
npm install --save nytm/nyt-react-tracking#v0.8.2
```

(Or whatever is [latest](https://github.com/nytm/nyt-react-tracking/releases), it was 0.8.2 as of this writing)

## Usage

`nyt-react-tracking` is best used as a `@decorator()` using the [babel decorators plugin](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy).

There are two decorator functions:
  - `withTracking()` which works on React Classes, and
  - `trackEvent()` which decorates methods within those classes.


```js
import React from 'react';
import { withTracking, trackEvent } from 'nyt-react-tracking';

@withTracking({ page: 'FooPage' })
export default class FooPage extends React.Component {

  @trackEvent({ action: 'click' })
  handleClick = () => {
    // ... other stuff
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click Me!
      </button>
    );
  }
}
```

### Usage on Stateless Functional Components

You can also track events by importing `withTracking()` and wrapping your stateless functional component, which will provide `props.trackEvent()` that you can call in your component like so:

```js
import { withTracking } from 'nyt-react-tracking';

const FooPage = (props) => {
  return (
    <div onClick={() => {
        props.trackEvent({ action: 'click' });

        // ... other stuff
      }}
    />
  )
}

export default withTracking({
  page: 'FooPage'
})(FooComponent);
```

This is also how you would use this module without `@decorators`, although this is obviously awkward and the  decorator syntax is recommended.


### Advanced Usage

Both `withTracking()` and `trackEvent()` also accept a function as an argument which allows for some advanced usage scenarios such as when your tracking data is a function of some runtime values, like so:

```js
import React from 'react';
import { withTracking, trackEvent } from 'nyt-react-tracking';

// In this case, the "page" tracking data
// is a function of one of its props (isNew)
@withTracking((props) => {
  return { page: props.isNew ? 'new' : 'existing' }
})
export default class FooButton extends React.Component {

  // In this case the tracking data depends on
  // some unknown (until runtime) value
  @trackEvent((props, [event]) => ({
    action: 'click',
    label: event.currentTarget.title || event.currentTarget.textContent
  }))
  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.props.children}
      </button>
    );
  }

}
```

### Tracking Data

Note that there are no restrictions on the objects that are passed in to either `withTracking()` or `trackEvent()`.

**The format for the tracking data object is a contract between your app and the ultimate consumer of the tracking data.**

This library simply merges the tracking data objects together (as it flows through your app's React component hierarchy) into a single object that's ultimately sent to the tracking library.

### Roadmap

- Figure out a way to have only one decorator (not `withTracking()` & `trackEvent()`, but just one)
- Babel plugin ?
