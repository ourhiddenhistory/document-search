const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const babel = require('gulp-babel');
const babelify = require('babelify');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const child = require('child_process');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const run = require('gulp-run');
const lunr = require('lunr');
const fs = require('fs');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const del = require('del');

const scssFiles = 'src/scss/**/*.scss';
const jsFiles = ['src/js/index.js'];
const dataFiles = '_data/**/*.json';

const BASE_DIR = 'html';
const SITE_DIR = 'html/doc-search';
const DIST_DIR = 'html/doc-search/dist';
const CLASSES_DIST_DIR = 'html/doc-search/dist/classes';

function clean(){
  return del([
    '_data/DOCS_NOWRITE.json',
    '_data/DOCS_REFERENCE.json',
    'html/**/*',
    '!html/.ddev'
  ]);
}

/**
 * Build single document list from docsData folder
 */
function buildDataFile(code){
  return child.spawn('node', ['utils/buildDataFile.js'], { stdio: 'inherit' }) // Adding incremental reduces build time.
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
    .on('close', code);
}

/**
 * SCSS -> CSS
 */
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

/**
 * Bundle js modules
 */
function js(){

  return browserify({
    entries: ["./src/js/index.js"]
  })
  .transform(babelify.configure({
    presets: ["@babel/preset-env"]
  }))
  .bundle()
  .pipe(source("bundle.js"))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest(DIST_DIR));
}

/**
 * Copy required npm files
 */
function copy(){
  return gulp.src([
    'node_modules/elasticsearch-browser/elasticsearch.jquery.js',
  ]).pipe(gulp.dest(DIST_DIR));
}

function copyImages(){
  return gulp.src(['src/img/**/**'])
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

function copySiteToWebRoot(){
  return gulp.src(['_site/**/*', '_site/**/.htaccess*'])
    .pipe(gulp.dest(`${SITE_DIR}/`));
}

function watch(){
  gulp.watch(scssFiles, gulp.series(css))
  gulp.watch(jsFiles, gulp.series(copy, js))
  gulp.watch(
    [
    '*.html',
    '_layouts/*.html',
    '_pages/*',
    '_posts/*',
    '_data/*',
    '_includes/*'
  ],
  gulp.series(buildJekyll, copySiteToWebRoot));
}

// define complex tasks
const main = gulp.series(clean, buildDataFile, copy, copyImages, copyHtaccessDev, css, js, buildJekyll, copySiteToWebRoot, watch);
const build_simple = gulp.series(copy, css, js, watch);
const build = gulp.series(buildDataFile, copy, css, js);
const copySite = gulp.series(copySiteToWebRoot);

// export tasks
exports.buildDataFile = buildDataFile;
exports.clean = clean;
exports.css = css;
exports.js = js;
exports.copySite = copySite;
exports.buildJekyll = buildJekyll;
exports.build = build;
exports.build_simple = build_simple;
exports.default = main;
exports.copy = copy;
exports.copyImages = copyImages;
exports.copyHtaccessDev = copyHtaccessDev;
exports.watch = watch;
exports.copySiteToWebRoot = copySiteToWebRoot;
