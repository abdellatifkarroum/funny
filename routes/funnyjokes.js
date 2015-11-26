var express = require('express');
var router = express.Router();
var fs = require("fs");
//var mysql = require("mysql");
//var app = require("../app")
//var connection = app.connection;

var gameCategories = ["Puzzle","Racing","Sports","Strategy","Zombie","Defense","Shooting","War","Arcade","SoundBoards"];

var page = 10;

var nbrPost = 10;



/* GET home page. */





router.get('/',function(req,res,next){
	res.redirect("/funnyjokes/page/1");
})

router.get('/page/:page([0-9]+)', function(req, res, next) {
	var page = parseInt(req.params.page);
	var offset = (page-1)*nbrPost;
	var query = "select * from jokes where publish = 1 order by timeAdd DESC limit "+nbrPost+" 10 offset "+offset;
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select count(*) as nbrPost from jokes";
	var query3 = "select * from jokes where publish = 1 order by timeAdd desc limit 4"
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

router.get('/funnyjoke/:id([0-9]+)',function(req,res,next){
	
	var filename = parseInt(req.params.id);;
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select distinct(categorie) from games";
	var query3 = "update jokes set views = views+1 where id = "+filename;
	var query4 = "select * from jokes where publish = 1 order by timeAdd desc limit 6"
	var query = query1+";"+query2+";"+query3+";"+query4;
	pool.getConnection(function(err,connection){

		connection.query(query,function(err,categories){
			connection.release();
			//if(err) throw err;
			var query = "select * from jokes where id = ? and publish = 1";
			//console.log(query)

			post(req,res,query,"jokes",categories,filename,next);

		});

	});
	

	

});





function post(req,res,query,table,categories,id,nextt){
	var filename = id;
	pool.getConnection(function(err, connection) {
		var query1 = connection.query(query,[id],function(err,results,fields){
			connection.release();
			var id = filename//+".jpg";
			var next, previous;

			//var query = "SELECT * FROM "+table+" WHERE id = (( SELECT id FROM "+table+" WHERE id = '"+id+"' limit 1)+1 ) or id = (( SELECT id FROM "+table+" WHERE id = '"+id+"' limit 1)-1)";
			var query = "(SELECT * FROM "+table+" WHERE dateAdd < ( SELECT dateAdd FROM "+table+" WHERE id = ? ) order by dateAdd ASC limit 1) union  (SELECT * FROM "+table+" WHERE dateAdd > ( SELECT dateAdd FROM "+table+" WHERE id = ? ) order by dateAdd DESC limit 1)";
			//console.log(query);
			connection.query(query,[id,id],function(err,result,fields){

				if(err)throw err;
				var parametres = {};
				if(!result[0]){

					var err = new Error('Not Found');
				    err.status = 404;
				    nextt(err);return;

				}
				if(result.length == 1){

					if(result[0].id > 100){

						parametres = {
							"post":results,
							"next":result[0].id
						};

					}else{

						parametres = {
							"post":results,
							"previous":result[0].id
						};

					}

				}else{

					parametres = {
							"post":results,
							"previous":result[0].id,
							"next":result[1].id
						};

				}

				parametres["pictureCategories"] = categories[0];
				parametres["gameCategories"] = gameCategories;
				parametres["recents"] = categories[3];
				//console.log(JSON.stringify(categories[3]))

				res.render("joke.html.twig",parametres);

			});

			
		});
		//console.log(query1.sql);

	});
	
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
			
			//console.log(nbrPage); 
			
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
			//console.log(JSON.stringify(barePagination));
			barePagination.pages = pages;
			

			params = {
				"elements"	: results[0],
				"pictureCategories" : results[1],
				"recents"			: results[3],
				"gameCategories" 	: gameCategories,
				"barePagination"	: barePagination,
				"nbrPage"			: nbrPage
			}
			
			res.render(render,params);
		});
	});

	
}


