const devFolder = 'src'
const prodFolder = 'dist'

const path = {
  src: {
    html: [`${devFolder}/html/**/*.html`, `!${devFolder}/html/common/**/*.html`],
    css: `${devFolder}/assets/styles/scss/styles.scss`,
    fonts: `${devFolder}/assets/styles/fonts/`,
    ts: `${devFolder}/assets/js/**/*.ts`,
    js: `${devFolder}/assets/js/**/*.js`,
    img: `${devFolder}/assets/images/**/*.{jpeg,jpg,png,svg,gif,ico,webp}`
  },
  build: {
    html: `${prodFolder}/`,
    css: `${prodFolder}/assets/styles/css/`,
    fonts: `${prodFolder}/assets/styles/fonts/`,
    js: `${prodFolder}/assets/js/`,
    img: `${prodFolder}/assets/images/`
  },
  watch: {
    html: `${devFolder}/html/**/*.html`,
    css: `${devFolder}/assets/styles/scss/**/*.scss`,
    ts: `${devFolder}/assets/js/**/*.ts`,
    js: `${devFolder}/assets/js/**/*.js`,
    img: `${devFolder}/assets/images/**/*.{jpeg,jpg,png,svg,gif,ico,webp}`
  },
  clear: `./${prodFolder}/`
}

/*
-----------------------------------------------------------
| IMPORT PLUGINS
-----------------------------------------------------------
*/
const {src, dest, watch, parallel, series} = require('gulp')
const BrowserSync = require('browser-sync').create()
const FileInclude = require('gulp-file-include')
const Del = require('del')
const Sass = require('gulp-sass')
const Autoprefixer = require('gulp-autoprefixer')
const GroupCssMediaQueries = require('gulp-group-css-media-queries')
const CleanCss = require('gulp-clean-css')
const FileRename = require('gulp-rename')
const SourceMap = require('gulp-sourcemaps')
//const FileConcat = require('gulp-concat')
const UglifyEs = require('gulp-uglify-es').default
const ImageMin = require('gulp-imagemin')
const WebP = require('gulp-webp')
const WebPHtml = require('gulp-webp-html')
const WebPCss = require('gulp-webp-css')
const SvgSprite = require('gulp-svg-sprite')
const Babel = require('gulp-babel')
const Eslint = require('gulp-eslint')
//const TypeScript = require('gulp-typescript')


/*
-----------------------------------------------------------
| FUNCTIONS OF TASKS 
-----------------------------------------------------------
*/
function browserSync() {
  BrowserSync.init({
    server: {
      baseDir: `./${prodFolder}`
    },
    port: 3100,
    online:true,
    notify: false
  })
}

function html() {
  return src(path.src.html)
  .pipe(FileInclude({
    prefix: '@@'
  }))
  .pipe(WebPHtml())
  .pipe(dest(path.build.html))
  .pipe(BrowserSync.stream())
}

function styles() {
  return src(path.src.css)
  .pipe(SourceMap.init())
  .pipe(Sass({
    outputStyle: 'compressed'
  }))
  .pipe(Autoprefixer({
    overrideBrowserslist: ['last 5 version'],
    cascade: true
  }))
  .pipe(GroupCssMediaQueries())
  .pipe(WebPCss())
  .pipe(dest(path.build.css))
  .pipe(CleanCss())
  .pipe(FileRename({
    extname: '.min.css'
  }))
  .pipe(SourceMap.write())
  .pipe(dest(path.build.css))
  .pipe(BrowserSync.stream())
}

/*function ts() {
  return src(path.src.ts)
  .pipe(TypeScript())
  .pipe(dest(path.src.js))
  .pipe(BrowserSync.stream())
}*/

function js() {
  return src(path.src.js)
  .pipe(SourceMap.init())
  .pipe(Eslint())
  .pipe(Babel({
    presets: ['@babel/env']
  }))
  .pipe(dest(path.build.js))
  .pipe(UglifyEs())
  .pipe(FileRename({
    extname: '.min.js'
  }))
  .pipe(SourceMap.write())
  .pipe(dest(path.build.js))
  .pipe(BrowserSync.stream())
}

function images() {
  return src(path.src.img)
  .pipe(ImageMin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    interlaced: true,
    optimizationLevel: 3 //0 to 7
  }))
  .pipe(dest(path.build.img))
  .pipe(WebP({
    quality: 70
  }))
  .pipe(dest(path.build.img))
  .pipe(BrowserSync.stream())
}

function svgSprite() {
  return src(`${path.src.img}/icons/sprites/*.svg`)
  .pipe(SvgSprite({
    mode: {
      stack: {
        sprite: 'icons.svg',
        example: true
      }
    }
  }))
  .pipe(dest(`${path.build.img}icons/sprites/`))
}

function clear() {
  return Del(path.clear)
}

function watchFiles () {
  watch([path.watch.html], html)
  watch([path.watch.css], styles)
  watch([path.watch.js], js)
  watch([path.watch.img], images)
}




/*
-----------------------------------------------------------
| EXPORT FUNCTIONS AND RUN TASK
-----------------------------------------------------------
*/

const build = series(clear,  parallel(html, styles, js, images, svgSprite))
const watching = parallel(build, watchFiles, browserSync)


exports.html = html
exports.styles = styles
exports.js = js
exports.images = images
exports.svgSprite = svgSprite
exports.build = build
exports.watching = watching
exports.default = watching