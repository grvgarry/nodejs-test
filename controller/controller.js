let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt-nodejs');
let fs = require('fs')
let userConstroller = {};


/* Login user with email and password */

userConstroller.login = ( req, res) => {
    if(!req.body.email && !req.body.password) {
        return res.status(401).json("Please Enter Email and Password");
    }
    fs.readFile('userData.json','UTF-8',(err,data)=>{ //reading file named userData.json
        if(err) {
            return res.status(400).json("Something went wrong"); 
        }
        else {
            let users = JSON.parse(data);
            let user = users.filter(user=> user['email'] == req.body.email)[0];
            if(!user) {
                return res.status(400).json("User doesnot exist");
            }
            if (bcrypt.compareSync(req.body.password, user.password)) { // compare the encrypted password
                let token = jwt.sign({id:user.id,email:user.email}, 'helw', { expiresIn: 300 }); // create token using 'Json Web Token' with user's id and email. Token will expire in 5 minutes
                users.forEach(_user => {
                    if(_user.id == user.id) {
                        _user['token'] = token; // adding user auth token with user info
                    }
                })
                fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => { //write data after token adding 
                    if(err) {
                        return res.status(400).json("Something went wrong");
                    } else {
                        console.log(result);
                        return res.status(200).json({ "Message" : "Login Successful", "token" : token});
                    }
                });
            } else {
                return res.status(400).json("Wrong Password");
            }
        }
    });
}

/* Create new user */

userConstroller.create = (req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{ //Getting all data of users
        if(err){
            return res.status(400).json("Something went wrong");  
        }
        else{
            let users = JSON.parse(data); 
            if(users.filter(user => user['email'] == req.body.email).length > 0) {
                return res.status(400).json("User Already exist");    
            }
            let dataToSend = {
                "id" : users.length > 0 ? users[users.length - 1]['id'] + 1 : 0,
                "email" : req.body.email,
                "password" : bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10)), // encrypting password using 'bcrypt-nodejs'
                "name" : req.body.name,
                "city" : req.body.city,
                "mobile" : req.body.mobile
            }
            users.push(dataToSend);
            fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => { // write data after added new user
                if(err) {
                    return res.status(400).json("Something went wrong");
                } else {
                    return res.status(200).json("User created sucessfully");
                }
            });
        }
    });
}

/* To check authentication or verify token */

userConstroller.authentication = (req, res, next) => {
    let headers=req.headers.authorization;
    if (headers) {
        let token=req.headers.authorization.split(' ')[1]; //getting authorization token from header
        jwt.verify(token, 'helw', (err, token) => { // verifing the JWT token
            if (err) {
                res.status(400);
                res.json(err);
            }
            else {
                fs.readFile('userData.json','UTF-8',(err,data)=>{
                    if(err) {
                        return res.status(400).json("Something went wrong"); 
                    }
                    else {
                        let users = JSON.parse(data);
                        let user = users.filter(user=> user['email'] == token.email)[0];
                        if(!user || (user && !user.token)) { // checking if user exist with email or token
                            return res.status(400).json("Unauthorized access");
                        } else {
                            req.email = token.email; //getting email from token
                            req.id = token.id;
                            next();
                        }
                    }
                });
            }
        })
    }
}

/* To get details of single user */

userConstroller.getUser = ( req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            let user = users.filter(user=> user['id'] == req.params.id)[0];
            if(!user) {
                return res.status(400).json("User doesnot exist");
            } else {
                delete user.password;
                return res.status(200).json(user)
            }
        }
    });
}

/* To get detail of all users */

userConstroller.getAllUser = ( req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            let user = users.filter(user=> {
                delete user.password
                return user;
            });
            return res.status(200).json(user)
        }
    });
}

/* To update a user details like name, city and mobile number using user id*/

userConstroller.update = (req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong");  
        }
        else{
            let users = JSON.parse(data);
            if(users.filter(user => user['id'] == req.headers.userId).length > 0) {
                return res.status(404).json("Something went wrong");    
            }
            users.forEach(user => {
                if(user['id'] == req.headers.userid) {
                    user.name = req.body.name ? req.body.name : user.name;
                    user.city = req.body.city ? req.body.city : user.city;
                    user.mobile = req.body.mobile ? req.body.mobile : user.mobile;
                }
            });
            fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => {
                if(err) {
                    return res.status(400).json("Something went wrong");
                } else {
                    return res.status(200).json("User Update sucessfully");
                }
            });
        }
    });
}

/* To delete a user using userid*/

userConstroller.delete = ( req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            let user = users.filter(user=> user['id'] == req.params.id)[0];
            if(!user) {
                return res.status(400).json("User doesnot exist");
            } else {
                users = users.filter(user=> user['id'] != req.params.id)
                fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => {
                    if(err) {
                        return res.status(400).json("Something went wrong");
                    } else {
                        return res.status(200).json("user deleted Successfull");
                    }
                });
            }
        }
    });
}

/* To logout from account */

userConstroller.logout = (req, res) => {
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            if(!(users.filter(user=> user['email'] == req.email).length > 0)) {
                return res.status(400).json("Something went wrong");
            } else {
                users = users.filter(user=> { 
                    if(user['email'] == req.email) {
                        delete user.token // removing user auth token from users details in file
                        return user;
                    } else {
                        return user;
                    }
                });
                fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => {
                    if(err) {
                        return res.status(400).json("Something went wrong");
                    } else {
                        return res.status(200).json("User logout Successful");
                    }
                });
            }
        }
    });
}

/* To create token for forgot password */

userConstroller.forgotPassword = (req, res) => {
    if(!(req.body.email)) {
        return res.status(400).json("Please enter email");
    }
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(400).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            if(!(users.filter(user=> user['email'] == req.body.email).length > 0)) {
                return res.status(404).json("User does not Exist");
            } else {
                let passwordToken = Math.random().toString(36).substring(7); // creating a random string to make password token
                users = users.filter(user=> { 
                    if(user['email'] == req.body.email) {
                        user['passwordToken'] = passwordToken; // adding password token with user detail to database file
                        return user;
                    } else {
                        return user;
                    }
                });
                fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => {
                    if(err) {
                        return res.status(400).json("Something went wrong");
                    } else {
                        return res.status(200).json({ "message" : "Token to reset password", "passwordToken" : passwordToken});
                    }
                });
            }
        }
    });
}

/* To resetting the password */

userConstroller.resetPassword = (req, res) => {
    if(!(req.body.email && req.body.passwordToken && req.body.newPassword)) {
        return res.status(400).json("Please enter email, new password and password token");
    }
    fs.readFile('userData.json','UTF-8',(err,data)=>{
        if(err){
            return res.status(401).json("Something went wrong"); 
        }
        else{
            let users = JSON.parse(data);
            if(!(users.filter(user=> user['email'] == req.body.email && user['passwordToken'] == req.body.passwordToken).length > 0)) { // check user if exist with given email and password token
                return res.status(404).json("Wrong email or password token");
            } else {
                users = users.filter(user=> { 
                    if(user['email'] == req.body.email) {
                        delete user.passwordToken;
                        user.token && delete user.token;
                        user['password'] = bcrypt.hashSync(req.body.newPassword,bcrypt.genSaltSync(10)); // encrypting new password
                        return user;
                    } else {
                        return user;
                    }
                });
                fs.writeFile("userData.json", JSON.stringify(users, null, 4), (err, result) => {
                    if(err) {
                        return res.status(401).json("Something went wrong");
                    } else {
                        return res.status(200).json({ "message" : "Password updated successful" });
                    }
                });
            }
        }
    });
}

module.exports = userConstroller;

// Gaurav Ganger