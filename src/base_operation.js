"use strict";

class BaseOperation {

  constructor() {
    this.name = "";
    this.entrypoint = "";
    this.typeDef = "";
    this.guards = [];
    this.application = null;
  }

  getConfig() {
    return {
      name: this.name,
      entrypoint: this.entrypoint.toLowerCase(),
      typeDef: this.typeDef,
      resolver: this.execute.bind(this),
      guards: this.guards
    };
  }

  execute(root, args, context) {
    try {
      this.debug(`Executing GQL operation '${this.name}'`);
      return this.resolver(root, args, context);
    } catch (err) {
      this.debug(`Error occurred executing operation... "${err.message}"`);
      // if (err instanceof OperationError) {
      //   // Output error message
      // }
      // // do something else?
      throw err;
    }
  }

  guardError(context) {
    return Promise.reject('Request not authorized, one or more guard validations failed');
  }

  logger() {
    if (this.application === null) {
      throw new Error("Application container must be attached to operation");
    }
    return this.application.logger();
  }

  debug(message, ...additional) {
    this.logger().debug(message, ...additional);
  }

  info(message, ...additional) {
    this.logger().info(message, ...additional);
  }

  error(message, ...additional) {
    this.logger().error(message, ...additional);
  }

  setApplication(application) {
    this.application = application;
  }

  service(serviceName) {
    if (this.application === null) {
      throw new Error("Application container must be attached to operation");
    }
    return this.application.service(serviceName);
  }
  
  conn(connName) {
    if (this.application === null) {
      throw new Error("Application container must be attached to operation");
    }
    return this.application.conn(connName);
  }

  // abstract methods
  resolver(root, args, context) {
    throw new Error("Resolver not implemented");
  }
}

module.exports = BaseOperation;