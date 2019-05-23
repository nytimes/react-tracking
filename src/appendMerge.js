export default function appendMerge(o1, o2) {
  // console.log('SHALLOW MERGING IN ...', JSON.stringify(o1), JSON.stringify(o2));

  const o1Keys = Object.keys(o1);
  const allKeys = [
    ...o1Keys,
    ...Object.keys(o2).filter(item => o1Keys.indexOf(item) < 0),
  ];

  const result = {};

  allKeys.forEach(key => {
    result[key] = [];
    const o1Value = o1[key];
    if (o1Value && o1Value instanceof Array) {
      result[key].push(...o1Value);
    } else if (o1Value) {
      result[key].push(o1Value);
    }
    const o2Value = o2[key];
    if (o2Value && o2Value instanceof Array) {
      result[key].push(...o2Value);
    } else if (o2Value) {
      result[key].push(o2Value);
    }
  });

  // console.log('SHALLOW MERGING OUT ...', JSON.stringify(result));
  return result;
}
