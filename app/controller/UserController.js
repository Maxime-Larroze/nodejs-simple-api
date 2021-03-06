'use strict';
const User = require('../model/UserModel.js');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

exports.FindAll = function(req, res) {
  User.FindAllUsers(function(err, users) {
    if (err) return res.status(406).json({ statut:"406", message: err });
    res.status(200).json(users);
  });
};

exports.CreateUser = function(req, res) {
  const NewUser = new User(req.body);
  if(NewUser.civilite === '' || NewUser.civilite === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.nom === '' || NewUser.nom === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.prenom === '' || NewUser.prenom === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.email === '' || NewUser.email === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.identifiant === '' || NewUser.identifiant === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.password === '' || NewUser.password === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.anniversaire === '' || NewUser.anniversaire === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  if(NewUser.avatar === '' || NewUser.avatar === 'undefined') return res.status(400).json({ statut:"400", message: 'Please provide the form' });
  User.createUser(NewUser, function(err, NewUser) {
      if (!req && !NewUser) return res.status(400).json({ statut:"400", message: "The form is not completed" });
      return res.status(201).json(NewUser.insertId);
  });
};

exports.FindById = function(req, res) {
  User.GetUserById(req.params.id, function(err, user) {
    if (err) return res.status(403).json({ statut:"403", information: 'User ID '+req.params.id+' not found' });
    res.status(202).json(user);
  });
};

exports.Update = function(req, res) {
  try{
    User.UpdateById(req.params.id, req.body, function(err, user) {
      if (user.affectedRows === 0) return res.status(403).json({ statut:"403", information: 'User ID '+req.params.id+' not found' });
      res.status(201).json({ statut:"201", information: 'User ID '+req.params.id+' modified' });
    });
  }catch(err) {
    return result.status(400).json({ statut:"400", message: "impossible to update the user with ID "+ req.params.id});
  }
};

exports.Delete = function(req, res) {
  try{
    User.DeleteById( req.params.id, function(err) {
      if (err.affectedRows === 0) return res.status(400).json({ statut:"400", message: "Bad Request " });
      return res.status(202).json({  statut:"202",message: 'User '+req.params.id+' successfully deleted' });
    });
  }catch(err) {
    return result.status(400).json({ statut:"400", message: "impossible to delete the user" });
  }
};


exports.Upload = function(req, result) {
  try {
    if(!req.files.file) return res.status(403).json({ statut:"403", message: "No file uploaded " });
    const Avatar = req.files.file;
    Avatar.mv("."+process.env.STORAGE+Avatar.name);
    User.UpdateAvatarById(req.body.userid, "http://"+process.env.ADDRESS+":"+process.env.PORT+req.route.path+"/"+req.files.file.name, function(err, res) {
      try {
        if(res.affectedRows === 0) return result.status(400).json({ statut:"400", message: "impossible to upload your file" });
      }catch(error)
      {
        return result.status(400).json({ statut:"400", message: "impossible to upload your file", information: "error user ID" });
      }
        return result.status(202).json({  statut:"202", message: 'Your file '+Avatar.name+' is successfully uploaded' });
    });
  } catch (err) {
    return result.status(400).json({ statut:"400", message: "impossible to load your image and assign it to you" });
  }
};

exports.FindAllDocuments = function(req, res) {
  const ResultFiles = new Array;
  const t = fs.readdirSync("."+process.env.STORAGE).forEach(file => {
    ResultFiles.push("http://"+process.env.ADDRESS+":"+process.env.PORT+req.route.path+"/"+file);
  });
  if(ResultFiles[0] == null) return res.status(403).json({ statut:"403", message: "No documents available" });
  return res.status(200).json(ResultFiles);
};

exports.DeleteDocumentByID = function(req, res) {
  try {
    fs.unlink("."+process.env.STORAGE + req.params.id, function(err) {
      if (err) return res.status(403).json({ statut:"403", message: "No document available" });
      return res.status(200).json({ statut:"200", message: "The file "+req.params.id+" is successfully deleted."});
      });
  } catch(err) {return res.status(403).json({ statut:"403", message: "No document available", information: err });}
};
exports.FindDocumentById = function(req, res) {
    fs.readFile("."+process.env.STORAGE + req.params.id, function(err, data) {
      if (data == '' || data == null) return res.status(403).json({ statut:"403", message: "No document available" });
      return res.status(200).json(data);
  });
};