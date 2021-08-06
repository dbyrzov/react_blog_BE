const sql = require("./db.js");
const BlogCategory = require("./blogCategory.model.js");

// constructor
const Blog = function(Blog) {
  this.blog_id = Blog.blog_id;
  this.title = Blog.title;
  this.content = Blog.content;
  this.description = Blog.description;
  this.image = Blog.image;
  this.user_id = Blog.user_id;
  this.categories = Blog.categories;
};

const base_query = 'SELECT DISTINCT (b.blog_id), b.title, b.content, b.image, b.description, categoryTable.res as categories'
+'  FROM Blog b,'
+'       Category c,'
+'       BlogCategory bc,'
+'       (SELECT bb.blog_id,'
+'               GROUP_CONCAT(CONCAT("category_id:",'
+'                                   cc.category_id,'
+'                                   ",name:",'
+'                                   cc.name)'
+'                                   SEPARATOR "; ") AS res'
+'          FROM Category     cc,'
+'               Blog         bb,'
+'               BlogCategory bcc'
+'         WHERE cc.category_id = bcc.category_id'
+'           AND bb.blog_id = bcc.blog_id'
+'         group by bb.blog_id) as categoryTable'
+' WHERE b.blog_id = bc.blog_id'
+'   AND c.category_id = bc.category_id'
+'   AND categoryTable.blog_id = b.blog_id';

const baseQuery = (name, category_ids) => {
  let query_2 = name? ` AND (b.title like '%${name}%' OR b.description like '%${name}%')`:"";
  let query_3 = (category_ids && category_ids.length >0 && category_ids[0]!='')? ` AND b.blog_id IN (SELECT blog_id FROM BlogCategory WHERE category_id IN (${category_ids}))`: "";
  let query = base_query + query_2 + query_3;
  return query;
};

Blog.findById = (BlogId, result) => {

  let query_extra = ` AND b.blog_id = ${BlogId}`;
  let query = base_query + query_extra;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }

    // not found Blog with the id
    result({ kind: "not_found" }, null);
  });
};

Blog.getAll = result => {
  console.log('asasasa')
  sql.query(base_query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    };
    result(null, res);
  });
};

Blog.getLimited = (limit, result) => {
  let query_extra = ` ORDER BY "created_at" LIMIT ${limit}`
  let query = base_query + query_extra
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    result(null, res);
  });
};

Blog.create = (Blog, result) => {
  delete Blog.categories;
  sql.query(
    "INSERT INTO Blog SET ?",
    Blog, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log(res)
      result(null, res.insertId);
    }
  );
};

Blog.updateById = (id, Blog, result) => {
  sql.query(
    "UPDATE Blog SET title = ?, content = ?, description = ? WHERE blog_id = ?",
    [Blog.title, Blog.content, Blog.description, id],
    (err, res) => {
      console.log(res)
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.affectedRows == 0) {
        // not found Blog with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, Blog });
    }
  );
};

Blog.updateImageById = (id, imagePath, result) => {
  sql.query(
    "UPDATE Blog SET image = ? WHERE blog_id = ?",
    [imagePath, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log(res);
      console.log('jasnakjnsjkansjknasjkasnkjanskja')
      if (res.affectedRows == 0) {
        // not found Blog with the id
        result("not found", null);
        return;
      }
      result(null, res.affectedRows);
    }
  );
};

Blog.remove = (id, result) => {
  sql.query("DELETE FROM Blog WHERE blog_id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Blog with the id
      result({ kind: "not_found" }, null);
      return;
    }

    result(null, res);
  });
};

Blog.removeAll = result => {
  sql.query("DELETE FROM Blogs", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    result(null, res);
  });
};

Blog.search = (name, category_ids, offset, result) => {

  let query = baseQuery(name, category_ids);
  let query_order = ` ORDER BY title LIMIT 4 OFFSET ${offset};`

  let final_query = query + query_order;
  sql.query(final_query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    Blog.count(name, category_ids, (err_1, res_1) => {
      if (err_1) {
        console.log("error: ", err_1);
        result(err_1, null);
        return;
      }
      let new_res = {blogs: res, count: res_1};
      result(null, new_res);
    });
  });
};

Blog.count = (name, category_ids, result) => {
  let query = baseQuery(name, category_ids) + ";";
  query = query.replace("DISTINCT (b.blog_id), b.title, b.content, b.image, b.description, categoryTable.res as categories", "COUNT(DISTINCT b.blog_id)");
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null, res[0]["COUNT(DISTINCT b.blog_id)"]);
  });
};

module.exports = Blog;

