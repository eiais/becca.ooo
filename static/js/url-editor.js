// url_in, url_out
//
// URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

// let me have ONE global ok
var url

let $ = id => document.getElementById(id)

// opts:
// edit: bool (is editable)
// onchange: fn (callback for edit)
// class: str (element class)
function make_field(value, opts={}) {
	var key
	if(opts.edit) {
		key = document.createElement('input')
		key.value = value
		if(opts.onchange) {
			key.addEventListener('change', opts.onchange, false)
		}
	} else {
		key = document.createElement('span')
		key.innerText = value
	}
	if(opts.class) {
		key.className = opts.class
	}
	return key
}

// accepted keys in opts:
// delim: delimiter b/w key and val
// delete: bool (if row is deletable)
// ondelete: fn
// order: bool (if row is reorderable)
// onreorder: fn
// class: the returned div's class name
// key:
//     edit: bool (if key is editable)
//     onchange: fn
// val:
//     (same as key)
function make_row(key, val, opts={}) {
	let new_row = document.createElement('div')
	new_row.className = opts.class || 'row'
	if(key) {
		if(opts.key === undefined) {
			opts.key = {}
		}
		if(opts.key) {
			opts.key.class = 'key'
		}
		new_row.append(make_field(key, opts.key))
		new_row.append(opts.delim || ': ')
	}

	if(val) {
		if(opts.val === undefined) {
			opts.val = {}
		}
		if(opts.val) {
			opts.val.class = 'val'
		}
		new_row.append(make_field(val, opts.val))
	}
	// TODO deletion code
	// TODO reordering code
	return new_row
}

// opts: see make_row, and
// target: Element or Node to append to
function add_row(key, val, opts={}) {
	(opts.target || url_out).append(make_row(key, val, opts))
}

/*
 * for(param of url.searchParams) {
 * 	// param is ['key', 'value']
 * 	// with value decoded
 * }
 */

// strip trailing :
let display_protocol = prot => prot.substring(0, prot.indexOf(':'))
let set_protocol = newprot => newprot + ':'
// strip leading /
let display_path = path => path.substring(1)
let set_path = newpath => '/' + newpath

// adds a new row with a static, i.e. uneditable, key field IFF val is defined
// and non-empty
//
// opts: an add_row opts dict with the following keys
// val_fn is applied to val if val is defined and non-empty
function maybe_static_row(key, val, opts={}) {
	if(val !== undefined && val !== "") {
		if(opts.val_fn) {
			val = opts.val_fn(val)
		}
		if(opts.key === undefined) {
			opts.key = {}
		}
		opts.key.edit = false
		if(opts.val === undefined) {
			opts.val = {}
		}
		opts.val.edit = true
		add_row(key, val, opts)
	}
}

// see maybe_static_row, but with mutable keys and values
function maybe_mutable_row(key, val, opts={}) {
	if(val !== undefined && val !== "") {
		if(opts.val_fn) {
			val = opts.val_fn(val)
		}
		if(opts.key === undefined) {
			opts.key = {}
		}
		opts.key.edit = true
		if(opts.val === undefined) {
			opts.val = {}
		}
		opts.val.edit = true
		add_row(key, val, opts)
	}
}

function make_section(title) {
	let ret = document.createElement('div')
	ret.className = 'section section-' + title.replace(/ /g, '-')
	if(title) {
		let header = document.createElement('h2')
		header.innerHTML = title
		ret.append(header)
	}
	return ret
}

function parse_params(searchParams) {
	let container = make_section('parameters')
	for(param of searchParams) {
		add_row(param[0], param[1], {
			target: container,
			key: { edit: true },
			val: { edit: true },
		})
	}
	url_out.append(container)
}

function ul(items, func) {
	let add_item = it => {
		let li = document.createElement('li')
		li.append(it)
		list.append(li)
	}
	for(item of items) {
		add_item(func(item))
	}
	return list
}

function parse_path(pathname) {
	let container = make_section('path')
	let dirs = display_path(pathname).split('/')
	let list = document.createElement('ul')
	for(dir of dirs) {
		let li = document.createElement('li')
		li.append(make_row(undefined, dir, {
			val: { edit: true }
		}))
		list.append(li)
	}
	container.append(list)
	url_out.append(container)
}

function parse(url) {
	url = new URL(url)
	url_out.innerHTML = ''
	maybe_mutable_row('protocol', url.protocol, { val_fn: display_protocol })
	// hostname: composed of host:port
	// origin: scheme, domain, and port
	maybe_mutable_row('user', url.username)
	maybe_mutable_row('password', url.password)
	maybe_mutable_row('host', url.hostname)
	maybe_mutable_row('port', url.port)
	parse_path(url.pathname)
	maybe_mutable_row('#', url.hash)
	parse_params(url.searchParams)
}

let parse_event = e => parse(e.target.value)

function init() {
	parse(url_in.value)
	url_in.addEventListener('change', parse_event, false)
	url_in.addEventListener('input', parse_event, false)
}

document.addEventListener('DOMContentLoaded', init, false)
