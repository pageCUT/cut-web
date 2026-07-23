const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <a class="nav-link" href="#sec1">Link 1</a>
      <a class="nav-link" href="#sec2">Link 2</a>
      <a class="nav-link" href="#sec3">Link 3</a>
      <section id="sec1"></section>
      <section id="sec2"></section>
      <section id="sec3"></section>
    </body>
  </html>
`);

const window = dom.window;
const document = window.document;

// Mock offsetTop and offsetHeight
document.querySelectorAll('section[id]').forEach((sec, idx) => {
  Object.defineProperty(sec, 'offsetTop', { value: idx * 500 });
  Object.defineProperty(sec, 'offsetHeight', { value: 500 });
});

// Original
function original() {
  var links = document.querySelectorAll('.nav-link[href^="#"]');
  var pos = 600; // inside sec2
  document.querySelectorAll('section[id]').forEach(function (sec) {
    if (sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos) {
      links.forEach(function (l) { l.classList.remove('active'); });
      var m = document.querySelector('.nav-link[href="#' + sec.id + '"]');
      if (m) m.classList.add('active');
    }
  });
}

// Optimized
var linksCached = document.querySelectorAll('.nav-link[href^="#"]');
var sectionsCached = document.querySelectorAll('section[id]');
function optimized() {
  var pos = 600; // inside sec2
  sectionsCached.forEach(function (sec) {
    if (sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos) {
      linksCached.forEach(function (l) { l.classList.remove('active'); });
      var m = document.querySelector('.nav-link[href="#' + sec.id + '"]');
      if (m) m.classList.add('active');
    }
  });
}

function runBenchmark(name, fn, iterations) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();
  return Number(end - start) / 1e6; // ms
}

console.log("Warming up...");
runBenchmark("Original", original, 10000);
runBenchmark("Optimized", optimized, 10000);

const iters = 100000;
console.log(`\nRunning ${iters} iterations...`);
const origTime = runBenchmark("Original", original, iters);
const optTime = runBenchmark("Optimized", optimized, iters);

console.log(`Original: ${origTime.toFixed(2)} ms`);
console.log(`Optimized: ${optTime.toFixed(2)} ms`);
console.log(`Improvement: ${((origTime - optTime) / origTime * 100).toFixed(2)}% faster`);
