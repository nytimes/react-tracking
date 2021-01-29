<p align="center"><img src="https://cdn-images-1.medium.com/max/1600/1*DKS5pYfsAz-H45myvnWWVw.gif" style="max-width:75%;"></p>

# react-tracking [![npm version](https://badge.fury.io/js/react-tracking.svg)](https://badge.fury.io/js/react-tracking)

- React specific tracking library, usable as a higher-order component (as `@decorator` or directly), or as a React Hook
- Compartmentalize tracking concerns to individual components, avoid leaking across the entire app
- Expressive and declarative (in addition to imperative) API to add tracking to any React app
- Analytics platform agnostic

Read more in the [Times Open blog post](https://open.nytimes.com/introducing-react-tracking-declarative-tracking-for-react-apps-2c76706bb79a).

If you just want a quick sandbox to play around with:

[![Edit react-tracking example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/reacttracking-example-qk30j4x1zj)

## Installation

```
npm install --save react-tracking
```

## Usage

```js
import track, { useTracking } from 'react-tracking';
```

Both `@track()` and `useTracking()` expect two arguments, `trackingData` and `options`.

- `trackingData` represents the data to be tracked (or a function returning that data)
- `options` is an optional object that accepts three properties (the object passed to the decorator also accepts a fourth `forwardRef` property):
  - `dispatch`, which is a function to use instead of the default dispatch behavior. See the section on custom `dispatch()` [below](https://github.com/nytimes/react-tracking#custom-optionsdispatch-for-tracking-data).
  - `dispatchOnMount`, when set to `true`, dispatches the tracking data when the component mounts to the DOM. When provided as a function will be called in a useEffect on the component's initial render with all of the tracking context data as the only argument.
  - `process`, which is a function that can be defined once on some top-level component, used for selectively dispatching tracking events based on each component's tracking data. See more details [below](https://github.com/nytimes/react-tracking#top-level-optionsprocess).
  - `forwardRef` (decorator/HoC only), when set to `true`, adding a ref to the wrapped component will actually return the instance of the underlying component. Default is `false`.

#### `tracking` prop

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

The `useTracking` hook returns an object with this same shape, plus a `<Track />` component that you use to wrap your returned markup to pass contextual data to child components.

### Usage with React Hooks

We can access the `trackEvent` method via the `useTracking` hook from anywhere in the tree:

```js
import { useTracking } from 'react-tracking';

const FooPage = () => {
  const { Track, trackEvent } = useTracking({ page: 'FooPage' });

  return (
    <Track>
      <div
        onClick={() => {
          trackEvent({ action: 'click' });
        }}
      />
    </Track>
  );
};
```

The `useTracking` hook returns an object with the same `getTrackingData()` and `trackEvent()` methods that are provided as `props.tracking` when wrapping with the `@track()` decorator/HoC (more info about the decorator can be found [below](https://github.com/nytimes/react-tracking#usage-as-a-decorator)). It also returns an additional property on that object: a `<Track />` component that can be returned as the root of your component's sub-tree to pass any new contextual data to its children.

> Note that in most cases you would wrap the markup returned by your component with `<Track />`. This will merge a new tracking context and make it available to all child components. The only time you _wouldn't_ wrap your returned markup with `<Track />` is if you're on some leaf component and don't have any more child components that need tracking info.

```js
import { useTracking } from 'react-tracking';

const Child = () => {
  const { trackEvent } = useTracking();

  return (
    <div
      onClick={() => {
        trackEvent({ action: 'childClick' });
      }}
    />
  );
};

const FooPage = () => {
  const { Track, trackEvent } = useTracking({ page: 'FooPage' });

  return (
    <Track>
      <Child />
      <div
        onClick={() => {
          trackEvent({ action: 'click' });
        }}
      />
    </Track>
  );
};
```

In the example above, the click event in the `FooPage` component will dispatch the following data:
```
{
  page: 'FooPage',
  action: 'click',
}
```
Because we wrapped the sub-tree returned by `FooPage` in `<Track />`, the click event in the `Child` component will dispatch:
```
{
  page: 'FooPage',
  action: 'childClick',
}
```

### Usage as a Decorator

The default `track()` export is best used as a `@decorator()` using the [babel decorators plugin](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy).

The decorator can be used on React Classes and on methods within those classes. If you use it on methods within these classes, make sure to decorate the class as well.

_**Note:** In order to decorate class property methods within a class, as shown in the example below, you will need to enable [loose mode](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties#loose) in the [babel class properties plugin](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)._

```js
import React from 'react';
import track from 'react-tracking';

@track({ page: 'FooPage' })
export default class FooPage extends React.Component {

  @track({ action: 'click' })
  handleClick = () => {
    // ... other stuff
  };

  render() {
    return <button onClick={this.handleClick}>Click Me!</button>;
  }
}
```

### Usage on Stateless Functional Components

You can also track events by importing `track()` and wrapping your stateless functional component, which will provide `props.tracking.trackEvent()` that you can call in your component like so:

```js
import track from 'react-tracking';

const FooPage = props => {
  return (
    <div
      onClick={() => {
        props.tracking.trackEvent({ action: 'click' });

        // ... other stuff
      }}
    />
  );
};

export default track({
  page: 'FooPage',
})(FooPage);
```

_This is also how you would use this module without `@decorator` syntax, although this is obviously awkward and the decorator syntax is recommended._

### Custom `options.dispatch()` for tracking data

By default, data tracking objects are pushed to `window.dataLayer[]` (see [src/dispatchTrackingEvent.js](src/dispatchTrackingEvent.js)). This is a good default if you use Google Tag Manager. You can override this by passing in a dispatch function as a second parameter to the tracking decorator `{ dispatch: fn() }` on some top-level component high up in your app (typically some root-level component that wraps your entire app).

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

This can also be done in a functional component using the `useTracking` hook:

```js
import React from 'react';
import { useTracking } from 'react-tracking';

export default function App({ children }) {
  const { Track } = useTracking({}, { dispatch: data => window.myCustomDataLayer.push(data) });

  return <Track>{children}</Track>;
}
```

NOTE: It is recommended to do this on some top-level component so that you only need to pass in the dispatch function once. Every child component from then on will use this dispatch function.

### When to use `options.dispatchOnMount`

You can pass in a second parameter to `@track`, `options.dispatchOnMount`. There are two valid types for this, as a boolean or as a function. The use of the two is explained in the next sections:

#### Using `options.dispatchOnMount` as a boolean

To dispatch tracking data when a component mounts, you can pass in `{ dispatchOnMount: true }` as the second parameter to `@track()`. This is useful for dispatching tracking data on "Page" components, for example.

```js
@track({ page: 'FooPage' }, { dispatchOnMount: true })
class FooPage extends Component { ... }
```

<details>
<summary>Example using hooks</summary>

```js
function FooPage() {
  useTracking({ page: 'FooPage' }, { dispatchOnMount: true });
}
```

</details>

Will dispatch the following data (assuming no other tracking data in context from the rest of the app):

```
{
  page: 'FooPage'
}
```

Of course, you could have achieved this same behavior by just decorating the `componentDidMount()` lifecycle event yourself, but this convenience is here in case the component you're working with would otherwise be a stateless functional component or does not need to define this lifecycle method.

_Note: this is only in effect when decorating a Class or stateless functional component. It is not necessary when decorating class methods since any invocations of those methods will immediately dispatch the tracking data, as expected._

#### Using `options.dispatchOnMount` as a function

If you pass in a function, the function will be called with all of the tracking data from the app's context when the component mounts. The return value of this function will be dispatched in `componentDidMount()`. The object returned from this function call will be merged with the context data and then dispatched.

A use case for this would be that you want to provide extra tracking data without adding it to the context.

```js
@track({ page: 'FooPage' }, { dispatchOnMount: (contextData) => ({ event: 'pageDataReady' }) })
class FooPage extends Component { ... }
```

<details>
<summary>Example using hooks</summary>

```js
function FooPage() {
  useTracking({ page: 'FooPage' }, { dispatchOnMount: (contextData) => ({ event: 'pageDataReady' }) });
}
```

</details>

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
@track({}, { process: (ownTrackingData) => ownTrackingData.page ? { event: 'pageview' } : null })
class App extends Component {...}

...

@track({ page: 'Page1' })
class Page1 extends Component {...}

@track({})
class Page2 extends Component {...}
```

<details>
<summary>Example using hooks</summary>

```js
function App() {
  const { Track } = useTracking(
    {},
    {
      process: (ownTrackingData) => ownTrackingData.page ? { event: 'pageview' } : null,
    }
  );

  return (
    <Track>
      <Page1 />
      <Page2 />
    </Track>
  );
}

function Page1() {
  useTracking({ page: 'Page1' });
}

function Page2() {
  useTracking({});
}
```

</details>

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

You can also pass a function as an argument instead of an object literal, which allows for some advanced usage scenarios such as when your tracking data is a function of some runtime values, like so:

```js
import React from 'react';
import track from 'react-tracking';

// In this case, the "page" tracking data
// is a function of one of its props (isNew)
@track(props => {
  return { page: props.isNew ? 'new' : 'existing' };
})
export default class FooButton extends React.Component {
  // In this case the tracking data depends on
  // some unknown (until runtime) value
  @track((props, state, [event]) => ({
    action: 'click',
    label: event.currentTarget.title || event.currentTarget.textContent,
  }))
  handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  };

  render() {
    return <button onClick={this.handleClick}>{this.props.children}</button>;
  }
}
```

NOTE: That the above code utilizes some of the newer ES6 syntax. This is what it would look like in ES5:

```js
// ...
  @track(function(props, state, args) {
    const event = args[0];
    return {
      action: 'click',
      label: event.currentTarget.title || event.currentTarget.textContent
    };
  })
// ...
```

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

### Accessing data stored in the component's `props` and `state`

Further runtime data, such as the component's `props` and `state`, are available as follows:

```js
  @track((props, state) => ({
    action: state.following ? "unfollow clicked" : "follow clicked",
    name: props.name
  }))
  handleFollow = () => {
     this.setState({ following: !this.state.following })
    }
  }
```

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

Note that if you want to do something like the above example using the `useTracking` hook, you will likely want to memoize the `randomId` value, since otherwise you will get a different value each time the component renders:

```js
import React, { useMemo } from 'react';
import { useTracking } from 'react-tracking';

export default function AdComponent() {
  const randomId = useMemo(() => Math.floor(Math.random() * 100), []);
  const { getTrackingData } = useTracking({ page_view_id: randomId });
  const { page_view_id } = getTrackingData();

  return <Ad pageViewId={page_view_id} />;
}
```

### Tracking Data

Note that there are no restrictions on the objects that are passed in to the decorator or hook.

**The format for the tracking data object is a contract between your app and the ultimate consumer of the tracking data.**

This library simply merges the tracking data objects together (as it flows through your app's React component hierarchy) into a single object that's ultimately sent to the tracking agent (such as Google Tag Manager).

### TypeScript Support

You can get the type definitions for React Tracking from DefinitelyTyped using `@types/react-tracking`. For an always up-to-date example of syntax, you should consult [the react-tracking type tests](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-tracking/test/react-tracking-with-types-tests.tsx).

### PropType support

The `props.tracking` PropType is exported for use, if desired:

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
