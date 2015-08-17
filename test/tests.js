QUnit.test( 'defined', function ( assert ) {

	assert.equal( typeof $.nito, 'function' );

} );

var Todo = $.nito( {

	base: [
		'<div class="todo">',
			'<h1 class="title">Todo</h1>',
			'<div class="items"></div>',
		'</div>'
	],

	setup: function () {

	},

	update: function () {

	}

} );

var Item = $.nito( {

	base: [
		'<div class="item">',
			'<h1 class="title">Hello World!</h1>',
			'<div class="items"></div>',
		'</div>'
	],

	setup: function () {

	},

	update: function () {

	}

} );

var stats = {
	create: 0,
	remove: 0,
	moved: 0
};

Item._create = Item.create;
Item.create = function () {

	++stats.create;
	return Item._create.apply( Item, arguments );

};

Item._remove = Item.remove;
Item.remove = function () {

	++stats.remove;
	return Item._remove.apply( Item, arguments );

};

$( '#qunit-fixture' ).on( 'moved', '.item', function () {

	++stats.moved;

} );

QUnit.test( 'loop', function ( assert ) {

	var todo = Todo.appendTo( '#qunit-fixture' );
	var $items = todo.find( '.items' );
	$items.loop( [
		{ id: 1, label: 'A' },
		{ id: 2, label: 'B' },
		{ id: 3, label: 'C' }
	], Item );

	assert.equal( $items.children().length, 3 );
	assert.equal( stats.create, 3 );
	assert.equal( stats.remove, 0 );
	assert.equal( stats.moved, 3 );

	$items.loop( [
		{ id: 1, label: 'A' },
		{ id: 2, label: 'B' },
		{ id: 3, label: 'C' }
	], Item );

	assert.equal( stats.create, 3 );
	assert.equal( stats.remove, 0 );
	assert.equal( stats.moved, 3 );

	$items.loop( [
		{ id: 2, label: 'B' },
		{ id: 1, label: 'A' },
		{ id: 3, label: 'C' }
	], Item );

	assert.equal( stats.create, 3 );
	assert.equal( stats.remove, 0 );
	assert.equal( stats.moved, 4 );

	$items.loop( [
		{ id: 2, label: 'B' },
		{ id: 4, label: 'D' },
		{ id: 3, label: 'C' }
	], Item );

	assert.equal( stats.create, 4 );
	assert.equal( stats.remove, 1 );
	assert.equal( stats.moved, 5 );

} );

QUnit.test( 'classes', function ( assert ) {

	var $el = $( '<div></div>' );

	$el.classes( {
		foo: true,
		bar: true,
		baz: false
	} );

	assert.equal( $el[ 0 ].className, 'foo bar' );

	$el.classes( {
		foo: false,
		baz: true
	} );

	assert.equal( $el[ 0 ].className, 'bar baz' );

} );

QUnit.test( 'style', function ( assert ) {

	var $el = $( '<div></div>' );

	$el.style( {
		color: 'red',
		fontSize: '2em'
	} );

	assert.equal( $el[ 0 ].style.color, 'red' );
	assert.equal( $el[ 0 ].style.fontSize, '2em' );

	$el.style( {
		color: 'blue'
	} );

	assert.equal( $el[ 0 ].style.color, 'blue' );
	assert.equal( $el[ 0 ].style.fontSize, '2em' );

} );

QUnit.test( 'attrs', function ( assert ) {

	var $el = $( '<div></div>' );

	$el.attrs( {
		foo: 'bar',
		style: 'color: red'
	} );

	assert.equal( $el[ 0 ].style.color, 'red' );
	assert.equal( $el.attr( 'foo' ), 'bar' );

	$el.attrs( {
		style: null
	} );

	assert.notOk( $el.is( '[style]' ) );
	assert.equal( $el.attr( 'foo' ), 'bar' );

} );

QUnit.test( 'weld', function ( assert ) {

	var $el = $( '<div><i class="foo"></i><b class="bar"></b></div>' );

	$el.weld( {
		foo: 'hello',
		bar: 'world'
	} );

	assert.equal( $el.find( 'i' ).html(), 'hello' );
	assert.equal( $el.find( 'b' ).html(), 'world' );

	$el.weld( 'hi' );

	assert.equal( $el.html(), 'hi' );

} );

QUnit.test( 'weld edge', function ( assert ) {

	var $el = $( '<div></div>' );

	assert.equal( $el.weld( undefined ).html(), '' );
	assert.equal( $el.weld( null ).html(), '' );
	assert.equal( $el.weld( '' ).html(), '' );
	assert.equal( $el.weld( false ).html(), 'false' );
	assert.equal( $el.weld( true ).html(), 'true' );
	assert.equal( $el.weld( 0 ).html(), '0' );
	assert.equal( $el.weld( 1 ).html(), '1' );

} );

QUnit.test( 'fill text', function ( assert ) {

	var $form = $( '<form><input type="text" name="foo"></form>' );
	var $control = $form.find( 'input' );

	assert.equal( $control.val(), '' );
	assert.equal( $control.prop( 'value' ), '' );

	$form.fill( { foo: 'bar' } );

	assert.equal( $control.attr( 'value' ), 'bar' );
	assert.equal( $control.val(), 'bar' );

	$control.prop( 'value', 'baz' );

	assert.equal( $control.attr( 'value' ), 'bar' );
	assert.equal( $control.val(), 'baz' );

	$form[ 0 ].reset();

	assert.equal( $control.attr( 'value' ), 'bar' );
	assert.equal( $control.val(), 'bar' );

} );

