'use strict';

const fs = require('fs');
const moment = require('moment');
const Immutable = require('immutable');
const mustache = require('mustache');
const colors = require('colors');
const flags = require('flags');
const pdf = require('html-pdf');

const runtime = {
  pdfOutput: './out',
};

run();

function run() {
  const settings = setup();
  generate(settings);
}

/**
 * Generate
 * @description
 * @param {Immutable.Map} settings
 */
function generate(settings) {
  let path = settings.get('projectFile');
  openProjectFile(path)
    .then(augmentInvoice)
    .then(renderTemplate)
    .then(generateTestFile)
    .then(renderPDF)
    .then(() => console.log('Success!!'.green))
    .catch((err) => console.error(colors.red(err)));
}

/**
 * Setup
 * @description For taking the setup parts and using them to generate a settings map
 * @returns {Immutable.Map}
 */
function setup() {
  // Define flags
  flags.defineString('project', 'test', 'The name of the project file without the `.json`');
  flags.parse();
  // Create a run object
  return Immutable.fromJS({
    projectFile: `./projects/${flags.get('project')}.json`,
  });
}



function generateTestFile(project) {
  fs.writeFile('./templates/invoice/test.html', project.get('html'));
}

/**
 * Render Template
 * @description
 * @param {Immutable.Map} settings
 */
function renderTemplate(project) {
  return new Promise(handler);
  function handler(resolve, reject) {
    let projectEntry = `./templates/${project.get('template')}/main.html`;
    fs.readFile(projectEntry, 'utf8', (err, data) => {
      if (err) reject(err);
      let tags = project.get('tags').toJS()
      let html = mustache.render(data, tags);
      let template = project.set('html', html);
      resolve(template);
    });
  }
}

/**
 * Open Project File
 * @description Opens a passed project json file and
 * @param {Immutable.Map} settings
 * @returns {Promise.<Immutable.Map, Error>}
 */
function openProjectFile(path) {
  return new Promise(handler);
  function handler(resolve, reject) {
    let project;
    try {
      project = require(path);
    } catch(e) {
      reject(e);
    }
    resolve(Immutable.fromJS(project));
  }
}

/**
 * Render PDF
 * @description Takes the html property of a project and generates a pdf
 * @param {Immutable.Map} project
 */
function renderPDF(project) {
  let pdfOpts = {
    base: `file://${__dirname}/templates/${project.get('template')}/main.html`,
    format: 'Letter',
  };
  return new Promise(handler);

  function handler(resolve, reject) {
    pdf
      .create(project.get('html'), pdfOpts)
      .toFile(`${runtime.pdfOutput}/${project.get('name')}.pdf`,
        (err, res) => {
          if (err) return reject(err);
          resolve(project);
        })
  }
}

function augmentInvoice(project) {
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

function logProject(project) {
  console.log(project);
  return project;
}
