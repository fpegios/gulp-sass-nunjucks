const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const bulkSass = require('gulp-sass-bulk-import');

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
const BROWSER_SYNC_RELOAD_DELAY = 500;

// project files' paths
const paths = {
    styles: {
        src: ['app/assets/sass/vendor/*.scss', 'app/assets/sass/vendor/*.css', 'app/assets/sass/**/*.scss'],
        dest: 'dist/css/'
    },
    scripts: {
        src: ['app/assets/javascript/vendor/*.js', 'app/assets/javascript/**/*.js'],
        dest: 'dist/js/'
    },
    views: {
        src: ['app/views/**/*.*']
    }
};

// restart express server
gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        // nodemon our expressjs server
        script: 'app.js',
        // watch core server file(s) that require server restart on change
        watch: ['app.js', 'app/routes.js']
    })
        .on('start', function onStart() {
            // ensure start only got called once
            if (!called) { cb(); }
            called = true;
        })
        .on('restart', function onRestart() {
            // reload connected browsers after a slight delay
            setTimeout(function reload() {
                browserSync.reload({
                    stream: false
                });
            }, BROWSER_SYNC_RELOAD_DELAY);
        });
});

gulp.task('browser-sync', function () {
    // for more browser-sync config options: http://www.browsersync.io/docs/options/
    browserSync({
        // informs browser-sync to proxy our expressjs app which would run at the following location
        proxy: 'http://localhost:3000',
        // informs browser-sync to use the following port for the proxied app
        // notice that the default port is 3000, which would clash with our expressjs
        port: 4000,
        files: paths.views.src,
        ghostmode: false,
        open: true,
        notify: false,
        logLevel: 'error',
        ui: false
    });
});

// start nodemon and browser-sync
gulp.task('default',
    gulp.series('nodemon', 'browser-sync')
);

//  clean dist folder
gulp.task('clean', function () {
    return del([ 'dist' ]);
});

// convert .scss to .css and uglify it
gulp.task('styles', function () {
    return gulp.src("app/assets/sass/app.scss", { sourcemaps: true })
        .pipe(bulkSass())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest));
});

// concatenate all .js files and uglify it
gulp.task('scripts', function () {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
});

// update style file (watch)
gulp.task('update-styles', function () {
    return gulp.src("app/assets/sass/app.scss", { sourcemaps: true })
        .pipe(bulkSass())
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload({ stream: true }));
});
  
// update script file (watch)
gulp.task('update-scripts', function () {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browserSync.stream());
});
// watch all files
gulp.task('watch', function () {
    gulp.watch(paths.scripts.src, gulp.parallel('update-scripts'));
    gulp.watch(paths.styles.src,  gulp.parallel('update-styles'));
});

// start nodemon and browser-sync
gulp.task('start',
  gulp.series('nodemon', gulp.parallel('browser-sync', 'watch'))
);

// clean dist folder and build scripts and style files
gulp.task('default', 
  gulp.series('clean', gulp.parallel('styles', 'scripts'), 'start')
);