'use strict';
const Users = require('../controller/UserController');
const path = require('path'); 

module.exports = function(app) {
  app.route('/').get(function(req, res) {
    res.sendFile( path.resolve('app/web/index.html') );
  });
  app.route('/users').get(Users.FindAll).post(Users.CreateUser);
  app.route('/users/:id').get(Users.FindById).delete(Users.Delete).put(Users.Update);
  app.route('/documents').get(Users.FindAllDocuments).post(Users.Upload);
  app.route('/documents/:id').delete(Users.DeleteDocumentByID).get(Users.FindDocumentById);
};