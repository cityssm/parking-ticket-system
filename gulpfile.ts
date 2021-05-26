import gulp from "gulp";
import minify from "gulp-minify";

/*
 * Minify public/javascripts
 */

const publicJavascriptsMinFn = () => {

  return gulp.src("public/javascripts/!(*.min).js", { allowEmpty: true })
    .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
    .pipe(gulp.dest("public/javascripts"));
};


gulp.task("public-javascript-min", publicJavascriptsMinFn);

/*
 * Watch
 */

const watchFn = () => {
  gulp.watch("public/javascripts/!(*.min).js", publicJavascriptsMinFn);
};

gulp.task("watch", watchFn);

/*
 * Initialize default
 */

gulp.task("default", () => {
  publicJavascriptsMinFn();
  watchFn();
});
