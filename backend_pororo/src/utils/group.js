function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const groupKey = item[key];

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
    return groups;
  }, {});
}

module.exports = {
  groupBy
};