import gulp from "gulp";
import minify from "gulp-minify";
const publicJavascriptsMinFn = () => {
    return gulp.src("public/javascripts/!(*.min).js", { allowEmpty: true })
        .pipe(minify({ noSource: true, ext: { min: ".min.js" } }))
        .pipe(gulp.dest("public/javascripts"));
};
gulp.task("public-javascript-min", publicJavascriptsMinFn);
const watchFn = () => {
    gulp.watch("public/javascripts/!(*.min).js", publicJavascriptsMinFn);
};
gulp.task("watch", watchFn);
gulp.task("default", () => {
    publicJavascriptsMinFn();
    watchFn();
});
