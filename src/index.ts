#!/usr/bin/env node

import * as fs from 'fs';
import { Project } from 'ts-morph';
import { LinterError } from './types';
import testCases from './test-cases';
import chalk from 'chalk';

const errorList = new Array<LinterError>();

// Get first argument as file path
if (process.argv.length < 3) {
  console.error('Please provide a file path as first argument');
  process.exit(1);
}
const filePath = process.argv[2];

console.log('Checking...\n');

// Parse the AST of the js file
const project = new Project({ useInMemoryFileSystem: true  });
const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8', });
const sourceFile = project.createSourceFile('file.js', fileContents);

// Run each test case
testCases.forEach(testCase => {
  const error = testCase(fileContents, sourceFile);
  error.forEach(err => {
    errorList.push(err);
  });
});


// Final output
if(errorList.length > 0){
  console.log('Found ' + errorList.length + ' errors');
  errorList.forEach(error => {
    console.log(chalk.red('Line ' + error.line + ': ' + error.message));
  });
} else {
  console.log('No errors found 🥳. \nThe scripts will still need to be manually checked through a demo.');
}
