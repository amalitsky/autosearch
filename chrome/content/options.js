optWin = function(opener) {
	this.init = function (){
		//opener.as.cons.logStringMessage(this.fields.length)
		this.fields = getElementsByTagNames('menulist','checkbox')
		for (var i = 0; i<this.fields.length; i++)
			opener.as.form.fields[this.fields[i].id].toFormObj(this.fields[i])
		}
	
	this.toVirt = function (){
		for (var i = 0; i<this.fields.length; i++) opener.as.form.fields[this.fields[i].id].fromFormObj(this.fields[i])
		}
	}
	
/*switch (tmp.type){
	case 1: tmp.value = this.fields[i].selectedItem.value; break;
	case 3: tmp.value = this.fields[i].checked ? 1 : 0; break;
	default: opener.as.cons.logStringMessage('AS.optWin: неизвестный тип элемента '+this.fields[i].id)}
	
switch (tmp.type){
	case 1: mlSelectByVal(this.fields[i],tmp.value); break;
	case 3: this.fields[i].checked = tmp.value; break;
	default: opener.as.cons.logStringMessage('AS.optWin: неизвестный тип элемента '+this.fields[i].id)}*/