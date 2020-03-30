const sharp = require('sharp');
const _ = require('lodash/fp');

const parseImage = path =>
  Promise.all([
    sharp(path).metadata(),
    sharp(path)
      .grayscale()
      .raw()
      .toBuffer()
  ]);
const isBlack = data => data.every(a => a === 0);
const isWhite = data => data.every(a => a >= 240);
const splitImages = (width, height, raw) => {
  const lines = _.chunk(width, raw);
  const columns = _.zipAll(lines);
  const points = columns.reduce(
    (points, column, i) => (isWhite(column) ? points.concat(i) : points),
    []
  );
  const columnRanges = _.zip(points.slice(0, -1), points.slice(1)).filter(
    ([a, b]) => a + 1 !== b
  );
  return columnRanges.map(([a, b]) => {
    const width = b - a - 1;
    const imageColumns = columns.slice(a + 1, b);
    const imageLines = _.zipAll(imageColumns);
    return { lines: imageLines, columns: imageColumns, width, height };
  });
};
const findBlackLines = lines =>
  lines.map((line, i) => (isBlack(line) ? i : null)).filter(i => i !== null);

const getShitDone = async imgName => {
  const [{ width, height }, raw] = await parseImage(imgName);
  if (!width || !height) {
    throw new Error('wat missing width or height');
  }
  const images = splitImages(width, height, raw);
  const filteredImages = images.map(image => {
    const blackLines = findBlackLines(image.lines);
    const linesWithoutBlackLine = image.lines.map((line, lineIndex) => {
      if (!blackLines.includes(lineIndex)) {
        return line;
      }
      const aboveLine = image.lines[lineIndex - 1];
      const belowLine = image.lines[lineIndex + 1];
      return line.map((color, columnIndex) => {
        const pixels = [aboveLine[columnIndex], belowLine[columnIndex]];
        return _.sum(pixels) / pixels.length;
      });
    });
    return Object.assign(Object.assign({}, image), {
      lines: linesWithoutBlackLine,
      columns: _.zipAll(linesWithoutBlackLine)
    });
  });
  const center = data => {
    const nonWhite = data
      .map(element => !isWhite(element))
      .map((isWhite, index) => (isWhite ? index : null))
      .filter(index => typeof index === 'number');
    const firstColumn = nonWhite[0];
    const lastColumn = _.last(nonWhite);
    return [firstColumn, lastColumn];
  };
  const centeredImages = filteredImages.map(image => {
    const [firstColumn, lastColumn] = center(image.columns);
    const [firstLine, lastLine] = center(image.lines);
    const newLines = image.lines
      .slice(firstLine, lastLine)
      .map(line => line.slice(firstColumn, lastColumn));
    const newColumns = _.zipAll(newLines);
    const width = lastColumn - firstColumn;
    const height = lastLine - firstLine;
    return { width, height, lines: newLines, columns: newColumns };
  });
  return centeredImages;
};

module.exports = { getShitDone };
