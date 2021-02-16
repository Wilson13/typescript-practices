/* eslint-disable @typescript-eslint/ban-types */

// To prevent 'Duplicate function implementation.' error due to functions being in global scope
export {};

function add(a, b) {
  return a + b;
}

/**
 * Extracts and returns parameters' names from the given function. Returns empty array if none.
 * @param passedFunc
 */
function getParams(passedFunc: Function) {
  // Yet to find a better (or built-in) way to get the parameter' names from a function.
  // Current method takes the source code of the function and performs RegExp matching
  // plus string manipulation to obtain the parameters.
  const paramRegExp = /\(([a-z]|[0-9]|\,|\s)*\)/i; ///^(function\s)*.*\(([a-z]|[0-9]|\,|\s)*\)/i;
  const matched = passedFunc.toString().match(paramRegExp);
  let paramNames = [];

  if (matched != null) {
    // Remove parenthesis surrounding parameters and spaces (if any, in the case of multiple parameters).
    // Then splits the string into an array of parameters' names.
    paramNames = matched[0].replace(/\(|\)|\s/g, "").split(",");
  }
  return paramNames;
}

function defaultArguments(passedFunc: Function, defaultArgs: Object): Function {
  // Get parameters's names
  const paramNames = getParams(passedFunc);
  // Get object keys
  const defaultKeys = Object.keys(defaultArgs);
  // Stores found parameters' value according to index
  const defaultVals = [passedFunc.length].fill(null);

  // Iterate and find if any object keys matched with the parameters' names
  defaultKeys.forEach((key) => {
    // Get the index to know the position of the parameter in the function declaration
    const index = paramNames.indexOf(key);
    defaultVals[index] = defaultArgs[key];
  });

  // Modify arguments value if required
  return (...args) => {
    // During function call, fill up with default values if the
    // corresponding arguments provided is undefined (this is important so that
    // arguments provided will not be override by default values).
    defaultVals.forEach((val, index) => {
      if (val !== null && args[index] == undefined) {
        args[index] = val;
      }
    });
    return passedFunc(...args);
  };
}

function main() {
  const add2 = defaultArguments(add, { b: 9 });

  console.assert(add2(10) === 19, "Failed at add2(10)");
  console.assert(add2(10, 7) === 17, "Failed at add2(10, 7)");
  console.assert(isNaN(add2()), "Failed at isNaN(add2()");

  const add3 = defaultArguments(add, { b: 3, a: 2 });

  console.assert(add3(10) === 13);
  console.assert(add3() === 5);
  console.assert(add3(undefined, 10) === 12);

  const add4 = defaultArguments(add, { c: 3 }); // doesn't do anything, since c isn't an argument

  console.assert(isNaN(add4(10)));
  console.assert(add4(10, 10) === 20);

  console.log(add2(10));
  console.log(add2(10, 7));
  console.log(isNaN(add2()));

  console.log("\nadd3\n");
  console.log(add3(10));
  console.log(add3());
  console.log(add3(undefined, 10));

  console.log("\nadd4\n");
  console.log(add4(10));
  console.log(add4(10, 10));
}

main();
