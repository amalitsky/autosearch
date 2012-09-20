debugOne = function (id){
	var	
	statement = as.db.createStatement("SELECT sl.r_name as name,  s.* FROM `searches` as s LEFT JOIN `search_list` as sl ON s.r_id = sl.r_id WHERE s.r_id=:id LIMIT 1;");
	statement.params.id = id;
	statement.executeAsync({
		handleResult: function(aResultSet){
			var row = aResultSet.getNextRow(), name = row.getResultByName("name");
			if(name !== null){
				as.cons.logStringMessage("debugOne: id: '" + id + "', gotten: '" + name + "'");}
			else as.cons.logStringMessage("debugOne: Null name");
			},
		handleError: function(aError){ alert("Error: " + aError.message) },
		handleCompletion: function() { }
		});
	}