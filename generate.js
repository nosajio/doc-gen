'use strict';

const fs = require('fs');
const Immutable = require('immutable');
const mustache = require('mustache');
const colors = require('colors');
const flags = require('flags');
const pdf = require('html-pdf');

const runtime = {
  pdfOutput: './out',
  testOutput: './test',
};

run();

function run() {
  const settings = setup();
  generate(settings);
}

/**
 * Generate
 * @param {Immutable.Map} settings
 */
function generate(settings) {
  let path = settings.get('projectFile');
  openProjectFile(path)
    .then(decorateData)
    .then(renderTemplate)
    .then(generateTestFile)
    .then(renderPDF)
    .then(() => console.log('Success!!'.green))
    .catch((err) => console.error(colors.red(err)));
}

/**
 * Setup
 * For taking the setup parts and using them to generate a settings map
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
  let relAssets = `../templates/${project.get('template')}/assets`;
  project = project.set('html',
    project.get('html').replace('./assets', relAssets));
  fs.writeFile(`${runtime.testOutput}/${project.get('template')}.html`,
    project.get('html'));
  return;
}

/**
 * Render Template
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
 * Opens a passed project json file and
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
 * Takes the html property of a project and generates a pdf
 * @param {Immutable.Map} project
 */
function renderPDF(project) {
  let pdfOpts = {
    base: `file://${__dirname}/templates/${project.get('template')}/main.html`,
    width: '800px',
    height: '1131px',
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

function decorateData(project) {
  const template = project.get('template');
  try {
    const decorate = require(`./decorate/${template}.js`);
    return decorate(project);
  } catch (e) {
    return Promise.reject(e);
  }
}

function logProject(project) {
  console.log(project);
  return project;
}
