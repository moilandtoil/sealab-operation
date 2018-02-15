"use strict";

const BaseOperation = require("../base_operation.js");

class TestValid extends BaseOperation {
  constructor() {
    super();
    this.name = "TestValid";
    this.entrypoint = "Query";
    this.typeDef = `type test {
          id: ID!
        }`;
  }

  resolver(root, args, context) {
    return {
      id: context.id
    };
  }
}

class TestInvalid extends BaseOperation {}

// stub logger to prevent errors
let stubbedLoggerApplication = {
  logger: {
    debug: () => { /* do nothing */ }
  }
};


describe("Extending a base operation", () => {
  
  describe("with a valid constructor", () => {

    let testOp = null;
    beforeEach(() => {
      testOp = new TestValid();
      testOp.setApplication(stubbedLoggerApplication);
    });
    
    test("getConfig()", () => {
      let config = testOp.getConfig();
      expect(config.name).toEqual(testOp.name);
      expect(config.entrypoint).toEqual(testOp.entrypoint.toLowerCase());
      expect(config.typeDef).toEqual(testOp.typeDef);
      expect(config.guards.length).toEqual(testOp.guards.length);
    });

    test("resolve()", () => {
      let resolve = testOp.resolver(null, null, { id: "foo" });
      expect(resolve).toHaveProperty("id");
    });

    test("execute()", () => {
      let exec = testOp.execute(null, null, { id: "foo" });
      expect(exec).toHaveProperty("id");
    });

  });

  describe("with an invalid constructor", () => {

    let testOp = null;

    beforeEach(() => {
      testOp = new TestInvalid();
      testOp.setApplication(stubbedLoggerApplication);
    });

    test("getConfig()", () => {
      let config = testOp.getConfig();
      expect(config.name).toEqual("");
      expect(config.entrypoint).toEqual("");
      expect(config.typeDef).toEqual("");
      expect(config.guards.length).toEqual(0);
    });

    test("resolve()", () => {
      expect(() => {
        testOp.resolver(null, null, null)
      }).toThrow();
    });

    test("execute()", () => {
      expect(() => {
        testOp.execute(null, null, null)
      }).toThrow();
    });
  });

  describe("with setting application", () => {
    let testOp = null;
    let logFunc = null;

    beforeEach(() => {
      logFunc = jest.fn();
      testOp = new TestValid();
      testOp.setApplication({
        service: () => { return true },
        conn: () => { return true },
        logger: {
          error: logFunc,
          info: logFunc,
          debug: logFunc,
        }
      });
    });

    test("#service()", () => {
      expect(testOp.service("test")).toEqual(true);
    });

    test("#conn()", () => {
      expect(testOp.conn("test")).toEqual(true);
    });

    test("#logger()", () => {
      expect(testOp.logger()).toHaveProperty('error');
      expect(testOp.logger()).toHaveProperty('info');
      expect(testOp.logger()).toHaveProperty('debug');
    });

    test("#error()", () => {
      testOp.error("message");
      expect(logFunc).toHaveBeenCalled();
    });

    test("#info()", () => {
      testOp.info("message");
      expect(logFunc).toHaveBeenCalled();
    });

    test("#debug()", () => {
      testOp.debug("message");
      expect(logFunc).toHaveBeenCalled();
    });
  });

  describe("without setting application", () => {

    let testOp = null;
    beforeEach(() => {
      testOp = new TestValid();
    });

    test("#service()", () => {
      expect(() => {
        testOp.service("test");
      }).toThrow();
    });

    test("#conn()", () => {
      expect(() => {
        testOp.conn("test");
      }).toThrow();
    });

    test("#logger()", () => {
      expect(() => {
        testOp.logger();
      }).toThrow();
    });

    test("#error()", () => {
      expect(() => {
        testOp.error("test");
      }).toThrow();
    });

    test("#info()", () => {
      expect(() => {
        testOp.info("test");
      }).toThrow();
    });

    test("#debug()", () => {
      expect(() => {
        testOp.debug("test");
      }).toThrow();
    });
  });
});