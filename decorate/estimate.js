'use strict';
const Immutable = require('immutable');
const moment = require('moment');

const hoursInADay = 7;

module.exports = invoiceDecorator;

function invoiceDecorator(project) {
  // let todaysDate = moment().format('ll'); // eg: Jul 8, 2016
  // let totalCost = 0;
  // project
  //   .getIn(['tags', 'work'])
  //   .forEach((it) => totalCost += it.get('cost'));
  //
  // let work = project
  //   .getIn(['tags', 'work'])
  //   .map((it) => {
  //     let updated = it.set('cost', it.get('cost').toFixed(2));
  //     return updated;
  //   });
  //
  // project = project.mergeIn(['tags', 'work'], work);
  //
  // let updatedProject = project.mergeIn(['tags'], {
  //   date: todaysDate,
  //   totalcost: totalCost,
  // });
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
