// 1. Write a function that concatenates two lists. [a,b,c], [1,2,3] → [a,b,c,1,2,3]
function concatList(
  arr1: (string | number)[],
  arr2: (string | number)[]
): (string | number)[] {
  // Assuming arrays should not contain more than 500 elements
  if (arr1.length > 500 || arr2.length > 500) {
    return [];
  }
  return arr1.concat(arr2);
}
// 2. Write a function that combines two lists by alternatingly taking elements, e.g. [a,b,c], [1,2,3] → [a,1,b,2,c,3].
function altConcatList(
  arr1: (string | number)[],
  arr2: (string | number)[]
): (string | number)[] {
  // Assuming arrays should not contain more than 500 elements
  if (arr1.length > 500 || arr2.length > 500) {
    return [];
  }
  // Assuming we need to keep the order, i.e. first element comes from first array passed as argument and so on.
  let shorterArrLength,
    longerArr,
    newList: (string | number)[] = [];
  // Could have used an if-else instead of comparing twice,
  // but chose to use Ternary Operator for code tidiness here.
  shorterArrLength = arr1.length > arr2.length ? arr2.length : arr1.length;
  longerArr = arr1.length >= arr2.length ? arr1 : arr2;
  let i = 0;
  for (i; i < shorterArrLength; i++) {
    // Wanted to use .pop() but needed a reverse version of it.
    newList.push(arr1[i]);
    newList.push(arr2[i]);
  }
  // By the time the shorter array has been finished popping all the elements, there could still
  // be some elements left in the longer one (if their length is not equal).
  return newList.concat(longerArr.slice(i));
}

// 3. Write a function that merges two sorted lists into a new sorted list. [1,4,6],[2,3,5] → [1,2,3,4,5,6]. You can do this quicker than concatenating them followed by a sort.
function mergeAndSortList(arr1: number[], arr2: number[]): number[] {
  // Assuming arrays should not contain more than 500 elements
  if (arr1.length > 500 || arr2.length > 500) {
    return [];
  }
  // As mentioned in the statement, the lists (arrays) provided as arguments are
  // already in sorted order, so there's no need to sort them within this function.
  // Also assuming arrays contain only number.
  let arr1Length,
    arr2Length,
    newList: number[] = [];

  arr1Length = arr1.length;
  arr2Length = arr2.length;
  // Pivots
  let j = 0,
    k = 0;
  while (j < arr1Length && k < arr2Length) {
    if (arr1[j] <= arr2[k]) {
      newList.push(arr1[j++]);
    } else {
      newList.push(arr2[k++]);
    }
  }
  // By the time the shorter array has finished being iterated,
  // the longer one still has some elements not pushed into the new list.
  // So, depending on which pivot is larger than the corresponding array length,
  // the other array is longer and should be concatenated into the new list.
  if (j >= arr1Length) {
    return newList.concat(arr2.slice(k));
  } else {
    return newList.concat(arr1.slice(j));
  }
}

// 4. Write function that translates a text to Pig Latin and back. English is translated to Pig Latin by taking the first letter of every word, moving it to the end of the word and adding 'ay'. "The quick brown fox" becomes "Hetay uickqay rownbay oxfay".
function translatePigLatin(sentence: string): string {
  // This function can translate a sentence that contains a mix of both English and Pig Latin.
  // Assuming sentence should not be longer than 1000 characters.
  if (sentence.length > 1000) {
    return "";
  }
  // Assuming the sentence given is like the example, no punctuations or symbols etc.
  const words = sentence.toLowerCase().split(" ");
  const translatedString: string[] = [];
  for (const word of words) {
    let translatedWord = "";
    if (word.endsWith("ay")) {
      // Translate Pig Latin to English
      if (word.length > 3) {
        // Word is longer than 3 charactes, meaning in English, it's longer than 1 character.
        // Needed some extra information from this reference to make negative slicing work:
        // https://foxbits.dev/article/understanding-slice-method-javascript-basics-negative-indexing-and-concept-shallow-copy/17
        translatedWord = word.slice(-3, -2) + word.slice(0, -3);
      } else if (word.length == 3) {
        // Incase it's a single character word
        translatedWord = word.slice(-3, -2);
      }
      // If it's just "ay", ignore that word.
      if (translatedString.length == 0) {
        // First word, make first character of this word uppercase.
        translatedWord =
          translatedWord.slice(0, 1).toUpperCase() + translatedWord.slice(1);
      }
    } else {
      // Translate English to Pig Latin
      if (word.length > 1) {
        translatedWord = word.slice(1) + word.slice(0, 1) + "ay";
      } else if (word.length == 1) {
        // Incase it's a single character word
        translatedWord = word + "ay";
      }
      if (translatedString.length == 0) {
        // First word, make first character of this word uppercase.
        translatedWord =
          translatedWord.slice(0, 1).toUpperCase() + translatedWord.slice(1);
      }
    }
    translatedString.push(translatedWord);
  }

  return translatedString.join(" ");
}

const listOne = ["a", "b", "c", "d", "e"];
const listTwo = [1, 3, 5, 7, 9, 11, 13, 14, 15, 16];
const listThree = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

console.log(`Concatenate: ${concatList(listOne, listTwo)}`);
console.log(`Alternately concatenate : ${altConcatList(listOne, listTwo)}`);
console.log(`Merge and sort list : ${mergeAndSortList(listTwo, listThree)}`);
console.log(
  `Translate Pig Latin : ${translatePigLatin(
    "OLLay Iay LOL The quick brown fox hetay uickqay rownbay oxfay"
  )}`
);
