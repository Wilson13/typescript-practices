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

test('passing add(a, b) returns parameter array ["a", "b"]', () => {
  expect(getParams(add)).toEqual(["a", "b"]);
});

test('passing addThree(a, b, c) returns parameter array ["a", "b", "c"]', () => {
  expect(getParams(addThree)).toEqual(["a", "b", "c"]);
});

test("passing print() returns parameter array []", () => {
  console.log(getParams(print).length);
  expect(getParams(print)).toEqual([]);
});
