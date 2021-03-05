'user strict';
const sql = require('../../db.js');
const User = function(user){
    this.civilite = user.civilite;
    this.nom = user.nom;
    this.prenom = user.prenom;
    this.password = user.password;
    this.identifiant = user.identifiant;
    this.avatar = user.avatar;
    this.email = user.email;
    this.anniversaire = user.anniversaire;
};

User.CreateUser = function (user, result) {
    sql.query("INSERT INTO t_users set ?", user, function (err, res) {
        if(err === null && res == '') return result(res, err);
        return result(null, res);
    });           
};

User.GetUserById = function (userID, result) {
    sql.query("Select id, civilite, nom, prenom, identifiant, email, anniversaire, avatar from t_users where id = ? ", userID, function (err, res) { 
        if(err === null && res == '') return result(res, err);
        return result(null, res);
    });  
};

User.GetUserByIdAPI = function (userID, result) {
    sql.query("Select id, civilite, nom, prenom, identifiant, email, anniversaire, avatar from t_users where id = ? ", userID, function (err, res) { 
        if(err === null && res == '') return result(res, err);
        return res;
    });  
};

User.FindAllUsers = function (result) {
    sql.query("Select * from t_users", function (err, res) {
        if(err === null && res == '') return result(res, err);
        return result(null, res);
    });   
};

User.DeleteById = function(id, result){
    sql.query("DELETE FROM t_users WHERE id = ?", id, function (err, res) {
        if(err === null && res == '') return result(res, err);
        return result(null, res);
    }); 
};

User.UpdateById = function(id, user, result){ //NOK
    sql.query("UPDATE t_users set ? WHERE id = ?", [user, id], function (err, res) {
        if(err) result(res, err);
        result(null, res);
    }); 
};

User.UpdateAvatarById = function(id, url, result){//NOK
    console.log(id);
    console.log(url);
    console.log(result);
    sql.query("UPDATE t_users set avatar = ? WHERE id = ?", [url, id], function (err, res) {
        if(res.affectedRows === 0) return result(res, err);
        return result(res, null);
    }); 
};

module.exports = User;