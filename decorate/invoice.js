'use strict';
const moment = require('moment');

module.exports = invoiceDecorator;

function invoiceDecorator(project) {
  let todaysDate = moment().format('ll'); // eg: Jul 8, 2016
  let totalCost = 0;
  project
    .getIn(['tags', 'work'])
    .forEach((it) => totalCost += it.get('cost'));

  let work = project
    .getIn(['tags', 'work'])
    .map((it) => {
      let updated = it.set('cost', it.get('cost').toFixed(2));
      return updated;
    });

  project = project.mergeIn(['tags', 'work'], work);

  let updatedProject = project.mergeIn(['tags'], {
    date: todaysDate,
    totalcost: totalCost,
  });
  return updatedProject;
}
