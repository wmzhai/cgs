function lcFirst(str) {
  return str[0].toLowerCase() + str.substring(1);
}

function ucFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

exports.lcFirst = lcFirst;
exports.ucFirst = ucFirst;