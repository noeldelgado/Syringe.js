
function getStyle(el, property) {
    return window.getComputedStyle(el, null).getPropertyValue(property);
}

describe("Output", function() {
    var props, result
    props = {
        body: {
            background: '#333',
            color: 'crimson',
        }
    },
    result = Syringe.inject(props)

    it("should be all the css on a single line, without spaces in between and each rule ending with semicolon", function() {
        expect(result).to.equal("body{background:#333;color:crimson;}")
    })
});

describe("CamelCase to Dash", function() {
    var props, result
    props = {
        'body': {
            fontSize: "20px",
            fontFamily: "sans-serif",
            backgroundColor: "rgba(0,0,0,1)"
        }
    },
    result = Syringe.inject(props)
    it("should handle camelcase to dash for propertie names", function() {
        expect(result).to.equal("body{font-size:20px;font-family:sans-serif;background-color:rgba(0,0,0,1);}")
    })
});

describe("Empty Objects", function() {
    var props, result
    props = {
        body : {},
        h1 : {color: '#09c'}
    }
    result = Syringe.inject(props)
    it("should be present anyway whitout messing level-deep closing braces", function() {
        expect(result).to.equal("body{}h1{color:#09c;}")
    })
});

describe("Prefixes", function() {
    Syringe.config.prefixedProperties = {
        'transform'     : ['webkit', 'moz', 'ms', 'o'],
        'perspective'   : ['webkit'],
        'animation'     : ['webkit'],
        'transform-style': ['webkit', 'ms'],
    };

    var props, result
    props = {
        'body': {
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            animation: 'animation-test 2s ease 0 0'
        },
        'h1': {
            transform: 'translate3d(0, 0, -1000px)'
        }
    }
    result = Syringe.inject(props)

    it("defined prefixes should be applyed", function() {
        var r = "body{-webkit-perspective:1000px;perspective:1000px;-webkit-transform-style:preserve-3d;-ms-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-animation:animation-test 2s ease 0 0;animation:animation-test 2s ease 0 0;}h1{-webkit-transform:translate3d(0, 0, -1000px);-moz-transform:translate3d(0, 0, -1000px);-ms-transform:translate3d(0, 0, -1000px);-o-transform:translate3d(0, 0, -1000px);transform:translate3d(0, 0, -1000px);}"
        expect(result).to.equal(r)
    })
});

describe("Keyframes (from/to)", function() {
    Syringe.config.prefixedProperties = {};

    var props, result
    props = {
        '@-webkit-keyframes atest': {
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
        }
    };
    result = Syringe.inject(props)
    it("keyframes from to example", function() {
        var r = "@-webkit-keyframes atest{from{color:red;box-shadow:0 0 20px red;transform:translate3d(0, -20px, 0);}to{color:lime;box-shadow:0 0 20px lime;transform:translate3d(0, 20px, -100px);}}"
        expect(result).to.equal(r)
    })
});

describe("Keyframes (percantages)", function() {
    Syringe.config.prefixedProperties = {};

    var props, result
    props = {
        '@-webkit-keyframes anim-test': {
            "0%": {
                color: 'red'
            },
            "50%": {
                color: 'lime'
            },
            "100%": {
                color: 'lime'
            }
        }
    }
    result = Syringe.inject(props)
    it("should also be supported defined in percentage format", function() {
        var r = "@-webkit-keyframes anim-test{0%{color:red;}50%{color:lime;}100%{color:lime;}}"
        expect(result).to.equal(r)
    })
})

describe("Media Queries", function() {
    var props, result
    props = {
        "@media screen" : {
            "*" : {
                fontFamily: "sans-serif"
            }
        },
        "@media all and (min-width:500px)": {
            "body": {
                "background": "white"
            }
        }
    }
    result = Syringe.inject(props)
    it("should supoprt media queries", function() {
        var r = "@media screen{*{font-family:sans-serif;}}@media all and (min-width:500px){body{background:white;}}"
        expect(result).to.equal(r)
    })
});

describe("Pseudo Class + Pseudo Classes", function() {
    Syringe.config.prefixedProperties = {};

    var props, result
    props = {
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
    }
    result = Syringe.inject(props)
    it("should support pseudo elements and pseudo classes", function() {
        r = 'a{color:lime;transition:color 400ms;}a:hover{color:red;}a:after{display:inline-block;content:"[/]";margin-left:5px;}';
        expect(result).to.equal(r)
    })
})

describe("JSON Format", function() {
    var props, result
    props = JSON.stringify({
        "body": {
            "color": "red"
        },
        "body:after": {
            "content": "'hello'"
        }
    })
    result = Syringe.inject(JSON.parse(props))
    it("should support JSON inout", function() {
        expect(result).to.equal("body{color:red;}body:after{content:'hello';}")
    })
})
