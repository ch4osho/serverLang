var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var uglify = require("gulp-uglify");
var jshint = require("gulp-jshint");
var babel = require("gulp-babel");



// 本地服务器
gulp.task('browserSync', async function(){
    await browserSync.init({
        server: {
            baseDir: 'static'
        }
    })
})

// 编译sass
gulp.task('sass',async function(){
    return gulp.src('src/scss/styles.scss')
    .pipe(sass())
    .pipe(gulp.dest('static/css'))
    .pipe(browserSync.reload({
        stream:true
    }))
})

// 打包js
gulp.task('js',async function(){
    return gulp.src('src/js/index.js')
    .pipe(jshint())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('static/js'))
    .pipe(browserSync.reload({
        stream:true
    }))
})

// 监听变化
gulp.task('watchs',async function(){
    gulp.watch('src/scss/**/*.scss',gulp.series('sass'))
    gulp.watch('src/js/**/*.js',gulp.series('js'))
})


// series 串行任务
// parallel 并行任务
// 疑惑：为什么这里并行才可以实现监听功能
// 原因：不知道何原因，browserSync串行进行时会卡住导致下面的任务无法进行

// 可行
// gulp.task('default', gulp.series(gulp.parallel('browserSync','sass','watchs')))

// 可行
// gulp.task('default', gulp.parallel('browserSync','sass','watchs'))

// 可行
// gulp.task('default', gulp.parallel('browserSync',gulp.series('sass','js','watchs')))

// 不可行
gulp.task('default', gulp.series('browserSync','sass','js','watchs'))

// 不可行
// gulp.task('default', gulp.series('browserSync',gulp.parallel('sass'),'watchs'))

