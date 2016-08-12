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
    .then((project) => {
      console.log(`Generating document from file: ${path}`);
      return project;
    })
    .then(decorateData)
    .then(renderTemplate)
    // .then(logProject)
    .then(generateTestFile)
    .then(renderPDF)
    .then((project) => console.log(`PDF Generated [${project.get('pdfFile')}]`.green))
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


/**
 * Generate Test FIle
 * For making saving a html file to disk so that it can be designed in the browser
 * @param {Immutable.Map} project
 */
function generateTestFile(project) {
  let relAssets = `../templates/${project.get('template')}/assets`;
  let newAssets = project.set('html', project.get('html').replace('./assets', relAssets));
  let testPath = `${runtime.testOutput}/${project.get('template')}.html`;
  fs.writeFile(testPath, newAssets.get('html'), () => console.log(`Made test file ${testPath}`.green));
  return project;
}

/**
 * Render Template
 * @param {Immutable.Map} settings
 */
function renderTemplate(project) {
  return new Promise(handler);
  function handler(resolve, reject) {
    let projectEntry = `./templates/${project.get('template')}/main.html`;
    let projectPartials = `./templates/${project.get('template')}/partials`;
    let partials = getPartialsIn(projectPartials);
    fs.readFile(projectEntry, 'utf8', (err, data) => {
      if (err) reject(err);
      let tags = project.get('tags').toJS()
      let html = mustache.render(data, tags, partials);
      let template = project.set('html', html);
      resolve(template);
    });
  }
}

/**
 * Get Partials In...
 * @param {String} dir
 * @returns {Object} partials - empty if there are no partials
 */
function getPartialsIn(dir) {
  var partials = {};
  try {
    let partialsDir = fs.readdirSync(dir);
    partialsDir.forEach((partial) => {
      partials[partial] = fs.readFileSync(`${dir}/${partial}`, 'utf8');
    });
  } catch(e) {}
  return partials;
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
    width: '800px', // size is about that of a 'US letter'
    height: '1131px',
  };
  let pdfFile = `${runtime.pdfOutput}/${project.get('template')}s/${project.get('name')}.pdf`;
  project = project.set('pdfFile', pdfFile);
  return new Promise(handler);

  function handler(resolve, reject) {
    pdf
      .create(project.get('html'), pdfOpts)
      .toFile(pdfFile,
        (err, res) => {
          if (err) return reject(err);
          resolve(project);
        })
  }
}

/**
 * Decorate Data
 * Looks for a decorator file in ./decorate and runs the exported function
 * @param {Immutable.Map} project
 * @returns {Promise}
 */
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
