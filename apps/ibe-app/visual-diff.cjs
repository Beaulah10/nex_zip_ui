const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch").default;

const figma = PNG.sync.read(
  fs.readFileSync("figma-flight-search.png")
);

const react = PNG.sync.read(
  fs.readFileSync("flight-search-react.png")
);

const { width, height } = figma;

const diff = new PNG({
  width,
  height
});

const mismatchPixels =
  pixelmatch(
    figma.data,
    react.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.1
    }
  );

fs.writeFileSync(
  "flight-search-diff.png",
  PNG.sync.write(diff)
);

console.log(
  `Mismatch pixels: ${mismatchPixels}`
);