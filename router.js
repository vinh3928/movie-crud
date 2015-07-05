var router = require("routes")(),
  db = require("monk")("localhost/cinema"),
  movies = db.get("movies"),
  fs = require("fs"),
  view = require("mustache"),
  mime = require("mime"),
  qs = require("qs");


router.addRoute("/", function (req, res, url) {

  res.setHeader("Content-Type", "text/html");
  if (req.method === "GET") {
    var file = fs.readFileSync("views/movies/landing.html");
    var template = view.render(file.toString(), {});
    res.end(template);
  }

});

router.addRoute("/movies", function (req, res, url) {

  if (req.method === "GET") {
    movies.find({}, function (err, doc) {
      if (err) throw new Error("cannot find /movies");
      var file = fs.readFileSync("views/movies/index.html");
      var template = view.render(file.toString(), {movies: doc});
      res.end(template);
    });
  }

  if (req.method === "POST") {
    var accum = "";
    req.on("data", function (chunk) {
      accum += chunk;
    });

    req.on("end", function () {
      var data = qs.parse(accum);
      movies.insert(data, function (err, doc) {
        if (err) throw new Error("cannot find post to db");
      });
      res.writeHead(302, {"Location": "/movies"});
      res.end();
    });
  }
});

router.addRoute("/movies/new", function (req, res, url) {
  console.log(url)
  if (req.method === "GET") {
    var file = fs.readFileSync("views/movies/new.html");
    var template = view.render(file.toString(), {});
    res.end(template);
  }
});

router.addRoute("/public/*", function (req, res, url) {
  res.setHeader("Content-Type", mime.lookup(req.url));
  fs.readFile("." + req.url, function (err, file) {
    if (err) {
      res.setHeader("Content-Type", "text/html");
      res.end("404");
    } else {
      res.end(file);
    }
  });
});

router.addRoute("/movies/:id/delete", function (req, res, url) {
  movies.remove({_id: url.params.id}, function (err, doc) {
    if (err) throw new Error("Cannot delete movie");
    res.writeHead(302, {"Location": "/movies"});
    res.end();

  });
});

router.addRoute("/movies/:id/edit", function (req, res, url) {
  if (req.method === "GET") {
    movies.findOne({_id: url.params.id}, function (err, doc) {
      if (err) throw new Error("cannot find uniq id");
      var file = fs.readFileSync("views/movies/edit.html");
      var template = view.render(file.toString(), doc);
      res.end(template);
    });
  }

  if (req.method === "POST") {
    var accum = "";
    req.on("data", function (chunk) {
      accum += chunk;
    });

    req.on("end", function () {
      var data = qs.parse(accum);
      movies.update({_id: url.params.id}, data, function (err, doc) {
        if (err) throw new Error("cannot update movie");
        res.writeHead(302, {"Location": "/movies"})
        res.end();
      });
    });
  }
});

router.addRoute("/movies/:id", function (req, res, url) {
  if (req.method === "GET") {
    movies.findOne({_id: url.params.id}, function (err, doc) {
      var file = fs.readFileSync("views/movies/show.html")
      var template = view.render(file.toString(), doc);
      res.end(template);
    });

  }

});
module.exports = router;
