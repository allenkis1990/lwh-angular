/**
 * Created by 46607 on 2017/7/5.
 ${customer.Address}
 */

var gulp = require('gulp');

gulp.task('copyJs', function () {
    return gulp.src('./build/**/*.*')

        .pipe(gulp.dest('./public'))
})
