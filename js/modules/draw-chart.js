import data from "./data.js";
import format from "./formats.js";
import nameshort from "./nameshort.js";

export default function draw_chart(container, indicator){

	var state = {activated:false};
	if(indicator=="rooms"){
		state.NE = "rooms_ne";
		state.PR = "rooms";
	}
	else{
		state.NE = "rides_ne";
		state.PR = "rides";
	}

	state.NECHG = state.NE + "_chg";
	state.NEDIFF = state.NE + "_diff";
	state.NE12 = state.NE + "_12";
	state.NE14 = state.NE + "_14";

	state.PRCHG = state.PR + "_chg";
	state.PRDIFF = state.PR + "_diff";
	state.PR12 = state.PR + "_12";
	state.PR14 = state.PR + "_14";

	state.sort = state.NECHG; //default is sort by nonemployer data 

	//add in absolute differences
	state.data = data.map(function(d,i,a){
		d.rooms_ne_diff = d.rooms_ne_14 - d.rooms_ne_12;
		d.rooms_diff = d.rooms_14 - d.rooms_12;

		d.rides_ne_diff = d.rides_ne_14 - d.rides_ne_12;
		d.rides_diff = d.rides_14 - d.rides_12;

		return d;
	});

	//dom elements
	var cwrap = d3.select(container);
		cwrap.style("max-width", "1200px")
			 .style("min-width","360px")
			 .style("margin","0px auto")
			 .style("padding","0px 5px");

	var wrap = cwrap.append("div")
				    .style("padding","10px 25px 10px 5px")
				    .style("border","1px solid #dddddd")
				    .style("margin","0px");

	var legend_wrap = wrap.append("div").classed("disable-highlight",true).style("text-align","right").style("margin","10px 0px").append("div").style("display","inline-block");

	var svg = wrap.append("svg");
	var maing = svg.append("g");

	var notes_wrap = cwrap.append("div");
	notes_wrap.append("p").style("margin","10px")
			  .text("Notes and sources go here...");

	//colors for payroll, nonemployer
	var cols = {PR:"#F79106", NE:"#2D289B"};

	var swatches = {};
	swatches.u = legend_wrap.selectAll("div")
			.data([
					{label:"Payroll employment", code:"PR"}, 
				   	{label:'Nonemployer ("gig") employment', code:"NE"}
				  ]);
	swatches.e = swatches.u.enter().append("div").style("display","inline-block").classed("c-fix",true).style("margin","0px 20px 5px 0px").style("cursor","pointer");

		swatches.e.append("div").style("height","14px").style("width","14px").style("display","inline-block").style("border-radius","7px").style("margin-right","5px")
								.style("background-color", function(d,i){return cols[d.code]})
		swatches.e.append("p").text(function(d,i){return d.label}).style("display","inline-block").style("margin","0px");

	swatches.e.on("mousedown",function(d,i){
		state.sort = state[d.code+"CHG"];
		state.draw();
	});

	state.numdraws = 0;
	state.draw = function(){
		++state.numdraws;


		//figure out widths
		try{
			var cbox = container.getBoundingClientRect();
			var width = cbox.right - cbox.left;

			if(isNaN(width)){throw "badWidth"}
		}
		catch(e){
			var width = 780;
		}
		finally{
			
			if(width < 480){
				var label_reserve = 200;
				var fs = "10px";
				var dy = 4;
				var height = 900;
				var numticks = 2;
			}
			else if(width < 900){
				var label_reserve = 230;
				var fs = "13px"
				var dy = 5;
				var height = 950;
				var numticks = 3;
			}
			else{
				var label_reserve = 290;
				var fs = "16px";
				var dy = 6;
				var height = 1100;
				var numticks = 6;
			}

			//plot_share is used in the x scale below
			var plot_share = Math.ceil((label_reserve/width)*100);
		}

		var dcopy = state.data.slice(0); //shallow copy
		dcopy.sort(function(a,b){
			var V = state.sort;

			if(a[V] == b[V]){
				return 0;
			}
			else if(a[V] == null){
				return 1;
			}
			else if(b[V] == null){
				return -1;
			}
			else{
				return a[V] - b[V] > 0 ? -1 : 1;
			}
		});





		var padding = {top:40, right:0, bottom:20, left:0};
		svg.style("height",(height+padding.top+padding.bottom)+"px").style("width","100%")
		maing.attr("transform","translate(0,"+padding.top+")")

		var min = d3.min(data, function(d,i){
			return d[state.PRCHG] < d[state.NECHG] ? d[state.PRCHG] : d[state.NECHG];
		});
		var max = d3.max(data, function(d,i){
			return d[state.PRCHG] > d[state.NECHG] ? d[state.PRCHG] : d[state.NECHG];
		});
		var rangePad = Math.abs(max-min)*0.025;

		var range = [min-rangePad, max+rangePad];

		var x = d3.scaleLinear().domain(range).range([plot_share,97]);
		var y = d3.scaleBand().domain(dcopy.map(function(d,i){return d.cbsa_code})).range([0,height])
			  .round(true).paddingOuter(0.4).align(0.5);
		var step = y.bandwidth();

		var xmin = x(range[0])+"%";
		var xmax = x(range[1])+"%";

		var ymin = y(dcopy[0].cbsa_code)-step;
		var ymax = y(dcopy[dcopy.length-1].cbsa_code)+step;

		//grid lines
		var grid = {};

		var ticks = x.ticks(numticks); 
			grid.v = {};
			grid.v.u = maing.selectAll("g.v-grid-line").data(ticks);
			grid.v.u.exit().remove();
			grid.v.e = grid.v.u.enter().append("g").classed("v-grid-line",true);
			  grid.v.e.append("line");
			grid.v.m = grid.v.e.merge(grid.v.u);
			
			grid.v.m.select("line").attr("x1", function(d,i){
				return x(d)+"%";
			}).attr("x2", function(d,i){
				return x(d)+"%";
			}).attr("y1",ymin).attr("y2",ymax)
			  .attr("stroke",function(d,i){
			  	return d==0 ? "#333333" : "#bbbbbb";
			  })
			  .attr("stroke-width",function(d,i){
			  	return d==0 ? "2px" : "1px";
			  })
			  .attr("stroke-dasharray","2,3")
			  .style("shape-rendering","crispEdges");

			grid.vt = {};
			grid.vt.u = grid.v.m.selectAll('text').data(function(d,i){return [d,d]});
			grid.vt.e = grid.vt.u.enter().append("text");
			grid.vt.m = grid.vt.e.merge(grid.vt.u);
			grid.vt.m.attr("x",function(d,i){return x(d)+"%"})	
					 .attr("text-anchor", "middle")
					 .attr("y", function(d,i){
					 	return i==0 ? ymin : ymax;
					 })
					 .attr("dy", function(d,i){
					 	return i==0 ? "-3px" : "15px";
					 }).text(function(d,i){
					 	return format.fn(d, "pct0");
					 })
					 .style("font-size","13px")
					 .style("fill","#666666");


		//metro groups
		var groups = {};
			groups.u = maing.selectAll("g.metro-groups").data(dcopy, function(d,i){return d.cbsa_code});
			groups.u.exit().remove();
			groups.e = groups.u.enter().append("g").classed("metro-groups",true);
			groups.m = groups.e.merge(groups.u);
			groups.m.transition().duration(state.numdraws == 1 ? 0 : 1000)
					.attr("transform", function(d,i){
						return "translate(0," + y(d.cbsa_code) + ")";
					});

			//horizontal grid lines
			grid.h = {};
			grid.h.u = groups.m.selectAll("line.grid-line").data(function(d,i){
				return [d];
			});
			grid.h.u.exit().remove();
			grid.h.e = grid.h.u.enter().append("line").classed("grid-line",true);
			grid.h.m = grid.h.e.merge(grid.h.u);
			grid.h.m.attr("y1","0%").attr("y2","0%").attr("x1",xmin).attr("x2",xmax)
				   .attr("stroke","#bbbbbb")
				   .attr("stroke-width","1")
				   .attr("stroke-dasharray","2,3")
				   .style("shape-rendering","crispEdges")
				   ;

		var labels = {};
			labels.u = groups.m.selectAll("text").data(function(d,i){
				return [nameshort(d.cbsa_title, true)];
			});
			labels.u.exit().remove();
			labels.e = labels.u.enter().append("text");
			labels.m = labels.e.merge(labels.u);
			labels.m.attr("x", xmin).attr("text-anchor","end").attr("dx","-3px").attr("y",dy)
					.text(function(d,i){return d})
					.style("font-weight",function(d,i){return d=="United States" ? "bold" : "normal"})
					.style("font-size", fs);


		//data lines
		var lines = {};
			lines.u = groups.m.selectAll("line.data-line").data(function(d,i){
				return d[state.PRCHG] && d[state.NECHG] ? [d] : [];
			});
			lines.u.exit().remove();
			lines.e = lines.u.enter().append("line").classed("data-line",true);
			lines.m = lines.e.merge(lines.u);
			lines.m.attr("y1","0%").attr("y2","0%")
				   .attr("stroke","#aaaaaa")
				   .attr("stroke-width","1")
				   .style("shape-rendering","crispEdges")
				   ;

		var dots = {};
			dots.u = groups.m.selectAll("circle").data(function(d,i){
				var D = [];
				if(d[state.PRCHG]){
					D.push({
							title:"Change in payroll employment, 2012–14", 
							value:d[state.PRCHG], 
							formatted: format.fn(d[state.PRCHG], "pct1"),
							code:"PR"
						});
					}
				if(d[state.NECHG]){
					D.push({
							title:"Change in gig employment, 2012–14", 
							value:d[state.NECHG], 
							formatted: format.fn(d[state.NECHG], "pct1"),
							code:"NE"
						});
					}
				return D;
			});
			dots.u.exit().remove();
			dots.e = dots.u.enter().append("circle");
			dots.m = dots.e.merge(dots.u).attr("r","6");

			dots.m.attr("fill", function(d,i){return cols[d.code]});

			//set line and dot postions to active state
			state.activate = function(duration){
				state.activated = true;
				
				lines.m.transition().duration(duration)
				   .attr("x1", function(d,i){return x(d[state.PRCHG])+"%"})
				   .attr("x2", function(d,i){return x(d[state.NECHG])+"%"});

				dots.m.transition()
					.duration(duration)
					.attr("cx", function(d,i){
						return x(d.value)+"%";	
				});
			}

			//set line and dot postiions to neutral state
			state.neutral = function(){
				lines.m.transition().duration(0)
				   .attr("x1", x(0)+"%")
				   .attr("x2", x(0)+"%");

				dots.m.transition().duration(0)
					.attr("cx", x(0)+"%")
					.attr("cy", "0%");
			}

			if(state.activated){
				state.activate(0);
			}
			else{
				state.neutral();
			}
		
		}

		state.draw();

		var redrawTimer;
		window.addEventListener("resize", function(){
			clearTimeout(redrawTimer);
			redrawTimer = setTimeout(state.draw,150);
		});

		return function(){
			state.activate(1500);
		};

}