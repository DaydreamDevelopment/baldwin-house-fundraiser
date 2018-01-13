$(function($) {
    'use strict';

	// FadeOut Page Loader on document.ready
	$('.page-loader').fadeOut('slow');

	// FadeOut Page Loader on hide button
	$('.disable-loader').on('click', function(){
		$('.page-loader').fadeOut('slow');
	});

	// For counters
	$('.counter').counterUp({
		delay: 10,
		time: 1000
	});

	// For Text Rotator
	$('.animate-title').textillate({
		loop: true,
		type: 'word',
		in: {
			delay: 120
		},
		out: {
			delay: 120
		}
	});

	// For Background Slider
	$('.background-slider').backstretch([
		'images/hero.jpg'
	], {duration: 3000000, fade: 750});

	// For Swiper Slider
	var swiper = new Swiper('.swiper-container', {
		pagination: '.swiper-pagination',
		paginationClickable: true
	});
	console.log(swiper);

	// For light navigation bar while scrolled
	$(window).on('scroll resize', function() {
		if ($(window).scrollTop() >= 75) {
			$('body').addClass('fixed-header');
		}
		if ($(window).scrollTop() < 75) {
			return $('body').removeClass('fixed-header');
		}
	});

	// For Matching all .campaign-card heights
	$('.campaign-info').matchHeight();

	// For Matching all feature heights
	$('.same-ht').matchHeight();

	// For Single Item carousel
	$('.owl-carousel-single').owlCarousel({
		loop: false,
		navRewind: false,
		margin: 10,
		dots: true,
		nav: false,
		autoplay: false,
		navText: [],
		items: 1
	});

});
