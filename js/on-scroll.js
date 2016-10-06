//on-scroll: register arbitrary scroll events

//scroll collection constructor
export function ScrollCollection(){
	this.count = 0;
	this.listeners = {};
}

//register event(s) when the element comes into view (onview) or is scrolled (onscroll)
ScrollCollection.prototype.register = function(element, onview, onscroll){
	++this.count;

	var id = "e" + this.count;

	var event = {};
		event.viewed = false;
		event.viewing = false;
		event.get_box = function(){
			try{
				var box = element.getBoundingClientRect();
			}
			catch(e){
				var box = null;
			}
			return box;
		};
		event.on_view = onview;
		event.on_scroll = onscroll;
	
	this.listeners[id] = event;

	var self = this;

	setTimeout(function(){self.activate(id)},0); //attempt to activate after any rendering of view

	//on first registration, add scroll event
	if(this.count===1){
		window.addEventListener("scroll", function(){
			self.activate_all();
		});
	}
}

//run activation methods if in view
ScrollCollection.prototype.activate = function(id){
	if(this.listeners.hasOwnProperty(id)){
		var window_height = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0));
		
		var listener = this.listeners[id];

		var box = listener.get_box();

		if(box==null || window_height==0){
			listener.viewed = true;
			listener.viewing = false;
			listener.on_view();
		}
		else{
			listener.viewing = box.top-window_height < 0 && box.top > 0;

			var top = box.top;
			var bottom = box.bottom;
			var middle = top + ((bottom-top)/2)

			//if the middle of the target element is somwhere in the viewport, run on_view (if not already run)
			if(!listener.viewed && middle < window_height && middle > 0){
				listener.viewed = true;
				listener.on_view();
				console.log("ACTIVATED: "+id);

				//if there isn't a scroll event registered delete after activation
				if(listener.on_scroll==null){delete this.listeners[id];}
			}

			if(listener.viewing && listener.on_scroll){
				listener.on_scroll({top:top, middle:middle, bottom:bottom});
			}

		}
	}
}

//run activation methods for all if in view
ScrollCollection.prototype.activate_all = function(){
	for(var id in this.listeners){
		if(this.listeners.hasOwnProperty(id)){ this.activate(id); }
	}	
}	
