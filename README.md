# Nito :skull:

Minimal component library for jQuery, inspired by React and Riot.
Just an experiment. [Or maybe not.](https://rawgit.com/morris/nito/master/examples/nito-vs-react/)

```js
var Todo = $.nito(

	base: [
		'<div>',
			'<h1>Todo</h1>',
			'<ul class="items"></ul>',
		'</div>'
	],

	setup: function () {
		this.items = [
			{ key: 1, title: 'Get Nito', completed: false },
			{ key: 2, title: 'Create something', completed: false }
		];
	},

	update: function () {
		this.find( '.items' ).loop( this.items, TodoItem, this );
	}

} );

var TodoItem = $.nito( {

	base: [
		'<li>',
			'<strong class="title"></strong>',
		'</li>'
	],

	setup: function ( item, todo ) {
		this.item = item;
		this.todo = todo;
		this.on( 'click', this.toggle );
	},

	update: function () {
		this.$el.weld( this.item );
		this.$el.classes( { completed: this.item.completed } );
	},

	toggle: function () {
		this.item.completed = !this.item.completed;
		this.todo.update(); // always update explicitly
	}

} );
```

- For people who know and like jQuery or Zepto
- Simple: 1 class, 9 functions, <500 lines
- [No templating](http://blog.nodejitsu.com/micro-templates-are-dead/),
[no virtual DOM](http://blog.500tech.com/is-reactjs-fast/),
[no JSX](https://www.pandastrike.com/posts/20150311-react-bad-idea)
- Just $ and standard JavaScript
- Favors explicit code over implicit magic
- Never gets in the way
- Pairs well with [Bootstrap](http://getbootstrap.com)


## Examples

- [Todo](https://rawgit.com/morris/nito/master/examples/todo/) with TodoMVC-like features
- [Nito vs. React](https://rawgit.com/morris/nito/master/examples/nito-vs-react/) with benchmark


## Getting started

Include $ first, then Nito:

```html
<script src="jquery-1.11.3.min.js"></script>
<script src="nito.min.js"></script>
```


## Defining components

#### `$.nito( settings )`

- Creates a component factory
- `settings` is an object that defines the prototype of the components
	- `base` is the base HTML for the components
		- Can be a string or an array of strings
		- Arrays will be joined with `\n`
		- Optional, if you only use `Comp.setup` (see below)
	- `setup` is a method called on creation of a component
		- Define event handlers here
		- Optional, defaults to noop
	- `update` is a method to update the component
		- Has to be called explicitly (except for components rendered with `loop`/`nest`)
		- Optional, defaults to noop
	- `identify` is a function that generates keys for `loop`
		- Gets an item argument from `loop`
		- Must return a distinct, truthy string or number
		- See `loop`
		- Optional
	- Add more methods and properties as needed
- Returns the created factory
- (Factories are regular JavaScript classes inheriting from `$.Comp`)


## Creating components

#### `Comp.create( data, extra )`

- Create a component using the component base HTML
- `data` and `extra` will be passed to `update` and `setup`. Optional
	- `comp.setup( data, extra )` and an initial `comp.update( data, extra )` are called
	- Use `data` for view data
	- Use `extra` to pass references, e.g. the app/store/controller or a parent component
- Returns the created component

#### `Comp.setup( base, data, extra )`

- Create a component using given base HTML or selector
- Useful for components with varying or server-rendered HTML
- See above

#### `Comp.appendTo( selector, data, extra )`

- Create a component using Comp.create and then append it to `$( selector )`
- See above


## Component members and methods

#### `comp.$el` and `comp.el`

-	jQuery object and DOM element pointing to the root element of the component, if any

#### `comp.find( selector )`

- Shortcut to `comp.$el.find`

#### `comp.on( [selector,] event, handler )`

- Shortcut to `comp.$el.on`
- `handler` is bound to `comp`, *not* to the element
- Returns `comp`


## Nesting components

Super-efficiently nest components in any DOM element using `loop` or `nest`.
Use these methods in `update`, *not* in `setup`.

#### `$el.loop( items, factory, extra )`

- For each item, create a component using the factory and append to `$el`
- `items` is an array of `data` passed to the components
- `factory` should be a component factory
- `extra` is passed to each component. Optional
- Reconciliation: Existing components are identified with items and reused/updated with given data
	- By default, components are reconciled by item/component index
	- If the `factory.identify` function is defined, components are reconciled by keys
- `$el` must only have children generated by `loop`; don't mix with more children
- Returns array of child components

```js
$( '<ul></ul>' ).loop( [
	{ title: 'Write code', done: true },
	{ title: 'Write readme', done: false }
], TodoItem );
```

#### `$el.nest( item, factory, extra )`

- Same as loop, but for one component
- Pass falsy item to not nest anything
- If item is given, needs a valid key
- Returns child component, if any


## Updating components

The following methods are helpful and/or speed optimized
for usage in component `update` methods.

#### `$els.classes( map )`

- Set classes on `$els` softly
- Classes not present in map are not touched
- Function values are computed using each element as `this`
- Returns `$els`

```js
$( '.form-group' ).classes( {
	'has-success': true,
	'has-error': false
} );
```

#### `$els.weld( data, selectors )`

- Set `data` on `$els`
- If `data` is not an object, set `data` as `$els`'s inner HTML softly
	- Function values are computed using each element as `this`
- If `data` is a map of `name: html` pairs:
	- Will find `.name` and set the given HTML softly
	- `selectors` is an optional map of `name: selector` pairs
	- If `selectors[ name ]` is given, use that instead of `.name`
- Returns `$els`

```js
$( '<h1></h1>' ).weld( 'hello' );
$( '<div><h1 class="title"></h1><p class="post"></p></div>' )
	.weld( { title: 'hello', contents: 'world' }, { contents: '.post' } );
```

#### `$els.values()`

- Serialize named form controls in `$els` into an object
- Supports all controls and nested names like `object[key]`, `array[index]`, `multiple[]`
- Returns an object containing the values

#### `$els.values( data, defaults )`

- Fill named form controls in `$els` with given data
- Supports all controls and nested data
- If `defaults` is falsy, sets the value properties (user input)
	- User input will be overwritten
	- Form defaults are not modified
- If `defaults` is truthy, sets values on the DOM (form defaults)
	- Modifies DOM attributes like `value` and `selected`, *not* the properties
	- Inputs modified by the user will still reflect the user input
- Use `reset` to discard user input
- Returns `$els`

#### `$els.reset()`

- Resets each form or individual form control in `$els` (without children)
- Returns `$els`
