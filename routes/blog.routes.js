module.exports = app => {
  const blog = require("../controllers/blog.controller.js");
  const upload = require("../controllers/upload.controller.js");
  const verify = require('../middleware/login.js');

  // Create a new Blog
  app.post("/blog/add", verify.authenticateJWT, blog.create);

  // Retrieve all Blogs
  app.get("/blogs", blog.findAll);

  // Retrieve last two Blogs
  app.get("/blogs/latest", blog.findLimited);

  // Retrieve a single Blog with customerId
  app.get("/blog", blog.findOne);

  // Update a Blog with customerId
  app.post("/blog/update", verify.authenticateJWT, blog.update);

  // Delete a Blog with customerId
  app.post("/blog/delete", verify.authenticateJWT, blog.delete);

  // Delete all Blogs
  app.post("/blogs/delete", verify.authenticateJWT, blog.deleteAll);

  // Upload blog image
  app.post("/blog/image", verify.authenticateJWT, upload.uploadImage);

  app.get("/blog/search", blog.search);
};