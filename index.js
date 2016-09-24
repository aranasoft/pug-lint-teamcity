function escapeTeamCityString(message) {
  if (message === null) {
    return '';
  }
  return message.replace(/\|/g, '||')
    .replace(/'/g, '|\'')
    .replace(/\n/g, '|n')
    .replace(/\r/g, '|r')
    .replace(/\u0085/g, '|x')
    .replace(/\u2028/g, '|l')
    .replace(/\u2029/g, '|p')
    .replace(/\[/g, '|[')
    .replace(/\]/g, '|]');
}

function groupByFilename(reports) {
  var groups = {};
  reports.forEach(function (value) {
    var key = value.filename;
    groups[key] = groups[key] || [];
    groups[key].push(value);
  });
  return Object.keys(groups).map(function (key) {
    return {filename: key, errors: groups[key]};
  });
}

function prepareResults(results) {
  if (!((results !== null) && results.length > 0)) {
    return [];
  }
  return results.map(function (error) {
    return {
      name: error.code + ': line ' + error.line + ':' + error.column,
      message: error.msg,
      detailed: 'Message: ' + error.msg + '\nDescription: ' + error.toString()
    };
  });
}

function publish(errorReport) {
  print('progressStart \'Running PugLint\'');
  var reports = groupByFilename(errorReport);
  for (var i = 0, len = reports.length; i < len; i++) {
    var ref = reports[i];
    var filename = ref.filename;
    var results = ref.errors;
    reportFile(filename, results);
  }
  print('progressFinish \'Running PugLint\'');
}

function reportFile(filename, results) {
  var errors = prepareResults(results);
  var suite = 'PugLint: ' + filename;
  print('testSuiteStarted', {
    name: suite
  });
  for (var i = 0, len = errors.length; i < len; i++) {
    var error = errors[i];
    print('testStarted', {
      name: error.name
    });
    print('testFailed', error);
    print('testFinished', {
      name: error.name
    });
  }
  print('testSuiteFinished', {
    name: suite
  });
}

function print(message, attrs) {
  var log = message;
  if (typeof attrs === 'object') {
    log = Object.keys(attrs).reduce(function (l, key) {
      return l + ' ' + key + '=\'' + escapeTeamCityString(attrs[key]) + '\'';
    }, log);
  }
  return console.log('##teamcity[' + log + ']');
}

module.exports = (function () {
  function TeamCityReporter(report) {
    publish(report);
  }

  return TeamCityReporter;
})();
