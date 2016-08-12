'use strict';
const moment = require('moment');

module.exports = contractDecorator;

function contractDecorator(contract) {
  var tags = contract.get('tags');
  // Manage whether the contract is being sent from / to a company
  if (! tags.getIn(['to', 'company'])) {
    tags = tags.setIn(['to', 'company'], tags.getIn(['to', 'human']))
      .setIn(['to', 'isCompany'], false)
      .setIn(['to', 'notCompany'], true);
  } else {
    tags = tags.setIn(['to', 'isCompany'], true)
      .setIn(['to', 'notCompany'], false);
  }

  if (! tags.getIn(['from', 'company'])) {
    tags = tags.setIn(['from', 'company'], tags.getIn(['from', 'human']))
      .setIn(['from', 'isCompany'], false)
      .setIn(['from', 'notCompany'], true);
  } else {
    tags = tags.setIn(['from', 'isCompany'], true)
      .setIn(['from', 'notCompany'], false);
  }

  let dottedline = Array(70).join('.');
  tags = tags.set('date', moment().format('ll')) // Aug 12, 2016
  tags = tags.set('dottedline', dottedline);
  return contract.set('tags', tags);
}
