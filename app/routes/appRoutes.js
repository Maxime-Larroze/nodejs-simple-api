'use strict';
const Users = require('../controller/UserController');

module.exports = function(app) {
  app.route('/users').get(Users.FindAll).post(Users.CreateUser);
  app.route('/users/:id').get(Users.FindById).delete(Users.Delete).put(Users.Update);
  app.route('/documents').get(Users.FindAllDocuments).post(Users.Upload);
  app.route('/documents/:id').delete(Users.DeleteDocumentByID).get(Users.FindDocumentById);
};