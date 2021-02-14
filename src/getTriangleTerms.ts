//      1
//     1 1
//    1 2 1
//   1 3 3 1
//  1 4 6 4 1
// 1 5 10 10 5 1
//1 6 15 20 15 6 1
// ...

function getTriangleTerms(row, col) {
  // number [][]
  let rowArr = [];

  for (let i = 0; i < row; i++) {
    //   console.log(`i: ${i}`);
    const colSize = i + 1;
    let colArr = [];

    for (let j = 0; j < colSize; j++) {
      let colVal = 0;
      if (j == 0 || j == colSize - 1) {
        colVal = 1;
        colArr[j] = 1;
      } else {
        // rowArr[2][0] + rowArr[2][1];
        // console.log(`1: ${rowArr[i][j-1]}`);
        // console.log(`2: ${rowArr[i][j]}`);
        colVal = rowArr[i - 1][j - 1] + rowArr[i - 1][j];
        colArr[j] = colVal;
      }

      // console.log(`i: ${i}, row : ${row}, j: ${j}, col: ${col}, colVal: ${colVal}`);
      if (i == row - 1 && j + 1 == col) {
        return colVal;
      } else {
        // console.log(`colArr: ${colArr}`);
        rowArr[i] = colArr;
      }
    }
    //   console.log(`rowArr[${i}]: ${rowArr[i]}`);
  }

  return 0;
}

function getColVal(col, colSize, sum) {
  if (col == 0 || col == colSize - 1) return 1;
  else return sum;
}

console.log(getTriangleTerms(1, 1)); // 1
console.log(getTriangleTerms(2, 1)); // 1
console.log(getTriangleTerms(3, 2)); // 1
console.log(getTriangleTerms(5, 3)); //
console.log(getTriangleTerms(6, 4)); // // 1 5 10 10 5 1

// console.log(getTriangleTerms(5, 5)) // 1
// console.log(getTriangleTerms(5, 3)) // 6
