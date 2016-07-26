'use strict';
const Immutable = require('immutable');
const moment = require('moment');

const hoursInADay = 7;

module.exports = invoiceDecorator;

function invoiceDecorator(project) {
  project = project.setIn(['tags', 'date'], moment().format('ll'));
  project = project.setIn(['tags', 'total'], calculateTotals(project));
  return project;
}

function calculateTotals(project) {
  let totalHrs = 0;
  let dayRate = project.getIn(['tags', 'dayrate']);
  project.getIn(['tags', 'work']).forEach((it) => {
   totalHrs += it.get('hours');
  });
  let totalDays = (totalHrs / hoursInADay).toFixed(3);
  return Immutable.fromJS({
    hours: totalHrs,
    days: Math.round(totalDays*10)/10,
    cost: (totalDays * dayRate).toFixed(2),
  });
}
