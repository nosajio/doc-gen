'use strict';

const fs = require('fs');
const Immutable = require('immutable');
const mustache = require('mustache');
const flags = require('flags');

const runtime = {
  pdfOutput: './out',
};

run();

function run() {
  const settings = setup();
  generate(settings);
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
  return Immutable.Map({
    projectFile: `./projects/${flags.get('project')}.json`,
  });
}

/**
 * Render Template
 * @description
 * @param {Immutable.Map} settings
 */
function renderTemplate(project) {
  return new Promise(handler);
  function handler(resolve, reject) {
    fs.readFile(project.get('template'), 'utf8', (err, data) => {
      if (err) reject(err);
      let template = project.set('html', mustache.render(data, project.get('tags')));
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
    resolve(Immutable.Map(project));
  }
}

/**
 * Render PDF
 * @description Takes the html property of a project and generates a pdf
 * @param {Immutable.Map} project
 */
function renderPDF(project) {

}

/**
 * Generate
 * @description
 * @param {Immutable.Map} settings
 */
function generate(settings) {
  let path = settings.get('projectFile');
  openProjectFile(path)
    .then(renderTemplate)
    .then((project) => console.log(project))
    // .then(renderPDF)
    .catch((err) => console.log(err));
}
