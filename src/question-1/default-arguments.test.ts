import { getParams } from "./default-arguments";
export {};

function add(a, b) {
  return a + b;
}

function addThree(a, b, c) {
  return a + b + c;
}

function print() {
  return "Hello World!";
}

it('should return parameter array ["a", "b"] by passing add(a, b)', () => {
  expect(getParams(add)).toEqual(["a", "b"]);
});

test('should return  parameter array ["a", "b", "c"] by passing addThree(a, b, c) ', () => {
  expect(getParams(addThree)).toEqual(["a", "b", "c"]);
});

test("should return parameter array [] by passing print() ", () => {
  expect(getParams(print)).toEqual([]);
});
