const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const child = require('child_process');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const run = require('gulp-run');
const lunr = require('lunr');
const fs = require('fs');

const scssFiles = 'src/sass/**/*.scss';
const jsFiles = ['src/js/classes/*.js', 'src/js/index.js'];
const dataFiles = '_data/**/*.json';

const BASE_DIR = 'html';
const SITE_DIR = 'html/doc-search';
const DIST_DIR = 'html/doc-search/dist';


function buildDataFile(){
    return run('npm run buildDataFile').exec();
}

function css(){
  return gulp.src(scssFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      browsers: ['last 8 versions'],
      cascade: false
    }))
    .pipe(cssnano())
    .pipe(gulp.dest(DIST_DIR));
}

function js(){
  return gulp.src(jsFiles)
    .pipe(concat('index.js'))
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(DIST_DIR));
}

function copy(){
  return gulp.src([
    'node_modules/requirejs/require.js',
    'node_modules/elasticsearch-browser/elasticsearch.jquery.js',
    'node_modules/lunr/lunr.js'
  ]).pipe(gulp.dest(DIST_DIR));
}

function copyImages(){
  return gulp.src(['src/img/**/*'])
    .pipe(gulp.dest(`${DIST_DIR}/img`));
}

function copyHtaccessDev(){
  return gulp.src(['.htaccess.dev'])
    .pipe(rename('.htaccess'))
    .pipe(gulp.dest(BASE_DIR));
}

function buildJekyll() {
  return child.spawn( 'bundle' , ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
}

// function buildJekyll(cb){
//   child.exec('bundle exec jekyll build --config _config.dev.yml --watch --incremental --drafts', function(err, stdout, stderr) {
//     console.log(stdout);
//     console.log(stderr);
//     cb(err);
//   });
// }

function copySiteToWebRoot(){
  return gulp.src(['_site/*'])
    .pipe(gulp.dest(`${SITE_DIR}/`));
}

function watch(){
  gulp.watch(scssFiles, gulp.series(css))
  gulp.watch(jsFiles, gulp.series(js))
  gulp.watch(
    [
    '*.html',
    '_layouts/*.html',
    '_pages/*',
    '_posts/*',
    '_data/*',
    '_includes/*'
  ],
  gulp.series(buildJekyll));
}

// define complex tasks
const main = gulp.series(buildDataFile, copy, copyImages, copyHtaccessDev, css, js, buildJekyll, copySiteToWebRoot, watch);
const build = gulp.series(buildDataFile, copy, css, js);
const copySite = gulp.series(copySiteToWebRoot);

// export tasks
exports.buildDataFile = buildDataFile;
exports.css = css;
exports.js = js;
exports.copySite = copySite;
exports.buildJekyll = buildJekyll;
exports.build = build;
exports.default = main;
exports.copy = copy;
exports.copyImages = copyImages;
exports.copyHtaccessDev = copyHtaccessDev;
exports.watch = watch;
exports.copySiteToWebRoot = copySiteToWebRoot;
