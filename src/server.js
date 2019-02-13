const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getUsers': jsonHandler.getUsers,
  '/notReal': jsonHandler.getNotReal,
  '/addUser': jsonHandler.addUser,
  notFound: jsonHandler.notFound,
};
const urlMetaStruct = {
  '/getUsers': jsonHandler.getUsersMeta,
  '/notReal': jsonHandler.getNotRealMeta,
  notFound: jsonHandler.notFound,
};


const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // on end of upload stream.
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();

      const bodyParams = query.parse(bodyString);

      // pass to our addUser function
      jsonHandler.addUser(request, res, bodyParams);
    });
  }
};
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  // const params = query.parse(parsedUrl.query);
  // const acceptedTypes = request.headers.accept.split(',');

  switch (request.method) {
    case 'GET':
      if (urlStruct[parsedUrl.pathname]) {
        urlStruct[parsedUrl.pathname](request, response);
      } else {
        urlStruct.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (urlMetaStruct[parsedUrl.pathname]) {
        urlMetaStruct[parsedUrl.pathname](request, response);
      } else {
        urlMetaStruct.notFound(request, response);
      }
      break;
    case 'POST':
      handlePost(request, response, parsedUrl);
      break;
    default:
      urlStruct.notFound(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
