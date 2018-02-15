"use strict";

class OperationManager {
  constructor(schemaBuilder) {
    this.schemaBuilder = schemaBuilder;
    this.preExecution = [];
  }

  registerOperation(operationClass, application) {
    let operation = new operationClass();
    operation.setApplication(application);
    const config = operation.getConfig();

    const hookedFunc = (root, args, context) => {
      let chain = Promise.resolve([root, args, context, operation]);

      for(let pre of this.preExecution) {
        chain = chain.then((result) => {
          return pre(...result);
        });
      }
      chain = chain.then((result) => {
        let root = result[0];
        let args = result[1];
        let context = result[2];

        if (!this.schemaBuilder.validateGuards(operation.guards, context)) {
          return Promise.reject('Request not authorized, one or more guard validations failed');
        }
        return config.resolver(root, args, context);
      });

      return chain;
    };

    this.schemaBuilder.addEntrypoint(config.name, config.entrypoint, config.typeDef, hookedFunc, config.guards);
    return operation;
  }

  registerPreHook(callback) {
    this.preExecution.push(callback);
  }
}

module.exports = OperationManager;