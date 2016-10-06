//gig economy interactive - oct 2016
import { ScrollCollection } from "./modules/on-scroll.js";

function mainfn(){
	var callback = function(i){
		return function(){
			console.log("Element "+i);
		}
	} 
	var sc = new ScrollCollection();
	console.log(sc);
	var i=0;
	while(i < 7){
		++i;
		var e = document.getElementById("d"+i);
		d3.select(e).html = "E"+i;
		sc.register(e, callback(i));
	}

}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});
