function reqListLoad(){
	var row, value, id, x, e, i, l
	var vbox=document.getElementById("rList")
	while (vbox.firstChild) vbox.removeChild(vbox.firstChild)

	var statement = as.db.createStatement("SELECT * FROM `search_list` ORDER BY r_name LIMIT 30;");

	statement.executeAsync({
		handleResult: function(aResultSet) {
			for (row = aResultSet.getNextRow();row;row = aResultSet.getNextRow()) {
				value = row.getResultByName("r_name"); id = row.getResultByName("r_id")

				row = document.createElement("hbox")
	            
				x=document.createElement('image')
				x.setAttribute("src","/skin/del.png")
				x.setAttribute("tooltiptext","удалить")
				x.setAttribute("onclick","reqDel('"+id+"');")
				row.appendChild(x)

				e=document.createElement('image')
				e.setAttribute("src","/skin/edit.png")
				e.setAttribute("tooltiptext","изменить настройки поиска")		
				e.setAttribute("onclick","as.virt.db2form('"+id+"');")
				row.appendChild(e)
				
				i=document.createElement('image')
				i.setAttribute("src","/skin/rename16.png")
				i.setAttribute("tooltiptext","переименовать сохранённый поиск");	
				i.setAttribute("onclick","reqRename('"+id+"','"+value+"');")
				row.appendChild(i)
				
				l=document.createElement('label')
				l.setAttribute("value",value)
				l.setAttribute("onclick","as.virt.db2get('"+id+"');")
				row.appendChild(l)
				vbox.appendChild(row)

				row = false
				}
			},
		handleError: function(aError) { print("Error: " + aError.message) },
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)  
				print("Query canceled or aborted!");
			}})
	}

function reqDel(id){
	if(id == as.virt.r_id) as.virt.r_id = ''
	var ifConf = as.app.prefs.get("extensions.as.listDelConfirm")
	var confirm = false
	if (ifConf.value) confirm = window.confirm("Удалить поисковый фильтр?")
	if(confirm || !ifConf.value){
		var statement = as.db.createStatement("DELETE FROM `search_list` WHERE r_id=:r_id;");
		statement.params.r_id=id;
		statement.executeAsync({
			handleError: function(aError) {print("Error: " + aError.message);},		
			handleCompletion: function(aReason) {	if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) print("Query canceled or aborted!")}  
			});
		var statement = as.db.createStatement("DELETE FROM `searches` WHERE r_id=:r_id;")
		statement.params.r_id = id
		statement.executeAsync({
			handleError: function(aError) {print("Error: " + aError.message);},
			handleCompletion: function(aReason) {
				if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)  
					print("Query canceled or aborted!");
				 reqListLoad();
				}  
			});
		}	
	}

function reqRename(id, name){
	var fl = false
	while(fl == false || name.length<2) {
		name=prompt('Новое название настроек поиска:',name)
		name=trim(name); fl = true
		}
	
	var statement = as.db.createStatement("UPDATE `search_list` SET r_name=:name WHERE r_id=:id;")
	statement.params.name = name
	statement.params.id = id
	
	statement.executeAsync({
		handleError: function(aError) { print("Error: " + aError.message) },		
		handleCompletion: function(aReason) {
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)  print("Query canceled or aborted!")
			reqListLoad()	}  
		})
	}