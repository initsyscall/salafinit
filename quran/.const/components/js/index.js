import { route } from './router.js';

const QuranView = {
  render: function(container, params = {}) {
    route(container, params);
  }
};

window.QuranView = QuranView;

export default QuranView;