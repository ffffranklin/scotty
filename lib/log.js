module.exports = function log() {
  return console.log.apply(null, arguments);
};
