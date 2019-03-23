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

const SITE_DIR = 'html/doc-search';
const DIST_DIR = 'html/doc-search/dist';

// use gulp-run to start a pipeline
gulp.task('buildDataFile', () => run('npm run buildDataFile').exec());

gulp.task('css', () => {
  gulp.src(scssFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      browsers: ['last 8 versions'],
      cascade: false,
    }))
    .pipe(cssnano())
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('js', () =>
  gulp.src(jsFiles)
    .pipe(concat('index.js'))
    .pipe(babel({
      presets: ['env'],
    }))
    .pipe(uglify())
    .pipe(gulp.dest(DIST_DIR)));

gulp.task('copy', () =>
  gulp.src([
    'node_modules/requirejs/require.js',
    'node_modules/elasticsearch-browser/elasticsearch.jquery.js',
    'node_modules/lunr/lunr.js',
    // vue test
    'node_modules/vue/dist/vue.js',
    'node_modules/vuex/dist/vuex.js',
    'src/js/vue-test.js',
  ]).pipe(gulp.dest(DIST_DIR)));

gulp.task('copyImgs', () =>
  gulp.src(['src/img/**/*'])
    .pipe(gulp.dest(`${DIST_DIR}/img`)));

gulp.task('copyHtaccessDev', () =>
  gulp.src(['.htaccess.dev'])
    .pipe(rename('.htaccess'))
    .pipe(gulp.dest(DIST_DIR)));

gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', [
    'build',
    '--config',
    '_config.dev.yml',
    '--watch',
    '--incremental',
    '--drafts',
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach(message => gutil.log(`Jekyll: ${message}`));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('buildCIABASEindex', function () {

  const raw = fs.readFileSync('CIABASE.json', 'utf8');
  const documents = JSON.parse(raw);

  const idx = lunr(function () {
    this.ref('id');
    this.field('entry');
    this.field('source');
    this.metadataWhitelist = ['position']
    documents.forEach(function (doc) {
      this.add(doc);
    }, this);
  });
  fs.writeFile('CIABASEindex.json', JSON.stringify(idx), (err) => {
    if (err) {
      return console.log(err);
    }
    return err;
  });
});

gulp.task('copySiteToWebRoot', () =>
  gulp.src(['_site/*'])
    .pipe(gulp.dest(`${SITE_DIR}/`)));

gulp.task('watch', () => {
  gulp.watch(scssFiles, ['css', 'jekyll']);
  gulp.watch(jsFiles, ['js', 'jekyll']);
  gulp.watch(dataFiles, ['jekyll']);
});

gulp.task('default', ['buildDataFile', 'copy', 'copyImgs', 'copyHtaccessDev', 'css', 'js', 'jekyll', 'copySiteToWebRoot', 'watch']);
gulp.task('build', ['buildDataFile', 'copy', 'css', 'js']);
gulp.task('ciabase', ['buildDataFile', 'buildCIABASEindex', 'copy', 'copyImgs', 'copyHtaccessDev', 'css', 'js', 'jekyll', 'watch']);
