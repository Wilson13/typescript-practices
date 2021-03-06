/* eslint-disable @typescript-eslint/ban-types */
/**
 * Yet to find a better (or built-in) way to get the parameter' names from a function.
 * Current method takes the source code of the function and performs RegExp matching
 * plus string manipulation to obtain the parameters.
 *
 * As of now the regex is meant for a naive matching,
 * not tested against other possible ways function declaration.
 *
 * Another possible approach might be to use "Currying" to transform the
 * function but current custom solution works so yet to try that one out.
 */

// To prevent 'Duplicate function implementation.' error due to functions being in global scope
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

/**
 * Extracts and returns parameters' names from the given function. Returns empty array if none.
 * @param passedFunc
 */
export function getParamNames(passedFunc: Function): string[] {
  const paramRegExp = /\(([a-z]|[0-9]|\,|\s)*\)/i;
  const matched = passedFunc.toString().match(paramRegExp);
  let paramNames: string[] = [];

  if (matched !== null) {
    // Remove parenthesis surrounding parameters and spaces (if any, in the case of multiple parameters).
    // Then splits the string into an array of parameters' names.
    paramNames = matched[0]
      .replace(/\(|\)|\s/g, "")
      .split(",")
      .filter((param) => param.length > 0);

    // Note for split():
    // If separator is omitted or does not occur in str, the returned
    // array contains one element consisting of the entire string.

    // For zero parameter function, paramNames would be [""] which doesn't affect
    // the eventual outcome but still return an empty array for consistencies's sake.
  }
  return paramNames;
}

export function defaultArguments(
  passedFunc: Function,
  defaultArgs: Record<string, unknown>
): Function {
  // Get parameters's names
  const paramNames = getParamNames(passedFunc);
  // Get object keys
  const defaultKeys = Object.keys(defaultArgs);
  // Stores found parameters' value according to index
  const defaultVals = Array(passedFunc.length).fill(null);

  // Iterate and find if any object keys matched with the parameters' names
  defaultKeys.forEach((key) => {
    // Get the index to know the position of the parameter in the function declaration
    const index = paramNames.indexOf(key);
    // Assigning -1 to array won't break the code since it's
    // just assigning an arbitary property to the array object.
    // But still prevent it since it's not required.
    if (index >= 0) {
      defaultVals[index] = defaultArgs[key];
    }
  });

  // Modify arguments value if required
  const modifiedFunction = function (...args) {
    // During function call, fills up with default values if the
    // corresponding arguments provided is undefined (this is important so that
    // arguments provided will not be overridden by default values).
    defaultVals.forEach((val, index) => {
      if (val !== null && args[index] === undefined) {
        args[index] = val;
      }
    });
    return passedFunc(...args);
  };
  // Override the toString method so defaultArguments works when a modified function is given
  modifiedFunction.toString = () => passedFunc.toString();
  return modifiedFunction;
}

function main() {
  const add2 = defaultArguments(add, { b: 9 });

  console.assert(add2(10) === 19, "Failed at add2(10)");
  console.assert(add2(10, 7) === 17, "Failed at add2(10, 7)");
  console.assert(isNaN(add2()), "Failed at isNaN(add2()");

  const add3 = defaultArguments(add2, { b: 3, a: 2 });

  console.assert(add3(10) === 13);
  console.assert(add3() === 5);
  console.assert(add3(undefined, 10) === 12);

  const add4 = defaultArguments(add, { c: 3 }); // doesn't do anything, since c isn't an argument

  console.assert(isNaN(add4(10)));
  console.assert(add4(10, 10) === 20);

  // console.log(add2(10)); // 19
  // console.log(add2(10, 7)); // 17
  // console.log(isNaN(add2())); // true

  // console.log("\nadd3\n");
  // console.log(add3(10)); // 13
  // console.log(add3()); // 5
  // console.log(add3(undefined, 10)); // 12

  // console.log("\nadd4\n");
  // console.log(add4(10)); // NaN
  // console.log(add4(10, 10)); // 20

  // const printOut = defaultArguments(print, { b: 9 });
  // console.log(printOut()); // "Hello World!""
}

main();
