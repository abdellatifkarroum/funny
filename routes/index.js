var express = require('express');
var router = express.Router();
var fs = require("fs");
//var mysql = require("mysql");
//var app = require("../app")
//var connection = app.connection;

var gameCategories = ["Puzzle","Racing","Sports","Strategy","Zombie","Defense","Shooting","War","Arcade","SoundBoards"];

//var page = 10;

var nbrPost = 20;



/* GET home page. */

router.get('/',function(req,res,next){
	res.redirect("/page/1");
});
router.get('/page/:page([0-9]+)', function(req, res, next) {

	//res.redirect('/0');
	//var categorie = (req.params.categorie);
	var page = parseInt(req.params.page);
	var offset = (page-1)*nbrPost;

	var query = "select * from pictures order by timeAdd DESC limit 20 offset "+offset;
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select count(*) as nbrPost from pictures";

	//var query2 = "select distinct(categorie) from games";
	var query = query+";"+query1+";"+query2;

	pagination(res,query,page,offset,"index.html.twig");

	//connection.end();
	  	
});



router.get('/funnyjokes',function(req,res,next){
	res.redirect("/funnyjokes/page/1");
})

router.get('/funnyjokes/page/:page([0-9]+)', function(req, res, next) {
	var page = parseInt(req.params.page);
	var offset = (page-1)*nbrPost;
	var query = "select * from jokes limit 10 offset "+offset;
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select count(*) as nbrPost from jokes";
	var query3 = "select * from jokes order by id desc limit 4"
	var query = query+";"+query1+";"+query2+";"+query3;

	pagination(res,query,page,offset,"jokes.html.twig");

	//connection.end();
  
});

router.get('/like', function(req, res, next) {
	
	var id = req.query.id;
	var query = "update jokes set likes = likes+1 where id = "+id;
	
	pool.getConnection(function(err, connection) {
		
		var a = connection.query(query,function(err,results){
			
			res.send("success");
			connection.release();

		});

	});

	

	//connection.end();
  
});





function post(req,res,query,table,categories){
	var filename = "%"+req.params.id+"%";
	pool.getConnection(function(err, connection) {
		var query = connection.query(query,[filename],function(err,results,fields){
			connection.release();
			var id = filename//+".jpg";
			var next, previous;

			var query = "SELECT * FROM "+table+" WHERE id = (( SELECT id FROM "+table+" WHERE filename like '"+id+"' limit 1)+1 ) or id = (( SELECT id FROM "+table+" WHERE filename like '"+id+"' limit 1)-1)";
			console.log(query);
			connection.query(query,["%"+id+"%","%"+id+"%"],function(err,result,fields){

				if(err)throw err;
				var parametres = {};
				if(!result[0]){

					res.render("error.html.twig");

				}
				if(result.length == 1){

					if(result[0].id > 100){

						parametres = {
							"post":results,
							"previous":(result[0].filename).split(".")[0]
						};

					}else{

						parametres = {
							"post":results,
							"next":(result[0].filename).split(".")[0]
						};

					}

				}else{

					parametres = {
							"post":results,
							"next":(result[1].filename).split(".")[0],
							"previous":(result[0].filename).split(".")[0]
						};

				}

				parametres["pictureCategories"] = categories[0];
				parametres["gameCategories"] = gameCategories;

				res.render("post.html.twig",parametres);

			});

			
		});
	});
	console.log(query.sql);

	//connection.end();
	
}

module.exports = router;

function pagination(res,query,page,offset,render){
	var barePagination = {"debut":1,"actuel":1,"fin":9};
	var params;
	pool.getConnection(function(err,connection){

		connection.query(query,function(err,results){
			//console.log(results);
			connection.release();
			var nbrPage = Math.ceil(results[2][0].nbrPost/nbrPost);
			
			console.log(nbrPage); 
			
			barePagination.actuel = page;

			//if( barePagination.actuel <= nbrPage-10 ){
				if(barePagination.actuel > 4 && barePagination.actuel < nbrPage-4){
					barePagination.debut = barePagination.actuel - 4;
					barePagination.fin = barePagination.actuel + 4;
				}
				if(barePagination.actuel <= 4){

					barePagination.debut = 1;
					barePagination.fin = 9;

				}
				if(barePagination.actuel >= (nbrPage - 4)){

					barePagination.debut = nbrPage - 9;
					barePagination.fin = nbrPage;

				}
			//}

			
			var pages = [];
			for(var i = barePagination.debut; i <= barePagination.fin; i++){
				pages.push(i);
			}
			console.log(JSON.stringify(barePagination));
			barePagination.pages = pages;
			

			params = {
				"elements"	: results[0],
				"pictureCategories" : results[1],
				"gameCategories" 	: gameCategories,
				"barePagination"	: barePagination,
				"nbrPage"			: nbrPage
			}
			if(results[3])params.recents = results[3];
			res.render(render,params);
		});
	});

	
}

function insert(){
	var path ="D:\\caspserFiles\\games\\allData.json";
	fs.readFile(path, function (err, data) {
	  console.log("connection is good");
	  var obj = JSON.parse(data);
	  //var query = "insert into jokes set joke = ?, title = ?, dateAdd = ?";
	  //for(var i=0;i<obj.length;i++){
	  for(var i=0;i<obj.length;i++){
	  		  var query = "insert into games set filename = ?, title = ?, description = ?, likes=?, dislike=?, categorie=?, views=?, dateAdd=?";

	  	var filename = (obj[i].filename);
	  	var title = (obj[i].title);
	  	var desc = (obj[i].desc);
	  	//console.log(desc);
	  	var like = parseInt(obj[i].like);
	  	var dislike = parseInt(obj[i].dislike);
	  	var categorie = obj[i].cat;
	  	var views,dateAdd;

	  	if(obj[i].views){
	  		views = parseInt(obj[i].views);
	  		var t = (obj[i].dateAdd).split("/");
	  		dateAdd = t[2]+'-'+t[0]+'-'+t[1];
	  	}else{
	  		views = 0;
	  		dateAdd = "2015-10-26";
	  	}

	  	var data = [filename,title,desc,like,dislike,categorie,views,dateAdd];
	  	
	  	var query = connection.query(query,data,function(err, result){
	  	//connection.query(query,obj[i].joke,function(err, result){
	  		
	  		if(err)throw err;

	  	});
	  	console.log(query.sql);

	  	
	  };
	  
	});
}
