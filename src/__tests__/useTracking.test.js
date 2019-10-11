/* eslint-disable jsx-a11y/control-has-associated-label */
import { mount } from 'enzyme';
import React from 'react';
import { renderToString } from 'react-dom/server';
import track from '../withTrackingComponentDecorator';
import useTracking from '../useTracking';

describe('useTracking', () => {
  it('throws error if tracking context not present', () => {
    const ThrowMissingContext = () => {
      useTracking();
      return <div>hi</div>;
    };
    try {
      renderToString(<ThrowMissingContext />);
    } catch (error) {
      expect(error.message).toContain(
        'Attempting to call `useTracking` without a ReactTrackingContext present'
      );
    }
  });

  it('dispatches tracking events from a useTracking hook tracking object', () => {
    const outerTrackingData = {
      page: 'Page',
    };

    const dispatch = jest.fn();

    const App = track(outerTrackingData, { dispatch })(() => {
      const tracking = useTracking();

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
    });

    const wrapper = mount(<App />);
    wrapper.simulate('click');
    expect(dispatch).toHaveBeenCalledWith({
      ...outerTrackingData,
      event: 'buttonClick',
    });
  });
});
