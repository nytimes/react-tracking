/* eslint-disable import/imports-first */
/* The polyfill for requestAnimationFrame must come first */
import './rafPolyfill';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({
  adapter: new Adapter(),
});

export { shallow, mount };
