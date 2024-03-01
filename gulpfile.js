import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
const publicSCSSDestination = 'public/stylesheets';
function publicSCSSFunction() {
    return gulp
        .src('public-scss/*.scss')
        .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }))
        .pipe(gulp.dest(publicSCSSDestination));
}
gulp.task('public-scss', publicSCSSFunction);
function watchFunction() {
    gulp.watch('public-scss/*.scss', publicSCSSFunction);
}
gulp.task('watch', watchFunction);
gulp.task('default', () => {
    publicSCSSFunction();
    watchFunction();
});
