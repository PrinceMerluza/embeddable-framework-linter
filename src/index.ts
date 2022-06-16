#!/usr/bin/env node

import * as fs from 'fs';
import { Project, ts } from 'ts-morph';
import * as utils from './utils';
import chalk from 'chalk';

interface LinterError {
  message: string;
  line: number;
  content: string;
}

const errorList = new Array<LinterError>();

// Get first argument as file path
if (process.argv.length < 3) {
  console.error('Please provide a file path as first argument');
  process.exit(1);
}
const filePath = process.argv[2];

console.log('Checking...\n');

// Parse the AST of the js file
const project = new Project({ useInMemoryFileSystem: true });
const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8', });
const sourceFile = project.createSourceFile('file.js', fileContents);

// CASE: Domain should not contain wildcard
sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach(statement => {
  if (statement.getText().startsWith('window.parent.postMessage')){
    const domain = statement.getArguments()[1].getText();
    if (domain.includes('*')){

      // Add failed case to error list
      errorList.push({
        message: 'Domain should not contain wildcard *',
        line: utils.getLineFromPosition(fileContents, statement.getStart()),
        content: statement.getText(),
      });
    }
  }
});

if(errorList.length > 0){
  console.log('Found ' + errorList.length + ' errors');
  errorList.forEach(error => {
    console.log(chalk.red('Line ' + error.line + ': ' + error.message));
  });
} else {
  console.log('No errors found 🥳. \nThe scripts will still need to be manually checked through a demo.');
}
