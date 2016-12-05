var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var session = require('cookie-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect('mongodb://test:test@ds159747.mlab.com:59747/restaurants', (err, db) => {
  if (err) return console.log(err);
  app.listen(process.env.PORT || 8099, () => {
    console.log('listening on port 8099');
  })

  app.use(bodyParser.urlencoded({extended : false}));
  app.use(fileUpload());
  app.set('view engine', 'ejs');
  app.use(express.static('/public'));
  app.use(bodyParser.json());
  app.use(session({name: 'session', secret: 'assgor is awesome'}));
  
  app.get('/rate', (req, res) => {
    if(req.query._id != '') {
      /**res.writeHead(200, {"Content-Type": "text/html"});
      res.send("<html><body>");
      res.send("<h1>Rate</h1><br><br>");
      res.send("<h2>Enter Score(1-10)</h2><br>");
      res.send("<form action=\"/rate\" method=\"post\">");
      res.send("<input type=\"text\" name=\"score\">");
      res.send("<input type=\"submit\" value=\"rate\">");
      res.send("</form>");
      res.send("</body></html>");**/
      res.render('rate.ejs', {_id: req.query._id});
    }
    else {
      console.log('Error! cannot rate empty record');
      res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Error! cannot rate empty record</h1>");
      res.write("<form action=\"/api/read\" method=\"get\">");
      res.write("<input type=\"submit\" value=\"Back to Main Page\"></form>");
      res.write("</body></html>");
      res.end();
    }
  })
  
  app.post('/rate', (req, res) => {
    var rated = false;
  db.collection('restaurants').find({_id:ObjectId(req.body._id)}).toArray((err, result) => {
    if (err) throw err;
    var idResult = result;
    /**
    console.log(idResult[0].ratings);
    console.log(idResult[0].ratings[0].rating.userid);
    console.log(idResult[0].ratings[1].rating.userid);
    console.log(idResult[0].ratings.length);
    console.log('---------------------------------');
    console.log(typeof(idResult[0].ratings));
    console.log(typeof(''));
    console.log(typeof(null));
    **/
    
    
    if (idResult[0].ratings != undefined ) {
      console.log('for');
      for (var i=0; i<idResult[0].ratings.length; i++) {
        console.log('in for');
        var id = idResult[0].ratings[i].rating.userid;
        console.log(id);
        if (id == req.session.userid) {
          console.log('in for if');
          rated = true;
          break;
        }
      }
    }
    console.log(rated);
    if (req.body.score == 1 || req.body.score == 2 || req.body.score == 3 || req.body.score == 4 || req.body.score == 5 || req.body.score == 6 || req.body.score == 7 || req.body.score == 8 || req.body.score == 9 || req.body.score == 10) {
        if (rated != true) {
      db.collection('restaurants').update({_id:ObjectId(req.body._id)}, {$push: {ratings: {rating: {userid: req.session.userid, score: req.body.score}}}}, (err, result) => {
      if (err) throw err;
      console.log('before redirect');
      res.redirect('/display?_id='+req.body._id);
    });
    } else {
      console.log('attempt to rate more than once');
      res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Error! You have rated this document already!</h1>");
      res.write("<a href=/display?_id="+req.body._id+">Go Back</a>");
      res.write("</body></html>");
      res.end();
    }
        }
        else{console.log('invalid input');
      res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Invalid Input! You can enter only 1 - 10!</h1>");
      res.write("<a href=/display?_id="+req.body._id+">Go Back</a>");
      res.write("</body></html>");
      res.end();}
    
  });
    
  });
                                        
          
  app.get('/', (req, res) => {
    console.log(req.session);
    if(!req.session.authenticated) {
      res.redirect('/login');
    } else res.redirect('/api/read');
  })
  
  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  })
  
  app.get('/logout', (req, res) => {
    req.session = null;
    console.log('Logout Successful', req.session);
    res.redirect('/');
  })
  
  app.get('/api/read', (req, res) => {
    db.collection('restaurants').find().toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = '';
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/name/:name', (req, res) => {
    db.collection('restaurants').find({name: new RegExp(req.params.name, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Name: '+req.params.name;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/borough/:borough', (req, res) => {
    db.collection('restaurants').find({borough: new RegExp(req.params.borough, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Borough: '+req.params.borough;
      res.json(JSON.stringify(result));
    })
  })
  
  app.get('/api/read/cuisine/:cuisine', (req, res) => {
    db.collection('restaurants').find({cuisine: new RegExp(req.params.cuisine, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Cuisine: '+req.params.cuisine;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/name/:name/borough/:borough', (req, res) => {
    db.collection('restaurants').find({name: new RegExp(req.params.name, 'i'), borough: new RegExp(req.params.borough, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Name: '+req.params.name+', Borough: '+req.params.borough;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/name/:name/cuisine/:cuisine', (req, res) => {
    db.collection('restaurants').find({name: new RegExp(req.params.name, 'i'), cuisine: new RegExp(req.params.cuisine, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Name: '+req.params.name+', Cuisine: '+req.params.cuisine;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/borough/:borough/cuisine/:cuisine', (req, res) => {
    db.collection('restaurants').find({borough: new RegExp(req.params.borough, 'i'), cuisine: new RegExp(req.params.cuisine, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Borough: '+req.params.borough+', Cuisine: '+req.params.cuisine;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/api/read/name/:name/borough/:borough/cuisine/:cuisine', (req, res) => {
    db.collection('restaurants').find({name: new RegExp(req.params.name, 'i'), borough: new RegExp(req.params.borough, 'i'), cuisine: new RegExp(req.params.cuisine, 'i')}).toArray((err, result) => {
      console.log('&&&');
      if (err) {
        console.log(err);
        res.redirect('/');
      }
      var criteria = 'Name: '+req.params.name+', Borough: '+req.params.borough+', Cuisine: '+req.params.cuisine;
      res.render('main.ejs', {userid: req.session.userid, restaurants: result, c: criteria})
    })
  })
  
  app.get('/display', (req,res) => {
    if(req.query._id != '') {
      db.collection('restaurants').find({_id:ObjectId(req.query._id)}).toArray((err, result) =>{
        console.log('***');
        //console.log(result);
        if(err) {
          console.log(err);
          res.redirect('/');
        }
        else if(result.length) {
          console.log('record found');
          console.log('render');
          //console.log(result[0])
          res.render('display.ejs', {r: result});
        }
        else {
          console.log('record not found');
          res.redirect('/');
        }
      });
    }
    else{
      consore.log('id missing');
      res.redirect('/');
    }
  });
  
  
  app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
  })
  
  app.post('/login', (req, res) => {
    if(req.body.userid != '') {
      db.collection('accounts').find({userid: req.body.userid, password: req.body.password}).toArray((err, result) =>{
      if(err) {
        console.log(err);
        res.redirect('/login');
      }
      else if(result.length) {
        console.log('Login Successful', result);
        req.session.authenticated = true;
        req.session.userid = req.body.userid;
        console.log('userid of session: ' + req.session.userid);
        res.redirect('/');
      }
      else {
        console.log('Invalid Username or Password');

        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Invalid Username or Password!</h1>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("</body></html>");
        res.write("<br>");
        res.write("<form action=\"/register\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Sign Up\"></form>");
        res.write("</body></html>")
        res.end();
      }
    })
    } else {
        console.log('Login Error: Username field is empty');
        
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Login Error: Username field is empty!</h1>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("<br>");
        res.write("</body></html>");
        res.end();
    }
  })
  
  app.post('/register', (req, res) => {
    if(req.body.userid == '') {
      console.log('Register Error: Username field is empty');
      res.writeHead(400, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Register Error: Username field is empty!</h1>");
      res.write("<br>");
      res.write("<form action=\"/register\" method=\"get\">");
      res.write("<input type=\"submit\" value=\"Go Back\"></form>");
      res.write("<br>");
      res.write("</body></html>");
      res.end();
    } else {
    db.collection('accounts').find({userid: req.body.userid}).toArray((err, result) => {
      if(err) {
        console.log(err);
        res.redirect('/register');
      }
      else if(result.length) {
        console.log('Username Already Been Used');
        //res.redirect('/register');
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Username Already Been Used!</h1>");
        res.write("<br>");
        res.write("<form action=\"/register\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Go Back\"></form>");
        res.write("<br>");
        res.write("<form action=\"/login\" method=\"get\">");
        res.write("<input type=\"submit\" value=\"Login\"></form>");
        res.write("</body></html>");
        res.end();
      }
      else
      {
        db.collection('accounts').insert({userid: req.body.userid, password: req.body.password}, (err, result) => {
        if(err) {
          console.log(err);
          res.redirect('/register');
        } 
          else
        {
          console.log('Sign Up Successful', result);
          //res.redirect('/login');
          res.writeHead(200, {"Content-Type": "text/html"});
          res.write("<html><body>");
          res.write("<h1>Sign Up Successful!</h1>");
          res.write("<br>");
          res.write("<form action=\"/login\" method=\"get\">");
          res.write("<input type=\"submit\" value=\"Login\"></form>");
          res.write("<br>");
          res.write("</body></html>");
          res.end();
        }
        })
      }
    })
  }})
  app.get('/api/create', (req, res) => {
    res.sendFile(__dirname + '/public/insert.html');
  })
  
  app.post('/api/create', (req, res) => {
    if(req.body.name == '') {
      console.log('Error: Name field is empty');
      /**res.writeHead(400, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Error: Name field is empty</h1>");
      res.write("<br>");
      res.write("<form action=\"/api/create\" method=\"get\">");
      res.write("<input type=\"submit\" value=\"Go Back\"></form>");
      res.write("</body></html>");
      res.write("<br>");
      res.end(); **/
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({status: "failed"}, null, 3));
      //res.json({status: "failed"});
    } else
      {
        var data = new Buffer(req.files.photo.data).toString('base64');
        var mimetype = req.files.photo.mimetype;
        if (data == ''){mimetype = '';}
        db.collection('restaurants').insert({name: req.body.name, borough: req.body.borough, cuisine: req.body.cuisine, address: {street: req.body.street, building: req.body.building, zipcode: req.body.zipcode, coord: {lat: req.body.lat, long: req.body.long}}, createdby: req.session.userid, photo: {data : data,
    "mimetype" : mimetype}}, (err, result) => {
          if(err) {
            console.log(err);
            res.redirect('/api/create');
          } else {
            console.log('Create Successful');
            console.log(req.files.photo);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({status: "ok", _id: result["ops"][0]["_id"]}, null, 3));
          }
        })
      }
  })
  
  app.get('/delete', (req, res) => {
    db.collection('restaurants').find({_id:ObjectId(req.query._id)}).toArray((err, result) => {
      if (err) throw err;
      if (result[0].createdby != req.session.userid) {
        res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Only author can delete this document!</h1>");
      res.write("<br>");
      res.write("<a href=/display?_id="+req.query._id+">Go Back</a>");
      res.write("</body></html>");
      res.end();
      } else {
        db.collection('restaurants').remove({_id:ObjectId(req.query._id)}, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("<html><body>");
    res.write("<h1>Delete Complete</h1><br><br>");
    res.write("<a href=/> Back to Main Page</a>");
    res.write("</body></html>");
    res.end();
  })
      }
    })
  })
  
  app.get('/update', (req, res) => {
    console.log('id debug');
    console.log(req.query._id);
    res.render('update.ejs', {_id: req.query._id});
  })
  
  app.post('/update', (req, res) => {
    
    db.collection('restaurants').find({_id:ObjectId(req.body._id)}).toArray((err, result) => {
      if (err) throw err;
      if (result[0].createdby != req.session.userid) {
        res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Only author can update this document!</h1>");
      res.write("<br>");
      res.write("<a href=/display?_id="+req.body._id+">Go Back</a>");
      res.write("</body></html>");
      res.end();
      } else {
      if (req.body.name == '') {
        console.log('Update Error: Name field is empty');
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("<html><body>");
        res.write("<h1>Update Error: Name field is empty</h1>");
        res.write("<br>");
        res.write("<a href=/display?_id="+req.body._id+">Go Back</a>");
        res.write("</body></html>");
        res.write("<br>");
        res.end();
      }
      else {
        var data = new Buffer(req.files.photo.data).toString('base64');
        var mimetype = req.files.photo.mimetype;
        if (data == ''){mimetype = '';}
        db.collection('restaurants').update({_id:ObjectId(req.body._id)}, {$set: {name: req.body.name, borough: req.body.borough, cuisine: req.body.cuisine, address: {street: req.body.street, building: req.body.building, zipcode: req.body.zipcode, coord: {lat: req.body.lat, long: req.body.long}}, photo: {data: data, mimetype: mimetype}}}, (err, result) => {
          if (err) throw err;
          res.writeHead(200, {"Content-Type": "text/html"});
          res.write("<html><body>");
          res.write("<h1>Update Successful</h1>");
          res.write("<br>");
          res.write("<a href=/display?_id="+req.body._id+">Go Back</a>");
          res.write("</body></html>");
          res.end();
        })
      }
      
    }
    })
  })
  
  app.get('/search', (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("<html><body>");
    res.write("<h1>Search</h1><br><br>");
    res.write("<form action=\"/search\" method=\"post\">");
    res.write("Name: <br><input type=\"text\" name=\"name\"><br><br>");
    res.write("Borough: <br><input type=\"text\" name=\"borough\"><br><br>");
    res.write("Cuisine: <br><input type=\"text\" name=\"cuisine\"><br><br>");
    res.write("<input type=\"submit\" value=\"Search\"></form>");
    res.write("</body></html>");
    res.end();
  })
  
  app.post('/search', (req, res) => {
    if(req.body.name == '' && req.body.borough == '' && req.body.cuisine == '') {
      res.writeHead(500, {"Content-Type": "text/html"});
      res.write("<html><body>");
      res.write("<h1>Error: No search criteria found!</h1><br><br>");
      res.write("<a href=/search> Go Back</a>");
      res.write("</body></html>");
      res.end();
    } else {
      var name;
      var borough;
      var cuisine;
    
      if(req.body.name != '') {
        name = '/name/' + req.body.name;
      } else {
        name = '';
      }
      if(req.body.borough != '') {
        borough = '/borough/' + req.body.borough;
      } else {
        borough = '';
      }
      if(req.body.cuisine != '') {
        cuisine = '/cuisine/' + req.body.cuisine;
      } else {
        cuisine = '';
      }
      var queryString = '/api/read'+name+borough+cuisine;
      res.redirect(decodeURI(queryString));
    }
  })
  
})
