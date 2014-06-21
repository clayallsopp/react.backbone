var ReactTools = require('react-tools');
module.exports = {
  process: function(src) {
    var result = ReactTools.transform(src);
    return result;
  }
};