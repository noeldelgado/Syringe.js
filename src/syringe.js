(function() {

    "use strict";

    window.Syringe = {
        config : {
            prefixedProperties : null
        },

        style       : null,
        sheet       : null,
        rules       : null,
        buffer      : {},
        _level      : 0,

        inject : function inject(options) {
            // Reset variables for iteration
            this._level = 0;
            this.buffer.selectors  = [];
            this.buffer.blocks     = [];

            // Handle rules to be injected
            this._iterate(options);

            // Inject rules
            return this._insertRules();
        },

        removeAll : function removeAll() {
            while (this.rules.length) {
                this.sheet.deleteRule(this.rules.length - 1);
            }
        },

        remove : function remove(selector) {
            var rules, rulesLength, selectorsLength, j;

            if (!selector) {
                return false;
            }

            rules           = this.rules;
            rulesLength     = rules.length;
            selectorsLength = selector.length;

            if (typeof selector === "string") {
                while (rulesLength--) {
                    this._deleteRule(rules[rulesLength], rulesLength, selector);
                }
            }

            if (selector instanceof Array) {
                while (rulesLength--) {
                    for (j = 0; j < selectorsLength; j++) {
                        this._deleteRule(rules[rulesLength], rulesLength, selector[j]);
                    }
                }
            }
        },

        _deleteRule : function _deleteRule(rule, index, selector) {
            var isKeyframe, isAtRule, isMedia, selectorNoSpaces;

            isKeyframe  = this._re.keyframe.exec(selector);
            isAtRule    = this._re.atRule.exec(selector);
            isMedia     = this._re.media.exec(selector);

            if (rule.type === 1 && (rule.selectorText === selector)) { // CSSRule.STYLE_RULE
                this.sheet.deleteRule(index);
            } else if (rule.type === 3 && isAtRule) { // CSSRule.IMPORT_RULE
                if (rule.href === isAtRule[1]) {
                    this.sheet.deleteRule(index);
                }
            } else if (rule.type === 4 && isMedia) { // CSSRule.MEDIA_RULE
                selectorNoSpaces = selector.replace(/\s/g, '');
                if (rule.cssText.replace(/\s/g, '').substring(0, selectorNoSpaces.length) === selectorNoSpaces) {
                    this.sheet.deleteRule(index);
                }
            } else if (rule.type === 7 && isKeyframe) { // CSSRule.KEYFRAMES_RULE
                if (rule.name === isKeyframe[2]) {
                    this.sheet.deleteRule(index);
                }
            }
        },

        _iterate : function iterate(obj) {
            var selector, lastSelector, property;

            for (selector in obj) {
                if (obj.hasOwnProperty(selector)) {
                    lastSelector = this.buffer.selectors.length - 1;

                    if (typeof obj[selector] === "object") {
                        // Handle rule blocks
                        this._level++;

                        if (this._level === 1) {
                            this.buffer.selectors.push(selector);
                            lastSelector = this.buffer.selectors.length - 1;
                        } else {
                            this._addToBlock(lastSelector, selector + "{");
                        }

                        if (this._isEmptyObject(obj[selector])) {
                            this._level--;
                            this.buffer.blocks[lastSelector] = "";
                        } else {
                            this._iterate(obj[selector]);

                            if (this._level > 1) {
                                this.buffer.blocks[lastSelector] += "}";
                            }

                            this._level--;
                        }
                    } else {
                        // handle declarations
                        property = selector;

                        if (this._re.camelCase.test(selector) === true) {
                            property = this._toDash(selector);
                        }

                        if (this.config.prefixedProperties) {
                            if (lastSelector < 0) { // empty ruleset, special case for @import rule
                                lastSelector = 0;
                                this.buffer.selectors.push("");
                            }
                            this._addToBlock(lastSelector, this._getPrefixedDeclarations(property, obj[selector]));
                        } else {
                            this._addToBlock(lastSelector, this._getDeclaration(property, obj[selector]));
                        }
                    }
                }
            }
        },

        _insertRules : function _insertRules() {
            var i, blocksLength, rulesLength, result, selector, block,isKeyframe, keyframeName;

            blocksLength    = this.buffer.blocks.length;
            rulesLength     = this.rules.length;
            result          = "";

            for (i = 0; i < blocksLength; i++) {
                selector    = this.buffer.selectors[i];
                block       = this.buffer.blocks[i];
                isKeyframe  = this._re.keyframe.exec(selector);
                keyframeName= "";

                // @import at-rule
                if (selector === "") {
                    result += block;

                    if (this.style.sheet.insertRule) {
                        this.sheet.insertRule(block, rulesLength);
                    } else if (this.sheet.addImport) { // IE8-
                        this.sheet.addImport(this._re.atRule.exec(block)[1]);
                    }

                    continue;
                }

                // @keyframes
                if (isKeyframe) {
                    keyframeName = " " + isKeyframe[2];
                    if (CSSRule.WEBKIT_KEYFRAMES_RULE) {
                        selector = "@-webkit-keyframes" + keyframeName;
                    } else if (CSSRule.MOZ_KEYFRAMES_RULE) {
                        selector = "@-moz-keyframes" + keyframeName;
                    } else if (CSSRule.KEYFRAMES_RULE) {
                        selector = "@keyframes" + keyframeName;
                    }
                }

                if (this.sheet.insertRule) {
                    this.sheet.insertRule(selector + "{" + block + "}", rulesLength);
                } else {
                    this.sheet.addRule(selector, block, 0);
                }

                result += selector + "{" + block + "}";
                selector = block = isKeyframe = keyframeName = null;
            }

            return result;
        },

        _addToBlock : function _addToBlock(index, value) {
            if (this.buffer.blocks[index] === undefined) {
                this.buffer.blocks[index] = "";
            }

            this.buffer.blocks[index] += value;
        },

        _getDeclaration : function _getDeclaration(property, value) {
            var declaration;

            if (property === "@import") {
                declaration = (property + " " + value);
            } else {
                declaration = (property + ":" + value);
            }

            return declaration + ";";
        },

        _getPrefixedDeclarations : function _getPrefixedDeclarations(property, value) {
            var result, index, prefixedProps, prefixedPropsLength;

            if (this.config.prefixedProperties[property]) {
                result                  = "";
                prefixedProps           = this._getPrefixedSelector(property);
                prefixedPropsLength     = prefixedProps.length;

                for (index = 0; index < prefixedPropsLength; index++) {
                    result += this._getDeclaration(prefixedProps[index], value);
                }

                return result;
            };

            return this._getDeclaration(property, value);
        },

        _getPrefixedSelector : function _getPrefixedSelector(selector) {
            var index, result, prefixes, prefixesLength;

            result          = [];
            prefixes        = this.config.prefixedProperties[selector];
            prefixesLength  = prefixes.length;

            for (index = 0; index < prefixesLength; index++) {
                result.push('-' + prefixes[index] + '-' + selector);
            }

            result.push(selector);

            return result;
        },

        _re : {
            camelCase   : new RegExp("[A-Z]\\w+"),
            keyframe    : new RegExp("@(.*)?keyframes (.*)"),
            atRule      : new RegExp("@import url\\((.*)\\)"),
            media       : new RegExp("@media")
        },

        _toDash : function _toDash(string) {
            return string.replace(/([A-Z])/g, function(letter) {
                return '-' + letter.toLowerCase();
            });
        },

        _isEmptyObject : function _isEmptyObject(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        },

        _createStyleSheet : function _createStyleSheet() {
            if (this.style === null) {
                this.style = document.createElement('style');
                this.style.setAttribute("type", "text/css");
                this.style.appendChild(document.createTextNode(""));
                document.getElementsByTagName("head")[0].appendChild(this.style);
                this.sheet = this.style.sheet || this.style.styleSheet;
                this.rules = this.sheet.cssRules || this.sheet.rules;
            }
        },
    };

    Syringe._createStyleSheet();

})();
