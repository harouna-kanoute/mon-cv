// Nav
(function($) {
	var defaults = {
		topSpacing: 0,
		bottomSpacing: 0,
		className: 'is-sticky',
		wrapperClassName: 'sticky-wrapper',
		center: false,
		getWidthFrom: '',
		responsiveWidth: false
	  },
	  $window = $(window),
	  $document = $(document),
	  sticked = [],
	  windowHeight = $window.height(),
	  scroller = function() {
		var scrollTop = $window.scrollTop(),
		  documentHeight = $document.height(),
		  dwh = documentHeight - windowHeight,
		  extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
  
		for (var i = 0; i < sticked.length; i++) {
		  var s = sticked[i],
			elementTop = s.stickyWrapper.offset().top,
			etse = elementTop - s.topSpacing - extra;
  
		  if (scrollTop <= etse) {
			if (s.currentTop !== null) {
			  s.stickyElement
				.css('position', '')
				.css('top', '');
			  s.stickyElement.trigger('sticky-end', [s]).parent().removeClass(s.className);
			  s.currentTop = null;
			}
		  }
		  else {
			var newTop = documentHeight - s.stickyElement.outerHeight()
			  - s.topSpacing - s.bottomSpacing - scrollTop - extra;
			if (newTop < 0) {
			  newTop = newTop + s.topSpacing;
			} else {
			  newTop = s.topSpacing;
			}
			if (s.currentTop != newTop) {
			  s.stickyElement
				.css('position', 'fixed')
				.css('top', newTop);
  
			  if (typeof s.getWidthFrom !== 'undefined') {
				s.stickyElement.css('width', $(s.getWidthFrom).width());
			  }
  
			  s.stickyElement.trigger('sticky-start', [s]).parent().addClass(s.className);
			  s.currentTop = newTop;
			}
		  }
		}
	  },
	  resizer = function() {
		windowHeight = $window.height();
  
		for (var i = 0; i < sticked.length; i++) {
		  var s = sticked[i];
		  if (typeof s.getWidthFrom !== 'undefined' && s.responsiveWidth === true) {
			s.stickyElement.css('width', $(s.getWidthFrom).width());
		  }
		}
	  },
	  methods = {
		init: function(options) {
		  var o = $.extend({}, defaults, options);
		  return this.each(function() {
			var stickyElement = $(this);
  
			var stickyId = stickyElement.attr('id');
			var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName 
			var wrapper = $('<div></div>')
			  .attr('id', stickyId + '-sticky-wrapper')
			  .addClass(o.wrapperClassName);
			stickyElement.wrapAll(wrapper);
  
			if (o.center) {
			  stickyElement.parent().css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
			}
  
			if (stickyElement.css("float") == "right") {
			  stickyElement.css({"float":"none"}).parent().css({"float":"right"});
			}
  
			var stickyWrapper = stickyElement.parent();
			stickyWrapper.css('height', stickyElement.outerHeight());
			sticked.push({
			  topSpacing: o.topSpacing,
			  bottomSpacing: o.bottomSpacing,
			  stickyElement: stickyElement,
			  currentTop: null,
			  stickyWrapper: stickyWrapper,
			  className: o.className,
			  getWidthFrom: o.getWidthFrom,
			  responsiveWidth: o.responsiveWidth
			});
		  });
		},
		update: scroller,
		unstick: function(options) {
		  return this.each(function() {
			var unstickyElement = $(this);
  
			var removeIdx = -1;
			for (var i = 0; i < sticked.length; i++)
			{
			  if (sticked[i].stickyElement.get(0) == unstickyElement.get(0))
			  {
				  removeIdx = i;
			  }
			}
			if(removeIdx != -1)
			{
			  sticked.splice(removeIdx,1);
			  unstickyElement.unwrap();
			  unstickyElement.removeAttr('style');
			}
		  });
		}
	  };
	  
  
	// should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
	if (window.addEventListener) {
	  window.addEventListener('scroll', scroller, false);
	  window.addEventListener('resize', resizer, false);
	} else if (window.attachEvent) {
	  window.attachEvent('onscroll', scroller);
	  window.attachEvent('onresize', resizer);
	}
  
	$.fn.sticky = function(method) {
	  if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	  } else if (typeof method === 'object' || !method ) {
		return methods.init.apply( this, arguments );
	  } else {
		$.error('Method ' + method + ' does not exist on jQuery.sticky');
	  }
	};
  
	$.fn.unstick = function(method) {
	  if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	  } else if (typeof method === 'object' || !method ) {
		return methods.unstick.apply( this, arguments );
	  } else {
		$.error('Method ' + method + ' does not exist on jQuery.sticky');
	  }
  
	};
	$(function() {
	  setTimeout(scroller, 0);
	});
  })(jQuery);
  
  
  /**
   * Single Page Nav Plugin
   * Copyright (c) 2013 Chris Wojcik <hello@chriswojcik.net>
   * Dual licensed under MIT and GPL.
   * @author Chris Wojcik
   * @version 1.1.0
   */
  
  // Utility
  if (typeof Object.create !== 'function') {
	  Object.create = function(obj) {
		  function F() {}
		  F.prototype = obj;
		  return new F();
	  };
  }
  
  (function($, window, document, undefined) {
	  "use strict";
	  
	  var SinglePageNav = {
		  
		  init: function(options, container) {
			  
			  this.options = $.extend({}, $.fn.singlePageNav.defaults, options);
			  
			  this.container = container;            
			  this.$container = $(container);
			  this.$links = this.$container.find('a');
  
			  if (this.options.filter !== '') {
				  this.$links = this.$links.filter(this.options.filter);
			  }
  
			  this.$window = $(window);
			  this.$htmlbody = $('html, body');
			  
			  this.$links.on('click.singlePageNav', $.proxy(this.handleClick, this));
  
			  this.didScroll = false;
			  this.checkPosition();
			  this.setTimer();
		  },
  
		  handleClick: function(e) {
			  var self  = this,
				  link  = e.currentTarget,
				  $elem = $(link.hash);  
  
			  e.preventDefault();             
  
			  if ($elem.length) { // Make sure the target elem exists
  
				  
				  // Prevent active link from cycling during the scroll
				  self.clearTimer();
  
				  // Before scrolling starts
				  if (typeof self.options.beforeStart === 'function') {
					  self.options.beforeStart();
				  }
  
				  self.setActiveLink(link.hash);
				  
				  self.scrollTo($elem, function() { 
				   
					  if (self.options.updateHash) {
						  document.location.hash = link.hash;
					  }
  
					  self.setTimer();
  
					  // After scrolling ends
					  if (typeof self.options.onComplete === 'function') {
						  self.options.onComplete();
					  }
				  });                            
			  }     
		  },
		  
		  scrollTo: function($elem, callback) {
			  var self = this;
			  var target = self.getCoords($elem).top;
			  var called = false;
  
			  self.$htmlbody.stop().animate(
				  {scrollTop: target}, 
				  { 
					  duration: self.options.speed, 
					  complete: function() {
						  if (typeof callback === 'function' && !called) {
							  callback();
						  }
						  called = true;
					  }
				  }
			  );
		  },
		  
		  setTimer: function() {
			  var self = this;
			  
			  self.$window.on('scroll.singlePageNav', function() {
				  self.didScroll = true;
			  });
			  
			  self.timer = setInterval(function() {
				  if (self.didScroll) {
					  self.didScroll = false;
					  self.checkPosition();
				  }
			  }, 250);
		  },        
		  
		  clearTimer: function() {
			  clearInterval(this.timer);
			  this.$window.off('scroll.singlePageNav');
			  this.didScroll = false;
		  },
		  
		  // Check the scroll position and set the active section
		  checkPosition: function() {
			  var scrollPos = this.$window.scrollTop();
			  var currentSection = this.getCurrentSection(scrollPos);
			  this.setActiveLink(currentSection);
		  },        
		  
		  getCoords: function($elem) {
			  return {
				  top: Math.round($elem.offset().top) - this.options.offset
			  };
		  },
		  
		  setActiveLink: function(href) {
			  var $activeLink = this.$container.find("a[href='" + href + "']");
			  var $parent = $activeLink.parent();
			  this.$container.find('.' + this.options.currentClass).removeClass(this.options.currentClass);
			  $parent.addClass(this.options.currentClass);
		  },        
		  
		  getCurrentSection: function(scrollPos) {
			  var i, hash, coords, section;
			  
			  for (i = 0; i < this.$links.length; i++) {
				  hash = this.$links[i].hash;
				  
				  if ($(hash).length) {
					  coords = this.getCoords($(hash));
					  
					  if (scrollPos >= coords.top - this.options.threshold) {
						  section = hash;
					  }
				  }
			  }
			  
			  // The current section or the first link
			  return section || this.$links[0].hash;
		  }
	  };
	  
	  $.fn.singlePageNav = function(options) {
		  return this.each(function() {
			  var singlePageNav = Object.create(SinglePageNav);
			  singlePageNav.init(options, this);
		  });
	  };
	  
	  $.fn.singlePageNav.defaults = {
		  offset: 0,
		  threshold: 120,
		  speed: 400,
		  currentClass: 'current',
		  updateHash: false,
		  filter: '',
		  onComplete: false,
		  beforeStart: false
	  };
	  
  })(jQuery, window, document);
  
  //Navscroll
  (function($) {
	"use strict";
	$(window).scroll(function() {
	  var scrollTop = $(window).scrollTop();
	  $(".section").each(function() {
		var elementTop = $(this).offset().top - $('#header').outerHeight();
		if(scrollTop >= elementTop) {
		  $(this).addClass('loaded');
		}
	  });
	});
  
	// One Page Navigation Setup
	$('.one-page-nav #navigation').singlePageNav({
	  offset: $('.one-page-nav').outerHeight(),
	  filter: ':not(.external)',
	  speed: 750,
	  currentClass: 'active',
  
	  beforeStart: function() {
	  },
	  onComplete: function() {
	  }
	});
  
		  
  //sticky menu
	  $(".navbar").sticky({topSpacing:0});
	  
	  
  // Padding Fix        
		  
	document.getElementById("menu-toggle").addEventListener("click", function(e){

			console.log(e);
			console.log(e.srcElement.classList);
			var theDropDown = document.querySelectorAll(".padd");
			var i;
			var found = false;

			e.srcElement.classList.forEach(function(item) { 
				if(!found && item === 'expand'){
					for (i = 0; i < theDropDown.length; i++) {
					theDropDown[i].classList.remove("expand");}
					found = true;
				}

				if(!found && item === 'padd'){
					for (i = 0; i < theDropDown.length; i++) {
					theDropDown[i].classList.add("expand");}
					found = true;
				}


				console.log(item);
				console.log(e.srcElement.classList);
			});

			if (!found){
				for (i = 0; i < theDropDown.length; i++) {
				theDropDown[i].classList.toggle("expand");}
			}

		});
	
  })(jQuery);

