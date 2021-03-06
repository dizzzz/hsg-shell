'use strict';

var gulp = require('gulp'),
    exist = require('gulp-exist'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del')

exist.defineMimeTypes({
    'application/xml': ['odd']
})

var exClient = exist.createClient({
    host: 'localhost',
    port: '8080',
    path: '/exist/xmlrpc',
    basic_auth: { user: 'admin', pass: '' }
})

var targetConfiguration = {
    target: '/db/apps/hsg-shell/',
    html5AsBinary: true
}

gulp.task('clean', function() {
    return del([
        'build/**/*',
        'resources/css/main.css',
        'resources/fonts/*'
    ]);
});

// fonts //

gulp.task('fonts:copy', ['clean'], function () {
    return gulp.src([
            'bower_components/bootstrap-sass/assets/fonts/**/*',
            'bower_components/font-awesome/fonts/*'
        ])
        .pipe(gulp.dest('resources/fonts'))
})

gulp.task('fonts:deploy', ['fonts:copy'], function () {
    return gulp.src('resources/fonts/*', {base: '.'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

// images //

/**
 * Image optimization task will *overwrite* an existing image
 * with its optimized version
 */
gulp.task('images:optimize', function () {
    return gulp.src('resources/images/*')
        .pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('resources/images'))
})

gulp.task('images:deploy', function () {
    return gulp.src('resources/images/*', {base: '.'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('images:watch', function () {
    gulp.watch('app/images/*', ['images:deploy'])
})

// scripts //

gulp.task('scripts:build', function () {
    // minified version of js is used in production only
    return gulp.src('resources/scripts/app.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('resources/scripts'))
})

gulp.task('scripts:copy', function () {
    return gulp.src([
            'bower_components/jquery/dist/*.js',
            'bower_components/jquery-touchswipe/*.js',
            'bower_components/bootstrap-sass/assets/javascripts/bootstrap{.min,}.js'
        ])
        .pipe(gulp.dest('resources/scripts/vendor'))
})

gulp.task('scripts:deploy', ['scripts:copy'], function () {
    return gulp.src('resources/scripts/*.js', {base: '.'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('scripts:watch', function () {
    gulp.watch('resources/scripts/*.js', ['scripts:deploy'])
})

// styles //

/**
 * TODO: minify
 */

gulp.task('styles:build', ['clean'], function () {
    var compiler = sass({
        sourceMapEmbed: true,
        sourceMapContents: true
    })
    compiler.on('error', sass.logError)
    return gulp.src('app/scss/main.scss')
        .pipe(compiler)
        .pipe(gulp.dest('resources/css'))
})

gulp.task('styles:deploy', ['styles:build'], function () {
    return gulp.src('resources/css/*.css', {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('styles:watch', function () {
    gulp.watch('app/scss/**/*.scss', ['styles:deploy'])
})

// pages //

var pagesPath = 'pages/**/*.html';
gulp.task('pages:deploy', function () {
    return gulp.src(pagesPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('pages:watch', function () {
    gulp.watch(pagesPath, ['pages:deploy'])
})

// modules //

var modulesPath = 'modules/*';
gulp.task('modules:deploy', function () {
    return gulp.src(modulesPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('modules:watch', function () {
    gulp.watch(modulesPath, ['modules:deploy'])
})

// templates //

var templatesPath = 'templates/**/*.html';
gulp.task('templates:deploy', function () {
    return gulp.src(templatesPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('templates:watch', function () {
    gulp.watch(templatesPath, ['templates:deploy'])
})

// odd files //

var oddPath = 'resources/odd/**/*';
gulp.task('odd:deploy', function () {
    return gulp.src(oddPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('odd:watch', function () {
    gulp.watch(oddPath, ['odd:deploy'])
})

// files in project root //

var otherPath = '*{.xpr,.xqr,.xql,.xml,.xconf}';
gulp.task('other:deploy', function () {
    return gulp.src(otherPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('other:watch', function () {
    gulp.watch(otherPath, ['other:deploy'])
})

// general //

gulp.task('watch', ['styles:watch', 'scripts:watch', 'images:watch', 'templates:watch',
                    'pages:watch', 'odd:watch', 'other:watch', 'modules:watch'])

gulp.task('build', ['fonts:copy', 'images:optimize', 'styles:build'])

gulp.task('deploy', ['build'], function () {
    return gulp.src([
            'resources/**/*', // odd, styles, fonts, scripts
            'bower_components/**/*',
            templatesPath,
            pagesPath,
            modulesPath,
            otherPath
        ], {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('default', ['build'])
