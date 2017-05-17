import PropTypes from 'prop-types';

export default {
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }),
};
