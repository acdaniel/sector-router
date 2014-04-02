var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    rimraf = require('gulp-rimraf'),
    browserify = require('gulp-browserify');

var pkg = require('./package.json');
var banner = ['/**',
 ' * <%= pkg.name %> v<%= pkg.version %>',
 ' * <%= pkg.description %>',
 ' * <%= pkg.homepage %>',
 ' *',
 ' * Copyright 2014 <%= pkg.author %>',
 ' * Released under the <%= pkg.license %> license',
 ' *',
 ' * Date: <%= date %>',
 ' */',
  ''].join('\n');
var minifiedBanner = '/** <%= pkg.name %> v<%= pkg.version %> | (c) 2014 <%= pkg.author %> | <%= pkg.license %> license */\n';

gulp.task('default', ['build', 'minify']);

gulp.task('build', function () {
  return gulp.src('lib/index.js', { read: false })
    .pipe(browserify({
      // debug: true,
      exclude: ['sector'],
      standalone: 'sector.ext.' + pkg.name.replace(/^sector-/, '')
    }))
    .pipe(header(banner, { pkg : pkg, date: new Date().toISOString() } ))
    .pipe(rename(pkg.name + '.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['build'], function () {
  return gulp.src(['dist/' + pkg.name + '.js'])
    .pipe(uglify())
    .pipe(header(minifiedBanner, { pkg : pkg } ))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return gulp.src(['node_modules', 'dist/**/*']).pipe(rimraf());
});

gulp.task('watch', function () {
  return gulp.watch('lib/**/*.js', ['default']);
});
