# Overview
The operations library allows for the grouping of entrypoint typeDef and resolvers into an extended class (Called an operation) and allow for the injection of dependencies into the operation.
It also support checking authorization for an entrypoint via guards, reducing redundant checks in resolvers.
This allows for cleaner entrypoint definitions and eases testing of resolvers.

# Dependencies
This library will use objects from the following libraries
`sealab-application`
`sealab-schema-builder`

# API

## BaseOperation
The BaseOperation is a class that should be extended to implemented for each entrypoint
There are only two functions that need to be implemented: `constructor()` and `resolver()`


###constructor()

The constructor is used to defined data about the entrypoint.  It needs to following values

`name` The name of the entrypoint, should match value and case of the typeDef type name
`typeDef` The GraphQL typeDef describing the entrypoint
`entrypoint` The type of entrypoint, either `query`, `mutation`, or `subscription`
`guards` The guard ids to verify if a request has access to run this entrypoint


###resolver(rootValue, args, context)

The resolver is just a function that takes the `rootValue`, `args`, and `context`.  It's signature maps directly to a GraphQL resolver


The BaseOperation also has some helper methods that can be used in the resolver function.
The two most important ones are `service` and `conn`, which allow access to registered services and connections that are dependency injected into the instantiated operation.

###service(serviceName)

Returns the registered service mapping to the serviceName.  The service will be retrieved from the application container that is injected into the operation instance.
This library assumes the application container is an instance of the sibling library `sealab-application`.
The service will be an instance of a service object, inherited from a base service class.


###conn(connName)

Returns the registered connection mapping to the connName.  The resulting value will depend entirely on the registered connection, which will vary between connections.


There are also helper log functions of `error`, `info`, and `debug`, which will execute the associated functions in the logger registered with the application container.
Log level will be set in the application container.


## OperationManager

Operations must be registered with an OperationManager which add the GraphQL typeDef and resolver for the entrypoint to the schema builder (which this library assumes to be the sibling project `sealab-schema-builder`.
The operation manager exposes two functions `registerOperation` and `registerPreHook`.

###registerOperation(operationClass, application)

This method should be used my the main application to register defined Operations.  It should pass the application container so it can get attached to the operation instance.

`operationClass` an uninstantiated class object for an operation

`application` an instantiated `sealab-application` object



###registerPreHook(callback)

This method allows for a function matching a resolver signature to be passed which will execute and allow for the signature to be modified, and should be returned by the function
This is useful if you want to populate the context based on arguments passed to the resolver
`callback` should be a function with three arguments `(root, args, context)`.  It's return value should be these an array of these three arguments `return [root, args, context]`

# Examples

```

const { SchemaBuilder } = require('sealab-schema-builder');
const { OperationManager, BaseOperation } = require('sealab-operations')
const application = /* sealab-application definition that also defined a user service */

class AddUser extends BaseOperation {
    constructor() {
        this.name = "addUser";
        this.typeDef = `type User {
            email: email
            name: String
        }`
        this.entrypoint = "mutation";
    }

    resolver(root, args, context) {
        return this.service('users').addUser({
            email: args.email,
            name: args.name
        });
    }
}

const builder = SchemaBuilder();
const opManager = OperationManager(builder);

opManager.registerOperation(AddUser, application);

// Create GraphQL server using builder.generateTypeDefs() & builder.generateResolvers()
```

# Testing
Run `npm run test`

# License
MIT