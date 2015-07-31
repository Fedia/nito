# Nito :skull:

Lightweight components for your favorite $. Just an experiment. Or maybe not.

- For people who like $
- No templating, just $
- No virtual DOM, only $
- No JSX... $


## Examples

- [Todo](https://rawgit.com/morris/nito/master/examples/todo.html)


## Getting started

Include $ first, then Nito:

```
<script src="jquery-1.11.3.min.js"></script>
<script src="nito.min.js"></script>
```


## Defining components

#### `$.nito( settings )`

- Creates a component class
- `settings` is an object that defines the prototype of the component class
	- `base` is the base HTML for the component class
		- Can be a string or an array of strings
		- Arrays will be joined with `\n`
		- Optional, if you only use `Comp.setup` (see below)
	- `setup` will be called on creation of a component
		- Define event handlers here
		- Optional, defaults to noop
	- `update` should update the component
		- Has to be called explicitly (except for `loop`/`nest` components)
		- Optional, defaults to noop
	- `idProp` is the loop id property
		- See `$el.loop` below
		- Optional, defaults to `id`
	- Add more methods and properties as needed

```js
var Comp = $.nito( {

	base: [
		'<div>',
			'<h1 class="title"></h1>',
		'</div>'
	],

	setup: function ( data ) {

		this.title = data.title;

		this.$el; // the component root element

		// shortcut to this.$el.on
		this.on( 'click', '.title', function () {

			this.custom(); // bound to component

		} );

	},

	update: function () {

		// shortcut to this.$el.find
		this.find( '.title' ).weld( this.title );

	},

	custom: function () {

		this.title = 'nito';
		this.update(); // always update explicitly

	}

} );
```


## Creating components

#### `Comp.create( data, extra )`

- Create a component using the component base HTML
- `data` and `extra` will be passed to `update` and `setup`. Optional
	- `comp.setup( data, extra )` and an initial `comp.update( data, extra )` are called
	- Use `data` for view data
	- Use `extra` to pass references, e.g. the main app/store/controller
- Returns the created component

#### `Comp.setup( base, data, extra )`

- Create a component using given base HTML or selector
- Useful for components with varying or server-rendered HTML
- See above

#### `Comp.appendTo( selector, data, extra )`

- Create a component using Comp.create and then append it to `$( selector )`
- See above


## Nesting components

Use these methods in `update`, NOT in `setup`.

#### `$el.loop( items, factory, extra )`

- For each item, create a component using the factory and append to `$el`
- `items` is an array of `data` passed to the components
- Items must have distinct, truthy `id` properties, otherwise loop will throw
- `factory` should be a component class, but may be anything that has a `create` method
- Set `idProp` on factory if items have a different id property
- Existing components with same ids are reused and updated with given data
- `extra` is passed to each component. Optional
- $el must only have children generated by this loop; don't mix with more children
- Minimal DOM impact
- Returns array of child components

```js
$el.loop( [
	{ id: 1, title: 'Write code', done: true },
	{ id: 2, title: 'Write readme', done: false }
], TodoItem );
```

#### `$el.nest( item, factory, extra )`

- Same as loop, but for one component
- Pass falsy item to not nest anything
- If item is given, needs a valid id
- Returns child component, if any


## Soft $ methods

These methods are soft, non-destructive, keep DOM mutations low.

#### `$set.classes( map )`

- Add classes on $set softly
- Classes not present in map are not touched
- Returns $set

```js
$set.classes( { classA: truthy, classB: falsy } );
```

#### `$set.weld( data, selectors )`

- Set data on $set
- If data is not an object, set data as $set's innerHTML softly
- If data is a map of ( name: html ) pairs:
	- Will find #name or .name and set the given HTML softly
	- selectors is an optional map of ( name: selector ) pairs
	- If selectors[ name ] is given, use that instead of #name, .name
- Returns $set

```js
$set.weld( 'hello' );
$set.weld( { title: 'nito', contents: 'hello' }, { contents: '.post' } );
```

#### `$set.fill( data )`

- Fill form controls contained in `$set` with given data
- Form controls must have proper `name` attributes
- Supports all controls, nested data, `name="a[b][c]"`, etc.
- Returns $set


## Router

#### `$.router( handler )`

- Attach a handler to the `hashchange` event
- The hash is split by `/`, empty parts are removed, and the result is passed to the handler
- The handler is also immediately called once
- Returns the (wrapped) handler

```js
$.router( function ( action, id ) {

	// handle <url>#<action>/<id>

} );
```

#### `$.routerOff( handler )`

- Remove a handler previously returned by `$.router`
