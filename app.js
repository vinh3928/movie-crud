var router = require("./router"),
  http = require("http"),
  url = require("url");

var server = http.createServer(function (req, res) {
  if (req.url === "/favicon.ico") {
    res.writeHead(202, {"Content-Type": "image/x-icon"});
    res.end();
    return;
  }

  var path = url.parse(req.url).pathname;
  var routing = router.match(path);
  routing.fn(req, res, routing);

});

server.listen(8080, function () {
  console.log("listening on port 8080");
});
