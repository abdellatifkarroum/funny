var express = require('express');
var router = express.Router();


//var app = require("../app")
//var connection = app.connection;
var gameCategories = ["Puzzle","Racing","Sports","Strategy","Zombie","Defense","Shooting","War","Arcade","SoundBoards","Maze","Space","Flying","Fighting"];
var gifCategories = ["Puzzle","Racing","Sports","Strategy","Zombie","Defense","Shooting","War","Arcade","SoundBoards","Maze","Space","Flying","Fighting"];

//var page = 10;

var nbrPost = 20;



router.get('/', function(req, res, next) {

	res.redirect("/funnygifs/page/1");
	//console.log("redirection");
	//connection.end();
  
});

router.get('/categorie/:categorie',function(req,res,next){
	var categorie = (req.params.categorie);
	res.redirect("/funnygifs/categorie/"+categorie+"/1");
});

router.get('/categorie/:categorie/:page([0-9]+)', function(req, res, next) {

	var categorie = (req.params.categorie);
	var page = parseInt(req.params.page);
	var offset = (page-1)*nbrPost;
	var query = "select * from gifs where categorie like '"+categorie+"' order by timeAdd DESC  limit "+nbrPost+" offset "+offset;
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select count(*) as nbrPost from gifs where categorie like '"+categorie+"'";
	//var query2 = "select distinct(categorie) from games";
	var query = query+";"+query1+";"+query2;

	pagination(res,query,page,offset,"gifsCategorie.html.twig",categorie,next);
	

	

	//connection.end();
  
});



router.get('/funnygif/:id',function(req,res,next){
	
	var filename = req.params.id+".webm";
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select distinct(categorie) from games";
	var query3 = "update gifs set views = views+1 where filename like "+pool.escape(filename)+"";
	//console.log(query3+' query3');
	var query4 = "select * from gifs order by id desc limit 4"
	var query = query1+";"+query2+";"+query3+";"+query4;
	pool.getConnection(function(err,connection){

		connection.query(query,function(err,categories){
			connection.release();
			//if(err) throw err;
			var query = "select * from gifs where filename like ?";

			post(req,res,query,"gifs",categories,filename,next);

		});

	});
	

	

});

router.get("/like/",function(req,res,next){
	var id = (req.query.id);
	var query = "update gifs set likes = likes+1 where id = "+(id);
	pool.getConnection(function(err,connection){

		connection.query(query,function(err,rows,fields){
			connection.release();
			res.send("success");

		});
	})
});



function post(req,res,query,table,categories,filename,nextt){
	
	pool.getConnection(function(err,connection){

		var picture = connection.query(query,[filename],function(err,results){
			//connection.release();
			var id = filename//+".jpg";
			var next, previous;


			var query = "(SELECT * FROM "+table+" WHERE dateAdd < ( SELECT dateAdd FROM "+table+" WHERE filename like ? ) order by dateAdd ASC limit 1) union  (SELECT * FROM "+table+" WHERE dateAdd > ( SELECT dateAdd FROM "+table+" WHERE filename like ? ) order by dateAdd DESC limit 1)";
			//console.log(results);
			connection.query(query,[id,id],function(err,result,fields){
				connection.release();
				
				var parametres = {};
				if(!result && !result[0]){
					var err = new Error('Not Found');
				    err.status = 404;
				    nextt(err);return;
					//res.render("error.html.twig");

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
				parametres["recents"] = categories[3];

				res.render("gif.html.twig",parametres);

			});
			
		});
		////console.log(query.sql)

	});
	
	
}

router.get('/page/:page([0-9]+)', function(req, res, next) {
	
	var page = parseInt(req.params.page);
	var offset = (page-1)*nbrPost;
	//var query = "select * from pictures limit "+nbrPost+" offset "+offset;
	var query = "select * from gifs order by timeAdd desc  limit "+nbrPost+" offset "+pool.escape(offset)+" ";
	var query1 = "select distinct(categorie) from pictures";
	var query2 = "select count(*) as nbrPost from gifs";
	//var query2 = "select distinct(categorie) from games";
	var query3 = query+";"+query1+";"+query2;

	pagination(res,query3,page,offset,"gifs.html.twig");

	////console.log(JSON.stringify(params));
	

});

function pagination(res,query,page,offset,render,categorie,nextt){
	var barePagination = {"debut":1,"actuel":1,"fin":9};
	var params;
	//console.log(query);
	pool.getConnection(function(err,connection){

		connection.query(query,function(err,results){
			connection.release();
			//console.log(results[2][0]);
			if(!results || results[2][0].nbrPost == 0){
					var err = new Error('Not Found');
				    err.status = 404;
				    nextt(err);return;
					//res.render("error.html.twig");

				}
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
				if(nbrPage > 4 && barePagination.actuel >= (nbrPage - 4)){

					barePagination.debut = nbrPage - 9;
					barePagination.fin = nbrPage;

				}
				if(nbrPage <= 9){

					barePagination.debut = 1;
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
				"gifs"	: results[0],
				"pictureCategories" : results[1],
				"gameCategories" 	: gameCategories,
				"barePagination"	: barePagination,
				"nbrPage"			: nbrPage
			}
			if(categorie)params.categorie = categorie;
			res.render(render,params);
		});
	});

	
}

module.exports = router;




