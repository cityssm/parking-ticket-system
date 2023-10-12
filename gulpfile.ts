import gulp from 'gulp'
import changed from 'gulp-changed'
import minify from 'gulp-minify'

/*
 * Minify public/javascripts
 */

const publicJavascriptsDestination = 'public/javascripts'

function publicJavascriptsMinFunction(): NodeJS.ReadWriteStream {
  return gulp
    .src('public-typescript/*.js', { allowEmpty: true })
    .pipe(
      changed(publicJavascriptsDestination, {
        extension: '.min.js'
      })
    )
    .pipe(minify({ noSource: true, ext: { min: '.min.js' } }))
    .pipe(gulp.dest(publicJavascriptsDestination))
}

gulp.task('public-javascript-min', publicJavascriptsMinFunction)

/*
 * Watch
 */

function watchFunction(): void {
  gulp.watch('public-typescript/*.js', publicJavascriptsMinFunction)
}

gulp.task('watch', watchFunction)

/*
 * Initialize default
 */

gulp.task('default', () => {
  publicJavascriptsMinFunction()
  watchFunction()
})
