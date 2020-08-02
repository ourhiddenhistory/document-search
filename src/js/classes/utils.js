export const filterValue = (obj, key, value) => obj.find(v => v[key] === value);

/**
 * Modules
 */
export function lpad(padString, length) {
  var str = this;
  while (str.length < length)
    str = padString + str;
  return str;
}

export function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
