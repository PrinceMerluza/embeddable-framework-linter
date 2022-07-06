/**
 * Each case is a function that returns LinterError | null.
 * The export default is the array of these case functions.
 */

import * as utils from './utils';
import { SourceFile, ts } from 'ts-morph';
import { LinterError } from './types';

const gcRegions = [
  "cac1.pure.cloud",
  "mypurecloud.com",
  "usw2.pure.cloud",
  "aps1.pure.cloud",
  "apne2.pure.cloud",
  "mypurecloud.com.au",
  "mypurecloud.jp",
  "mypurecloud.ie",
  "mypurecloud.de",
  "euw2.pure.cloud"
]

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

  // CASE: Client IDs for all regions should be set
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
      const key = statement.getChildAtIndex(0);
      const value = statement.getChildAtIndex(2);
      // If config is not an object, pass as it may be set to variable.
      if (key.getText() === 'config'){
        if(value.getKind() !== ts.SyntaxKind.ObjectLiteralExpression){
          return null
        }

        // Get the clientIds property
        const clientIdsProp = value.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'clientIds';
        });
        if(!clientIdsProp) return null;

        // If not obj, ignore as it may be another variable.
        const objChildren = clientIdsProp.getChildrenOfKind(ts.SyntaxKind.ObjectLiteralExpression);
        if(objChildren.length === 0) return null;

        // Check if all regions exist
        const idsConfigured = objChildren[0].getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).map(prop => {  
          return utils.cleanKeyText(prop.getChildAtIndex(0).getText());
        });

        gcRegions.forEach(region => {
          if(!idsConfigured.includes(region)){
            error.push({
              message: `Missing client id for ${region}`,
              line: utils.getLineFromPosition(fileContents, clientIdsProp.getStart()),
              content: clientIdsProp.getText(),
            });
          }
        });
      }
    });

    return error;
  },

  // CASE: contactSearch
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
      const key = statement.getChildAtIndex(0);
      const value = statement.getChildAtIndex(2);
      // If config is not an object, pass as it may be set to variable.
      if (key.getText() === 'config'){
        if(value.getKind() !== ts.SyntaxKind.ObjectLiteralExpression){
          return null
        }

        // Get the settings property
        const settingsProp = value.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'settings';
        });
        if(!settingsProp) return null;
        // Get the settings.searchTargets property
        const searchTargetsProp = settingsProp.getChildAtIndex(2).getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'searchTargets';
        });
        if(!searchTargetsProp) return null;

        const searchTargets = searchTargetsProp.getChildAtIndexIfKind(2, ts.SyntaxKind.ArrayLiteralExpression);
        if(!searchTargets) return null; // search targets may be assigned to variable

        // Check if crm contacts search is enabled
        let crmSearchEnabled = false;
        searchTargets.getDescendantsOfKind(ts.SyntaxKind.StringLiteral).forEach(target => {
          if(utils.cleanKeyText(target.getText()) === 'frameworkContacts') crmSearchEnabled = true;
        });
        if (!crmSearchEnabled) return null;
      
        // Check if method is defined
        let methodFound = false;
        sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
          const key = statement.getChildAtIndex(0);
          const value = statement.getChildAtIndex(2);
          if (key.getText() === 'contactSearch') methodFound = true;

          // If config is not an object, pass as it may be set to variable.
          if (key.getText() === 'contactSearch' && value.getKind() !== ts.SyntaxKind.FunctionExpression){
            return null; // method may be assigned to variable
          }

          // Error
          if (key.getText() === 'contactSearch'){
            const block = value.getChildrenOfKind(ts.SyntaxKind.Block)[0];
            // If function is empty
            if(block.getStatements().length === 0){
              error.push({
                message: `'frameworkContacts' is configured as searchTarget but contactSearch method is empty`,
                line: utils.getLineFromPosition(fileContents, value.getStart()),
                content: value.getText(),
              });

              return;
            }

            // If onsuccess is not used
            // NOTE: Lazy checking
            if(!block.getText().includes('onSuccess')){
              error.push({
                message: 'onSuccess should be used in contactSearch method',
                line: utils.getLineFromPosition(fileContents, value.getStart()),
                content: value.getText(),
              });
            }
          }
        });

        if(!methodFound){
          error.push({
            message: `'frameworkContacts' is configured as searchTarget but contactSearch method is not defined`,
            line: utils.getLineFromPosition(fileContents, searchTargetsProp.getStart()),
            content: searchTargetsProp.getText(),
          });
        }
      }
    });

    return error;
  },

  // CASE: processCallLog
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
      const key = statement.getChildAtIndex(0);
      const value = statement.getChildAtIndex(2);
      // If config is not an object, pass as it may be set to variable.
      if (key.getText() === 'config'){
        if(value.getKind() !== ts.SyntaxKind.ObjectLiteralExpression){
          return null
        }

        // Get the settings property
        const settingsProp = value.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'settings';
        });
        if(!settingsProp) return null;
        // Get the settings.searchTargets property
        const enableCallLogsProp = settingsProp.getChildAtIndex(2).getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).find(prop => {
          return prop.getChildAtIndex(0).getText() === 'enableCallLogs';
        });
        if(!enableCallLogsProp) return null;

        // Check if call log is enabled
        const isCallLogEnabled = enableCallLogsProp.getChildAtIndexIfKind(2, ts.SyntaxKind.TrueKeyword);
        if(!isCallLogEnabled) return null;
      
        // Check if method is defined
        let methodFound = false;
        sourceFile.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).forEach(statement => {
          const key = statement.getChildAtIndex(0);
          const value = statement.getChildAtIndex(2);
          if (key.getText() === 'processCallLog') methodFound = true;

          // If config is not an object, pass as it may be set to variable.
          if (key.getText() === 'processCallLog' && value.getKind() !== ts.SyntaxKind.FunctionExpression){
            return null; // method may be assigned to variable
          }

          // Error
          if (key.getText() === 'processCallLog'){
            const block = value.getChildrenOfKind(ts.SyntaxKind.Block)[0];
            // If function is empty
            if(block.getStatements().length <= 1){
              error.push({
                message: `enableCallLogs is true but processCallLogs method is empty or contains default implementation`,
                line: utils.getLineFromPosition(fileContents, value.getStart()),
                content: value.getText(),
              });

              return;
            }

            // If onsuccess is not used
            // NOTE: Lazy checking
            if(!block.getText().includes('onSuccess')){
              error.push({
                message: 'onSuccess should be used in enableCallLogs method',
                line: utils.getLineFromPosition(fileContents, value.getStart()),
                content: value.getText(),
              });
            }
          }
        });

        if(!methodFound){
          error.push({
            message: `enableCallLogs is true but processCallLogs method is not defined`,
            line: utils.getLineFromPosition(fileContents, enableCallLogsProp.getStart()),
            content: enableCallLogsProp.getText(),
          });
        }
      }
    });

    return error;
  },

  // CASE: Check if embedding or downloading external script.
  // Simply checks for *.js in any string literal. This may raise
  // some false negatives, but person will be informed.
  (fileContents: string, sourceFile: SourceFile): LinterError[] => {
    const error: LinterError[] = [];

    sourceFile.getDescendantsOfKind(ts.SyntaxKind.StringLiteral).forEach(statement => {
      const isSuspicious = /.*\.js.*/.test(statement.getText())
      if(isSuspicious){
        error.push({
          message: 'You might be trying to import external scripts. This is not allowed for security reasons. NOTE: This case may be a false negative, ignore if so.',
          line: utils.getLineFromPosition(fileContents, statement.getStart()),
          content: statement.getText(),
        });
      }
    });

    return error;
  },
]; 

 