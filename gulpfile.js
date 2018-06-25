var gulp = require('gulp'),
  cleanCss = require('gulp-clean-css'),         //压缩清理css
  rename = require('gulp-rename'),              //重命名,项目中没有用到
  babel = require('gulp-babel'),                //编译ES6
  plumber = require('gulp-plumber'),            //捕获处理任务中的错误
  minifyHtml = require('gulp-minify-html'),     //压缩html
  less = require('gulp-less'),                  //获取gulp-less模块
  uglify = require('gulp-uglify'),              //js文件压缩混淆
  concat = require('gulp-concat'),              //合并文件
  imagemin = require('gulp-imagemin'),          //图片压缩
  clean = require('gulp-clean'),                //删除项目
  rev = require('gulp-rev'),                    //- 对文件名加MD5后缀
  revCollector = require('gulp-rev-collector'), //- 路径替换
  gulpSequence = require('gulp-sequence');     //同步执行
  // stripDebug = require('gulp-strip-debug');     //删除console,alert等

  var paths = {
  es6: ['./src/**/*.js', '!./src/common/lib/*.js'],
  vendor: ['./src/common/lib/*.js', '!./src/common/lib/ionic.bundle.js', '!./src/common/lib/less.min.js'],
  less: ['./src/**/*.less'],
  css: ['./src/common/lib/ionic.min.css', './rev/style.min.css'],
  html: ['./src/**/*.html'],
  img: ['./src/**/*.png', './src/**/*.jpg', './src/**/*.gif','./src/**/*.svg' ],
  copyFonts: ['./src/common/css/fonts/*'],
};

//发布生产环境用 gulp
gulp.task('default', gulpSequence('clean', 'minify-html', 'copyFonts',
  'babel', 'concatVendor', 'minify-img', 'revCss2'));

//平常只需更新html、css、js,用gulp test
gulp.task('test', gulpSequence('minify-html',
  'babel', 'revCss2'));

// 1.清空
gulp.task('clean', function() {
  return gulp.src(['./www'])
    .pipe(clean());
});

//2.压缩html
gulp.task('minify-html', function() {
  gulp.src(paths.html) // 要压缩的html文件
    .pipe(minifyHtml()) //压缩
    .pipe(gulp.dest('./www'));
});

// 3.复制图标文件
gulp.task('copyFonts', function() {
  return gulp.src(paths.copyFonts)
    .pipe(gulp.dest('./www/css/fonts'));
});

//4.Js:ES6编译=>删除console(alert,debug)=>压缩=>合并=>混淆
gulp.task('babel', function() {
  return gulp.src(paths.es6)
    .pipe(plumber())
    .pipe(babel({ presets: ['env'] }))
    // .pipe(stripDebug())
    .pipe(uglify())
    .pipe(concat('build.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www'));
});

//5.合并压缩第三方库
gulp.task('concatVendor', function() {
  return gulp.src(paths.vendor)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./www'));
});

//6.图片:压缩
gulp.task('minify-img', function() {
  gulp.src(paths.img)
    .pipe(imagemin())
    .pipe(gulp.dest('./www'));
});

//7.css:less编译=>合并=>删除重复样式=>添加MD5后缀
gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(less())
    .pipe(concat('style.min.css'))
    .pipe(cleanCss({
      level: 2
    }))
    .pipe(gulp.dest('./rev'));
});

gulp.task('concatCss', ['less'], function() {
  return gulp.src(paths.css)
    .pipe(concat('style.min.css'))
    .pipe(rev())
    .pipe(gulp.dest('./www/css'))
    .pipe(rev.manifest('rev-css2-manifest.json')) //- 生成一个rev-manifest.json
    .pipe(gulp.dest('./rev'));
});

gulp.task('revCss2', ['concatCss'], function() {
  gulp.src(['./rev/rev-css2-manifest.json', './www/*.html']) //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
    .pipe(revCollector({ replaceReved: true })) //- 执行文件内css名的替换
    .pipe(gulp.dest('./www')); //- 替换后的文件输出的目录
});

//自动编译
// gulp.watch(paths.es6, ['babel']);
// gulp.watch(paths.less, ['less']);
/*gulp.task('watch', ['babel','less'], function() {
  // gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.es6, ['babel']);
  gulp.watch(paths.less, ['less']);
});*/