// Carroussel
$(function(){
	
	var liCount = $('.slider li').length;
	var ulWidth = (liCount * 100);
	var liWidth = (100/liCount);
	var leftIncrement = (ulWidth/liCount);


	$('.slider').height($('.slider li img').height());
  //$('.slider').height('300px');
	
	$('.slider img').on('load', function(){
    $('.loader').fadeOut();
		$('.slider').height($(this).height());
	})

	$(window).resize(function() {
		$('.slider').css('height', $('.slider li img').height());
	}); 
	
	$('.slider ul').css('width', ulWidth + '%');
	$('.slider li').css('width', liWidth + '%');

	$('.slider').append(function() {
		$(this).append('<div class="navigator"></div>');
		$(this).prepend('<span class="prev">Prev</span><span class="next">Next</span>');
		//$(this).append('<div class="autoPlay"><input id="chkBox" type="checkbox" class="chkbox" /><label for="chkBox">Auto Play?</label></div>');

		$(this).find('li').each(function(){
			$('.navigator').append('<span></span>');
		});
	});

  $('.slider').css('height', $('.slider li img').height());
  
	$('.navigator span:first-child').addClass('active');


	if(liCount > 2) {
		$('.slider ul').css('margin-left', -leftIncrement + '%');
		$('.slider ul li:last-child').prependTo('.slider ul');
	} else if(liCount == 1) {
		$('.slider span').css('display', 'none');
		$('.autoPlay').css('display', 'none');
	} else if(liCount == 2) {
		$('.slider .prev').css('display', 'none');
	}

	function moveLeft() {
		$('.slider ul').animate({
			left : -leftIncrement + '%'
		}, 500, function(){
			$('.slider ul li:first-child').appendTo('.slider ul');
			$('.slider ul').css('left', '');

			if($('.navigator span').hasClass('active')) {

				if($('.navigator span.active').is(':last-child')) {
					$('span.active').removeClass('active');
					$('.navigator span:first-child').addClass('active');
				} else {
					$('span.active').next().addClass('active');
					$('span.active').prev().removeClass('active');
				}
			}
		});
	}


	function moveRight() {
		$('.slider ul').animate({
			left : leftIncrement + '%'
		}, 500, function(){
			$('.slider ul li:last-child').prependTo('.slider ul');
			$('.slider ul').css('left', '');

			if($('.navigator span').hasClass('active')) {

				if($('.navigator span.active').is(':first-child')) {
					$('span.active').removeClass('active');
					$('.navigator span:last-child').addClass('active');
				} else {
					$('span.active').prev().addClass('active');
					$('span.active').next().removeClass('active');
				}
			}
		});
	}


	// $('.chkbox').click(function() {
	// 	if($('.chkbox').is(':checked')) {
	// 		$('.slider > span').hide();
	// 		$(this).next('label').text('Auto Playing')
	// 		invertalValue = setInterval(function() {
	// 			moveLeft();
	// 		}, 5000);
	// 	} else {
	// 		$(this).next('label').text('Auto Play?')
	// 		if(liCount == 2) {
	// 			$('.slider .next').show();
	// 		} else if(liCount > 2){
	// 			$('.slider > span').show();
	// 		}
	// 		clearInterval(invertalValue);
	// 	}
	// });
  
  if(liCount > 1) {
		invertalValue = setInterval(function() {
			moveLeft();
		}, 5000);
	}

	$('.prev').click(function(){
		moveRight();
	});

	$('.next').click(function(){
		moveLeft();
	});

});