QUnit.test( 'fill textarea', function ( assert ) {

	var $form = $( '<form><textarea name="foo"></textarea></form>' );
	var $control = $form.find( 'textarea' );

	assert.equal( $control.val(), '' );
	assert.equal( $control.prop( 'value' ), '' );

	$form.fill( { foo: 'bar' } );

	assert.equal( $control.html(), 'bar' );
	assert.equal( $control.val(), 'bar' );

	$control.prop( 'value', 'baz' );

	assert.equal( $control.html(), 'bar' );
	assert.equal( $control.val(), 'baz' );

	$form[ 0 ].reset();

	assert.equal( $control.html(), 'bar' );
	assert.equal( $control.val(), 'bar' );

} );

QUnit.test( 'fill select', function ( assert ) {

	var $form = $( '<form><select name="foo"><option value="bar">bar</option><option value="baz">baz</option></form>' );
	var $control = $form.find( 'select' );
	var $bar = $form.find( 'option' ).eq( 0 );
	var $baz = $form.find( 'option' ).eq( 1 );

	assert.equal( $control.val(), 'bar' );
	assert.equal( $control.prop( 'value' ), 'bar' );

	$form.fill( { foo: 'baz' } );

	assert.notOk( $control.is( '[value]' ) );
	assert.ok( $baz.is( '[selected]' ) );
	assert.equal( $control.val(), 'baz' );

	$control.val( 'bar' );

	assert.ok( $baz.is( '[selected]' ) );
	assert.equal( $control.val(), 'bar' );

	$form[ 0 ].reset();

	assert.ok( $baz.is( '[selected]' ) );
	assert.equal( $control.val(), 'baz' );

} );

QUnit.test( 'fill select multiple', function ( assert ) {

	var $form = $( '<form><select name="foo[]" multiple><option value="bar">bar</option><option value="baz">baz</option></form>' );
	var $bar = $form.find( 'option' ).eq( 0 );
	var $baz = $form.find( 'option' ).eq( 1 );

	$form.fill( {
		foo: []
	} );

	assert.notOk( $bar.is( '[selected]' ) );
	assert.notOk( $baz.is( '[selected]' ) );

	$form.fill( {
		foo: [ 'bar' ]
	} );

	assert.ok( $bar.is( '[selected]' ) );
	assert.notOk( $baz.is( '[selected]' ) );

	$form.fill( {
		foo: [ 'baz' ]
	} );

	assert.notOk( $bar.is( '[selected]' ) );
	assert.ok( $baz.is( '[selected]' ) );

	$form.fill( {
		foo: [ 'bar', 'baz' ]
	} );

	assert.ok( $bar.is( '[selected]' ) );
	assert.ok( $baz.is( '[selected]' ) );

} );

QUnit.test( 'fill checkbox', function ( assert ) {

	var $form = $( '<form><input type="checkbox" name="foo"></form>' );
	var $control = $form.find( 'input' );

	$form.fill( {
		foo: true
	} );

	assert.ok( $control.is( '[checked]' ) );
	assert.ok( $control.prop( 'checked' ) );

	$form.fill( {
		foo: false
	} );

	assert.notOk( $control.is( '[checked]' ) );
	assert.notOk( $control.prop( 'checked' ) );

	$control.prop( 'checked', true );

	assert.notOk( $control.is( '[checked]' ) );
	assert.ok( $control.prop( 'checked' ) );

} );

QUnit.test( 'fill checkbox multiple', function ( assert ) {

	var $form = $( '<form><input type="checkbox" name="foo[]" value="bar"><input type="checkbox" name="foo[]" value="baz"></form>' );
	var $bar = $form.find( 'input' ).eq( 0 );
	var $baz = $form.find( 'input' ).eq( 1 );

	$form.fill( {
		foo: []
	} );

	assert.notOk( $bar.is( '[checked]' ) );
	assert.notOk( $baz.is( '[checked]' ) );

	$form.fill( {
		foo: [ 'bar' ]
	} );

	assert.ok( $bar.is( '[checked]' ) );
	assert.notOk( $baz.is( '[checked]' ) );

	$form.fill( {
		foo: [ 'baz' ]
	} );

	assert.notOk( $bar.is( '[checked]' ) );
	assert.ok( $baz.is( '[checked]' ) );

	$form.fill( {
		foo: [ 'bar', 'baz' ]
	} );

	assert.ok( $bar.is( '[checked]' ) );
	assert.ok( $baz.is( '[checked]' ) );

} );

QUnit.test( 'fill radio', function ( assert ) {

	var $form = $( '<form><input type="radio" name="foo" value="bar"><input type="radio" name="foo" value="baz"></form>' );
	var $bar = $form.find( 'input' ).eq( 0 );
	var $baz = $form.find( 'input' ).eq( 1 );

	assert.equal( $bar.attr( 'value' ), 'bar' );
	assert.equal( $baz.attr( 'value' ), 'baz' );

	$form.fill( { foo: 'baz' } );

	assert.notOk( $bar.is( '[checked]' ) );
	assert.ok( $baz.is( '[checked]' ) );

	$form.fill( { foo: 'bar' } );

	assert.ok( $bar.is( '[checked]' ) );
	assert.notOk( $baz.is( '[checked]' ) );

} );
