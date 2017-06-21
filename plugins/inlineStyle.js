'use strict';

exports.type = 'full';

exports.active = true;

exports.description = 'Inline style';

exports.params = {

};

/**
 * Inline styles
 *
 * @param {Object} item current iteration item
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Jeremi Stadler
 */
const styles = {};

exports.fn = function(data, params) {
  rec(addToStyleList, data);
  rec(replaceClasses, data);
  rec(removeStyles, data);
  return data;
};

function rec(fn, items) {
  items.content.forEach(item => {
    fn(item);
    if (item.content)
      rec(fn, item);
  });
}

function dashToCamelCase(str) {
  return str.replace(/-([a-zA-Z])/g, g => g[1].toUpperCase());
}

function addToStyleList(item) {
  if (!item.isElem('style')) return;
  item.content
    .map(f => f.text)
    .forEach(text => {
      const getStylesRegex = /.([\da-z\-\_]+)\s*{\s*([^}]+)+?\s*}/gi;

      let match = getStylesRegex.exec(text);
      while (match != null) {
        const name = match[1];
        const parts = match[2].split(';')
          .map(f => f.trim().split(':').map(a => a.trim()))
          .filter(f => f.length > 1)
          .map(arr => ({
            name: dashToCamelCase(arr[0]),
            value: arr[1],
          }));
        styles[name] = parts;
        //console.log({parts, name});
        match = getStylesRegex.exec(text);
      }
    });
}

function replaceClasses(item) {
  if (!item.hasAttr('class')) return;
  const id = item.attrs['class'].value;
  delete item.attrs['class'];

  if (!styles[id]) {
    return console.log('Class not found:', id);
  };
  styles[id].forEach(attr => {
     item.addAttr({
        name: attr.name,
        prefix: '',
        local: attr.name,
        value: attr.value
    });
  });

  console.log(item);
}


function removeStyles(item) {
  if (item.content) {
    item.content = item.content.filter(f => !f.isElem('style'));
  }
}
