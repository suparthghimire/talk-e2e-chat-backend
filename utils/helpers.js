module.exports = {
  filterArrRemId: (arr, id) => {
    return arr.filter((item) => item.id !== id);
  },
};
