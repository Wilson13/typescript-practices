/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/ban-types */
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

function defaultArgumentsAlt(
  passedFunc: Function,
  defaultArgs: Object
): Function {
  // Get object keys
  let argKeys = Object.keys(defaultArgs);
  // Sort arguments alphabetically
  argKeys = argKeys.sort();

  // Get the difference in passed function no. of arguments compared to no. of properties
  // available in the passed object `defaultArgs`.
  const diff = passedFunc.length - argKeys.length;
  // Array of arguments to be passed on (order is based on sorted object properties)
  const passArr = []; //Array(passedFunc.length).fill(0);

  // if (diff > 0) {
  //   passArr = passArr.fill[0];
  // }
  argKeys.forEach((arg) => {
    // Push value into array by accessing object properties in sorted order
    passArr.push(defaultArgs[arg]);
  });

  // Pass argument arrays that will be inserted at the start of the arguments
  const boundFunction = passedFunc.bind(null, ...passArr);

  const returnFunc = (...args) => {
    // if (arguments.length == passedFunc.length) {
    //   return passedFunc(...args);
    // } else if (passArr.length > arguments.length) {
    //   passArr.pop();
    //   return passedFunc.bind(null, ...passArr);
    // } else {
    //   //console.log(...passArr);
    //   return boundFunction(...args); //passedFunc.bind(null, ...passArr);
    // }
    if (args.length < passedFunc.length) {
      // If arguments provided is lesser than the function parameters, push default values.
      args.push.apply(args, passArr);
      return passedFunc(...args);
    } else {
      return passedFunc(...args);
    }
  };

  return returnFunc;
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
