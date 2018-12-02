<p align="center"><img src="https://cdn-images-1.medium.com/max/1600/1*DKS5pYfsAz-H45myvnWWVw.gif" style="max-width:75%;"></p>

# react-tracking [![npm version](https://badge.fury.io/js/react-tracking.svg)](https://badge.fury.io/js/react-tracking)

- React specific tracking library, usable as a higher-order component (as `@decorator` or directly)
- Compartmentalize tracking concerns to individual components, avoid leaking across the entire app
- Expressive and declarative (as opposed to imperative) API to add tracking to any React app
- Analytics platform agnostic

Read more in the [Times Open blog post](https://open.nytimes.com/introducing-react-tracking-declarative-tracking-for-react-apps-2c76706bb79a).

If you just want a quick sandbox to play around with:

[![Edit qk30j4x1zj](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/qk30j4x1zj)

## Installation

```
npm install --save react-tracking
```

## Usage

`@track()` expects two arguments, `trackingData` and `options`.

- `trackingData` represents the data to be tracked (or a function returning that data)
- `options` is an optional object that accepts three properties:
  - `dispatch`, which is a function to use instead of the default dispatch behavior. See the section on custom `dispatch()` later in this document.
  - `dispatchOnMount`, when set to `true`, dispatches the tracking data when the component mounts to the DOM. When provided as a function will be called on componentDidMount with all of the tracking context data as the only argument.
  - `process`, which is a function that can be defined once on some top-level component, used for selectively dispatching tracking events based on each component's tracking data. See more details later in this document.

#### Tracking `props`

The `@track()` decorator will expose a `tracking` prop on the component it wraps, that looks like:

```js
{
  // tracking prop provided by @track()
  tracking: PropTypes.shape({
    // function to call to dispatch tracking events
    trackEvent: PropTypes.func,

    // function to call to grab contextual tracking data
    getTrackingData: PropTypes.func,
  });
}
```

This PropType is exported for use, if desired:

```js
import { TrackingPropType } from 'react-tracking';
```

Alternatively, if you want to just silence proptype errors when using [eslint react/prop-types](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md), you can add this to your eslintrc:

```json
{
  "rules": {
    "react/prop-types": ["error", { "ignore": ["tracking"] }]
  }
}
```

#### Common patterns
Let's say we have a top-level component **App**.Component **Page** works as class component and nests function component **Tabs** which only contains ui logic.                     
It's easy to track whole application to use `track` as **decorator** or **HOC**.

```js
import React from 'react';
import ReactDOM from 'react-dom';
import track from 'react-tracking';
const dependencies = ['react', 'react-dom', 'react-tracing'];
const Tabs = (clickHander = () => {}) => (
  <ul>
    {
      dependencies.map((lib, index) =>
        <li
          key={index}
          onClick={() => {clickHandler(index);}}>
        {lib}
        </li>
      )
    }
  </ul>
);

/**
 * Use track as class decorator for class component.
 * You must decorate class if you want to decorate a class method!
 */
@track({ page: 'decorator-page' })
class Page extends Component {
  state = {
    index: 0,
    count: 0,
  }
  /**
   * Use track to decorate class method.
   * TrackingData works as function type.
   */
  @track((props, state) => ({
    event: 'click-me',
    count: state.count + 1,
  }))
  updateClickMeCounts() {
    this.setState({ count: this.state.count + 1 });
  }

  // Use arguments passed to class method.
  @track((props, state, methodArgs) =>({
    event: 'click-depencies-tabs',
    lastIndex: state.index,
    currentIndex: methodArgs[0],
  })
  clickTab(index) {
    this.setState({ index: index });
  }

  render() {
    return (
      <section>
        <button onClick={this.updateClickMeCounts}>Click Me</button>
        <Tabs clickHander={this.clickTab.bind(this)} />
      </section>
    );
  }
}

const App = () => (
  <div>
    <Page />
  </div>
);
// Use track as HOC for stateless function component.
const TrackedApp = track({ app: 'my-app' })(App);

ReactDOM.render(<TrackedApp />, document.getElementById('root'));
```

When react-traking tab first clicked, we will get tracking data objects shapes like:
```js
{
  app: 'my-app',
  page: 'decorator-page',
  event: 'click-depencies-tabs',
  lastIndex: 0,
  currentIndex: 2,
}
```
NOTE: 
- Tracking data objects pushed to `window.dataLayer[]` in default(see [src/dispatchTrackingEvent.js](src/dispatchTrackingEvent.js)).This is a good default if you use Google Tag Manager.
- Decorate class if you want to decorate class method!                                 

#### Custom `options.dispatch()` for tracking data
 You can make own dipatch method by passing in a dispatch function as a second parameter to the tracking decorator `{ dispatch: fn() }` on some top-level component high up in your app (typically some root-level component that wraps your entire app).

For example, to push objects to `window.myCustomDataLayer[]` instead, you would decorate your top-level `<App />` component like this:

```js
import React, { Component } from 'react';
import track from 'react-tracking';

@track({}, { dispatch: data => window.myCustomDataLayer.push(data) })
export default class App extends Component {
  render() {
    return this.props.children;
  }
}
```

NOTE: It is recommended to do this on some top-level component so that you only need to pass in the dispatch function once. Every child component from then on will use this dispatch function.

#### When to use `options.dispatchOnMount`

You can pass in a second parameter to `@track`, `options.dispatchOnMount`. There are two valid types for this, as a boolean or as a function. The use of the two is explained in the next sections:

#### Using `options.dispatchOnMount` as a boolean

To dispatch tracking data when a component mounts, you can pass in `{ dispatchOnMount: true }` as the second parameter to `@track()`. This is useful for dispatching tracking data on "Page" components, for example.

```js
@track({ page: 'FooPage' }, { dispatchOnMount: true })
class FooPage extends Component { ... }
```

Will dispatch the following data (assuming no other tracking data in context from the rest of the app):

```
{
  page: 'FooPage'
}
```

Of course, you could have achieved this same behavior by just decorating the `componentDidMount()` lifecycle event yourself, but this convenience is here in case the component you're working with would otherwise be a stateless functional component or does not need to define this lifecycle method.

_Note: this is only in affect when decorating a Class or stateless functional component. It is not necessary when decorating class methods since any invocations of those methods will immediately dispatch the tracking data, as expected._

#### Using `options.dispatchOnMount` as a function

If you pass in a function, the function will be called with all of the tracking data from the app's context when the component mounts. The return value of this function will be dispatched in `componentDidMount()`. The object returned from this function call will be merged with the context data and then dispatched.

A use case for this would be that you want to provide extra tracking data without adding it to the context.

```js
@track({ page: 'FooPage' }, { dispatchOnMount: (contextData) => ({ event: 'pageDataReady' }) })
class FooPage extends Component { ... }
```

Will dispatch the following data (assuming no other tracking data in context from the rest of the app):

```
{
  event: 'pageDataReady',
  page: 'FooPage'
}
```

### Top level `options.process`

When there's a need to implicitly dispatch an event with some data for _every_ component, you can define an `options.process` function. This function should be declared once, at some top-level component. It will get called with each component's tracking data as the only argument. The returned object from this function will be merged with all the tracking context data and dispatched in `componentDidMount()`. If a falsy value is returned (`false`, `null`, `undefined`, ...), nothing will be dispatched.

A common use case for this is to dispatch a `pageview` event for every component in the application that has a `page` property on its `trackingData`:

```js
@track({}, { process: (ownTrackingData) => ownTrackingData.page ? {event: 'pageview'} : null })
class App extends Component {...}

...

@track({page: 'Page1'})
class Page1 extends Component {...}

@track({})
class Page2 extends Component {...}
```

When `Page1` mounts, event with data `{page: 'Page1', event: 'pageview'}` will be dispatched.
When `Page2` mounts, nothing will be dispatched.

### Tracking Asynchronous Methods

Asynchronous methods (methods that return promises) can also be tracked when the method has resolved or rejects a promise. This is handled transparently, so simply decorating an asynchronous method the same way as a normal method will make the tracking call _after_ the promise is resolved or rejected.

```js
// ...
  @track()
  async handleEvent() {
    return await asyncCall(); // returns a promise
  }
// ...
```

Or without async/await syntax:

```js
// ...
  @track()
  handleEvent() {
    return asyncCall(); // returns a promise
  }
```

### Advanced Usage
When tracking asynchronous methods, you can also receive the resolved or rejected data from the returned promise in the fourth argument of the function passed in for tracking:

```js
// ...
  @track((props, state, methodArgs, [{ value }, err]) => {
    if (err) { // promise was rejected
      return {
        label: 'async action',
        status: 'error',
        value: err
      };
    }
    return {
      label: 'async action',
      status: 'success',
      value // value is "test"
    };
  })
  handleAsyncAction(data) {
    // ...
    return Promise.resolve({ value: 'test' });
  }
// ...
```

If the function returns a falsy value (e.g. `false`, `null` or `undefined`) then the tracking call will not be made.

#### Example `props.tracking.getTrackingData()` usage

Any data that is passed to the decorator can be accessed in the decorated component via its props. The component that is decorated will be returned with a prop called `tracking`. The `tracking` prop is an object that has a `getTrackingData()` method on it. This method returns all of the contextual tracking data up until this point in the component hierarchy.

```js
import React from 'react';
import track from 'react-tracking';

// Pass a function to the decorator
@track(() => {
  const randomId = Math.floor(Math.random() * 100);

  return {
    page_view_id: randomId,
  };
})
export default class AdComponent extends React.Component {
  render() {
    const { page_view_id } = this.props.tracking.getTrackingData();

    return <Ad pageViewId={page_view_id} />;
  }
}
```

### Tracking Data

Note that there are no restrictions on the objects that are passed in to the decorator.

**The format for the tracking data object is a contract between your app and the ultimate consumer of the tracking data.**

This library simply merges the tracking data objects together (as it flows through your app's React component hierarchy) into a single object that's ultimately sent to the tracking library.

### TypeScript Support

You can get the type definitions for React Tracking from DefinitelyTyped using `@types/react-tracking`. For an always up-to-date example of syntax, you should consult [the react-tracking type tests](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-tracking/test/react-tracking-with-types-tests.tsx).
