db.createUser(
  {
    user: "",
    pwd: "",
    roles: [ { role: "readWrite", db: "autofi" } ]
  }
);