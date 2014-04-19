# Syringe.js

* Injects CSS at runtime
* Expects an object as input
* Properties can be Strings or camelCased
* Supports JSON
* Media Queries
* @keyframes
* Prefixes (optional)

## Usage Examples

## Basic
```js
var props = {
    body: {
        background: '#222',
        color: 'rgba(255,255,255,0.9)'
    },
    '.demo p': {
        'font-size': "6px",
        fontFamily: "sans-serif"
    }
};

Syringe.inject(props);
```

## Pseudo-elements, pseudo-classes
```js
var props = {
    'a': {
        color: "lime",
        transition: 'color 400ms'
    },
    'a:hover': {
        color: "red"
    },
    'a:after': {
        display: 'inline-block',
        content: '"[/]"',
        marginLeft: "5px"
    }
};

/* Strings support:
    Note that on the pseudo-element example,
    any expected 'String' should be double quoted
*/
```

## JSON Format
```js
var props = JSON.stringify({
    "body": {
        "color": "red"
    },
    "body:after": {
        "content": "'hello'"
    }
});
Syringe.inject(JSON.parse(props));
```

## Media Queries
```js
var props = {
    "@media screen" : {
        "*" : {
            fontFamily: "sans-serif"
        }
    },
    "@media all and (min-width: 500px)": {
        "body": {
            "background": "lime"
        }
    }
};
Syringe.inject(props);
```

## @keyframes
```js
var props = {
    '@keyframes anim-test': {
        from: {
            color: 'red',
            boxShadow: "0 0 20px red",
            transform: 'translate3d(0, -20px, 0)'
        },
        to: {
            color: 'lime',
            boxShadow: "0 0 20px lime",
            transform: 'translate3d(0, 20px, -100px)'
        }
    },
    'h1': {
        position: 'relative',
        borderRadius: '10px',
        background: '#222',
        padding: '10px 20px',
        animation: 'anim-test 2s ease 0 infinite alternate forwards'
    }
};

Syringe.inject(props);
```


## -prefixes?

Non-support by default, however you can define what properties and which prefixes to apply, just extend `Syringe.config.prefixedProperties`  before injection:

```js
Syringe.config.prefixedProperties = {
    'transform'     : ['webkit', 'moz', 'ms', 'o'],
    'perspective'   : ['webkit'],
    'animation'     : ['webkit'],
    'transform-style': ['webkit', 'ms'],
};
```

```js
var props = {
    'body': {
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        animation: 'animation-test 2s ease 0 0'
    },
    'h1': {
        transform: 'translate3d(0, 0, -1000px)'
    }
};

Syringe.inject(props);
```

That will produce:

```css
body{
    -webkit-perspective: 1000px;
    perspective: 1000px;
    -webkit-transform-style: preserve-3d;
    -ms-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-animation: animation-test 2s ease 0 0;
    animation: animation-test 2s ease 0 0;
}
h1{
    -webkit-transform: translate3d(0, 0, -1000px);
    -moz-transform: translate3d(0, 0, -1000px);
    -ms-transform: translate3d(0, 0, -1000px);
    -o-transform: translate3d(0, 0, -1000px);
    transform: translate3d(0, 0, -1000px);
}
 ```
