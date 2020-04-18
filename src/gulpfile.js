const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const touch = require('gulp-touch-fd');
const pugData = require('./pug/data.js');

const OUTPUT_DIR = '..';

const JS_BUNDLE_NAME = 'bundle';

const paths = {
  html: {
    src: ['./pug/**/*.pug', '!./pug/include/**/*.pug', '!./pug/tpl/**/*.pug', '!./pug/sections/**/*.pug'],
    dest: `${OUTPUT_DIR}`,
  },
  styles: {
    src: './sass/**/*.scss',
    dest: `${OUTPUT_DIR}/assets/css`,
  },
  scripts: {
    src: './js/*.js',
    dest: `${OUTPUT_DIR}/assets/js`,
  },
};

function html() {
  return gulp.src(paths.html.src)
    .pipe(pug({
      pretty: true,
      data: pugData,
    })).pipe(rename({
      extname: '.html',
    })).pipe(
      gulp.dest(paths.html.dest)
    )
    .pipe(touch());
}

function styles() {
  return gulp.src(paths.styles.src, { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return browserify({
    extensions: ['.js', '.jsx'],
    entries: './js/main.jsx',
  })
    .transform('babelify', { presets: ['@babel/env', '@babel/preset-react'] })
    .on('error', (msg) => {
      // eslint-disable-next-line no-console
      console.error(msg);
    })
    .bundle()
    .pipe(source(`${JS_BUNDLE_NAME}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(rename(`${JS_BUNDLE_NAME}.min.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest));
}

function scriptsProd() {
  process.env.NODE_ENV = 'production';
  return scripts();
}

function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

const build = gulp.parallel(html, styles, scriptsProd);

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.scriptsProd = scriptsProd;
exports.watch = watch;

exports.build = build;
exports.default = build;
