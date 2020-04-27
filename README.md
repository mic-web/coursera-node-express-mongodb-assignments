# Example solutions for assignments

Coursera provides a course "Server-side Development with NodeJS, Express and MongoDB that's a good starting point for learning the ME(R)N stack.

This repository contains my solutions for all assignments. On top of that I added some tools that help during development (e.g. ESLint, Prettier).

If you're following the course as well and are looking for solutions I hope that I can help you if you're stuck with a problem or if you want to find out if there are better solutions. Just please ensure to follow the Coursera Code of Conduct - it's for your own benefit.

# Topics involved

Following technologies had been evaluated and used with this tutorial:

- NodeJS
- Express
- MongoDB (NoSQL)
- Mongoose
- Authentication: comparison of OAuth2, JWT, Sessions and Basic Auth
- Simple, server-side CORS handling
- File upload
- RESTful API

# Installation and execution

**Note**: you will get a _MongoNetworkError_ if there's no MongoDB server with a matching database running. Please just follow the setup instructions of the course on Coursera.

To install all packages, just run `npm install`.

You should also install the Prettier in your IDE, as it helps you a lot with auto-formatting according to the linter rules.

Execute `npm start` to start the example web server of assignment 4.
You can furthermore execute the solutions of other assignments with `npm start1`, `npm start2` etc..

# Client application

An example client application that matches the REST API can be found here:
https://github.com/jmuppala/conFusion-React

You will have to provide a matching setup (e.g. MongoDB database) to be able to try this out.
