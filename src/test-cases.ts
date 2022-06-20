/**
 * Each case is a function that returns LinterError | null.
 * The export default is the array of these case functions.
 */

import * as utils from './utils';
import { SourceFile, ts } from 'ts-morph';
import { LinterError } from './types';

export default [
  // CASE: Domain should not contain wildcard
  (fileContents: string, sourceFile: SourceFile): LinterError[]  => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach(statement => {
      if (statement.getText().startsWith('window.parent.postMessage')){
        const domain = statement.getArguments()[1].getText();
        if (domain.includes('*')){

          // Add failed case to error list
          error.push({
            message: 'Domain should not contain wildcard *',
            line: utils.getLineFromPosition(fileContents, statement.getStart()),
            content: statement.getText(),
          });
        }
      }
    });

    return error;
  },

  // CASE: Window.Framework should have config
  (fileContents: string, sourceFile: SourceFile): LinterError[]  => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAccessExpression).forEach(statement => {
      if (statement.getText() == 'window.Framework'){
        const frameworkObj = statement.getNextSiblings()[1];
        if (!frameworkObj) return null; // Ignore if not object assignment. Probably a variable assignment.
    
        let configFound = false;
        frameworkObj.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(prop => {
          if(prop.getFirstChild()?.getText() == 'config') configFound = true;
        });
    
        if(!configFound){
          // Add failed case to error list
          error.push({
            message: 'Window.Framework should have config',
            line: utils.getLineFromPosition(fileContents, frameworkObj.getStart()),
            content: statement.getText(),
          });
        }
      }
    });

    return error;
  },

  // CASE: Config Properties should exist
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];
    const requiredConfigProps = ['name', 'settings', 'clientIds', 'customInteractionAttributes'];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
      const key = statement.getChildAtIndex(0);
      const value = statement.getChildAtIndex(2);
      // If config is not an object, pass as it may be set to variable.
      if (key.getText() === 'config'){
        if(value.getKind() !== ts.SyntaxKind.ObjectLiteralExpression){
          return null
        }

        // Get all property assignments in the config object
        const configProps = value.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).map(prop => {
          return prop.getChildAtIndex(0).getText();
        });

        requiredConfigProps.forEach(prop => {
          configProps.includes(prop) ? null : error.push({
            message: `Config should include '${prop}' property`,
            line: utils.getLineFromPosition(fileContents, value.getStart()),
            content: '',
          });
        });
      }
    });

    return error;
  },

  // CASE: config.customInteractionAttributes should be set
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];
    const requiredConfigProps = ['name', 'settings', 'clientIds', 'customInteractionAttributes'];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
      const key = statement.getChildAtIndex(0);
      const value = statement.getChildAtIndex(2);
      // If config is not an object, pass as it may be set to variable.
      if (key.getText() === 'config'){
        if(value.getKind() !== ts.SyntaxKind.ObjectLiteralExpression){
          return null
        }

        // Get the customInteractionAttributes property
        const attrbProp = value.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'customInteractionAttributes';
        });
        if(!attrbProp) return null;

        // If not array, ignore as it may be another variable.
        const arrChildren = attrbProp.getChildrenOfKind(ts.SyntaxKind.ArrayLiteralExpression);
        if(arrChildren.length === 0) return null;

        // If array, make sure it's not empty
        if(arrChildren[0].getElements().length === 0){
          error.push({
            message: 'config.customInteractionAttributes should not be empty',
            line: utils.getLineFromPosition(fileContents, attrbProp.getStart()),
            content: attrbProp.getText(),
          });
        }
      }
    });

    return error;
  },
];


  
  
  
 