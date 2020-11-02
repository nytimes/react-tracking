/* eslint-disable jsx-a11y/control-has-associated-label */
import { mount } from 'enzyme';
import React from 'react';
import useTracking from '../useTracking';

describe('useTracking', () => {
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
