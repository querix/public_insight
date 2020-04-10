const nfs = require('fs');
const fs = require('fs-extra');
const chip = require('child_process');
const path = require('path');
const defaultTempDir = '.CssTempDir';
const readDir = require('fs-readdir-recursive');

const defaultParams = {
  tempDir: defaultTempDir,
  sourceDir: '',
  targetDir: '',
  masterCss: '',
}

const p = {...defaultParams}
const paramKeys = Object.keys(defaultParams);
(process.argv || []).forEach(s => {
  const nvp = s.split('=');
  if (p.hasOwnProperty(nvp[0])) {
    console.log('['+nvp[0]+'] changed. '+p[nvp[0]]+' -> '+ nvp[1])
    p[nvp[0]] = nvp[1];
  }
})

if (p.sourceDir.length === 0) {
  console.log('Source folder with css/scss files not specified. Exiting.');
  return;
}

p.tempDir = (p.tempDir || '').trim().length === 0 ? path.resolve(__dirname, defaultTempDir) : path.resolve(__dirname, p.tempDir);
p.sourceDir = path.resolve(__dirname, p.sourceDir);
p.targetDir = (p.targetDir || '').trim().length === 0 ? path.resolve(__dirname, p.sourceDir, '_output') : path.resolve(__dirname, p.targetDir);

console.log('Using config:\n'+
  '  Temp dir: '+p.tempDir+'\n'+
  'Source dir: '+p.sourceDir+'\n'+
  'Target dir: '+p.targetDir+'\n'+
  'Master CSS: '+p.masterCss+'\n'
);

//0. Prepare temp dir
console.log('Prepare temp directory', p.tempDir);
fs.removeSync(p.tempDir);
fs.mkdirSync(p.tempDir);

//1. Process all scss files and put them into temp dir
const sassCmd = __dirname + '/node_modules/.bin/sass --no-source-map --update ' + p.sourceDir + ':' + p.tempDir;
console.log('Processing scss files\n> ', sassCmd);
chip.execSync(sassCmd);

//2. Copy css files into temp dir
console.log('Copying plain css files into', p.tempDir);
fs.copySync(p.sourceDir, p.tempDir, {filter: filterCssOnly});

//3. Do postcss work
let postcssCmd;
const useMasterCss = p.tempDir + '/' + p.masterCss;
if (fs.lstatSync(useMasterCss).isFile()) {
  console.log('Master CSS found:', useMasterCss, '. Using postcss to process it');
  const targetMasterCss = p.targetDir + '/' + p.masterCss;
  postcssCmd = __dirname + '/node_modules/.bin/postcss --verbose ' + useMasterCss + ' -o ' + targetMasterCss;
  console.log('Postprocessing css\n> ', postcssCmd);
  chip.execSync(postcssCmd);
} else {
  console.log('No master CSS: ['+useMasterCss+'] Just copying all processed files into', p.targetDir);
  const cssList = readDir(p.tempDir).filter(name => name.substring(name.lastIndexOf('.')) === '.css').forEach(name => {
    const sourceName = path.resolve(p.tempDir, name);
    const targetName = path.resolve(p.targetDir, name);
    postcssCmd = __dirname + '/node_modules/.bin/postcss --verbose ' + sourceName + ' -o ' + targetName;
    console.log(postcssCmd);
    chip.execSync(postcssCmd);
  });
  // fs.copySync(p.tempDir, p.targetDir);
}

//4. Copy resources
console.log('Copying resource files from', p.sourceDir, 'into', p.targetDir);
fs.copySync(p.sourceDir, p.targetDir, {filter: filterResourcesOnly});

//5. Cleanup
console.log('Do cleanup');
fs.removeSync(p.tempDir);

function filterCssOnly(src, dst) {
  if (fs.lstatSync(src).isDirectory()) {
    return true;
  } else if (src.substring(src.lastIndexOf('.')).toLowerCase() === '.css') {
    console.log('Copying '+src);
    return true;
  } else {
    console.log('Skipping '+src);
    return false;
  }
}

function filterResourcesOnly(src, dst) {
  const ext = src.substring(src.lastIndexOf('.')).toLowerCase();
  if (fs.lstatSync(src).isDirectory()) {
    return true;
  } else if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less') {
    return false;
  } else {
    console.log('Copying '+src);
    return true;
  }
}