//gig economy interactive - oct 2016
import ScrollCollection from "./on-scroll.js";

import draw_chart from "./draw-chart.js";

function mainfn(){
	var callback = function(i){
		return function(){
			console.log("Element "+i);
		}
	} 
	var sc = new ScrollCollection();

	var chart_container_rides = document.getElementById("metro-interactive-rides")
	var chart_container_rooms = document.getElementById("metro-interactive-rooms")

	var activate_rides_chart = draw_chart(chart_container_rides, "rides");
	var activate_rooms_chart = draw_chart(chart_container_rooms, "rooms");

	sc.register(chart_container_rides, activate_rides_chart);
	sc.register(chart_container_rooms, activate_rooms_chart);

}

document.addEventListener("DOMContentLoaded", function(){
	mainfn();
});
