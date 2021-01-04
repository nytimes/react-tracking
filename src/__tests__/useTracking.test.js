/* eslint-disable jsx-a11y/control-has-associated-label */
import { mount } from 'enzyme';
import React from 'react';
import { renderToString } from 'react-dom/server';
import useTracking from '../useTracking';

describe('useTracking', () => {
  it('does not throw an error if tracking context not present', () => {
    const ThrowMissingContext = () => {
      useTracking();
      return <div>hi</div>;
    };

    expect(() => {
      try {
        renderToString(<ThrowMissingContext />);
      } catch (error) {
        throw new Error(error);
      }
    }).not.toThrow();
  });

  it('dispatches tracking events from a useTracking hook tracking object', () => {
    const outerTrackingData = {
      page: 'Page',
    };

    const dispatch = jest.fn();

    const App = () => {
      const tracking = useTracking(outerTrackingData, { dispatch });

      expect(tracking.getTrackingData()).toEqual({
        page: 'Page',
      });

      return (
        <button
          type="button"
          onClick={() =>
            tracking.trackEvent({
              event: 'buttonClick',
            })
          }
        />
      );
    };

    const wrapper = mount(<App />);
    wrapper.simulate('click');
    expect(dispatch).toHaveBeenCalledWith({
      ...outerTrackingData,
      event: 'buttonClick',
    });
  });
});
