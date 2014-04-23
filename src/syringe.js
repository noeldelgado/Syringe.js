(function() {

    "use strict";

    window.Syringe = {
        config : {
            prefixedProperties : null
        },

        _style : null,
        _buffer : {
            selectors : [],
            blocks : [],
        },

        _reCamelCase : new RegExp("[A-Z]"),
        _reKeyframe : new RegExp("@keyframes(.+)"),
        _isEmptyObject : function _isEmptyObject(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        },

        inject : function inject(options) {
            var self, level, iterate;

            self    = this;
            level   = 0;

            self._buffer.selectors  = [];
            self._buffer.blocks     = [];

            if (self._style === null) {
                self._style = document.createElement('style');
                self._style.setAttribute("type", "text/css");
                self._style.appendChild(document.createTextNode(""));
                document.getElementsByTagName("head")[0].appendChild(self._style);
            }

            iterate = function iterate(obj) {
                var selector, lastSelector, property;

                for (selector in obj) {
                    if (obj.hasOwnProperty(selector)) {
                        lastSelector = self._buffer.selectors.length - 1;
                        if (typeof obj[selector] === "object") {
                            level++;
                            if (level === 1) {
                                self._buffer.selectors.push(selector);
                                lastSelector = self._buffer.selectors.length - 1;
                            } else self._addToBlock(lastSelector, selector + "{");

                            if (self._isEmptyObject(obj[selector])) {
                                level--;
                                if (level > 1) self._buffer.blocks[lastSelector] += "}";
                                else self._buffer.blocks[lastSelector] = "";
                            } else {
                                iterate(obj[selector]);
                                if (level > 1) self._buffer.blocks[lastSelector] += "}";
                                level--;
                            }
                        } else {
                            property = selector;

                            if (self._reCamelCase.test(selector) === true) {
                                property = self._toDash(selector);
                            }

                            if (self.config.prefixedProperties) {
                                if (lastSelector < 0) {
                                    lastSelector = 0;
                                    self._buffer.selectors.push("");
                                }
                                self._addToBlock(lastSelector, self._getPrefixedDeclarations(property, obj[selector]))
                            } else self._addToBlock(lastSelector, self._formattedDeclaration(property, obj[selector]))
                        }
                    }
                }
            };

            iterate(options);
            return self._insert();
        },

        _insert : function _insert() {
            var self, i, iterations, CSString;

            self        = this;
            iterations  = self._buffer.blocks.length;
            CSString    = "";

            for (i = 0; i < iterations; i++) {
                var selector    = self._buffer.selectors[i],
                    block       = self._buffer.blocks[i],
                    string      = "",
                    rulesLength = self._style.sheet.cssRules.length,
                    isKeyframe  = self._reKeyframe.exec(selector),
                    keyFrameName= "";

                if (selector === "") { // at-rule
                    string = selector + block;
                    CSString += string;
                    self._style.sheet.insertRule(string, rulesLength);
                } else {
                    if (isKeyframe) {
                        keyFrameName = isKeyframe[1];
                        if (CSSRule.WEBKIT_KEYFRAMES_RULE) {
                            selector = "@-webkit-keyframes" + keyFrameName;
                        } else if (CSSRule.MOZ_KEYFRAMES_RULE) {
                            selector = "@-moz-keyframes" + keyFrameName;
                        } else if (CSSRule.KEYFRAMES_RULE) {
                            selector = "@keyframes" + keyFrameName;
                        }
                    }

                    if (self._style.sheet.insertRule) {
                        CSString += selector + "{" + block + "}";
                        self._style.sheet.insertRule(selector + "{" + block + "}", rulesLength);
                    } else {
                        self._style.sheet.addRule(selector, block, 1);
                    }
                }
            }

            return CSString;
        },

        _addToBlock : function _addToBlock(index, value) {
            if (this._buffer.blocks[index] === undefined) this._buffer.blocks[index] = "";
            this._buffer.blocks[index] += value;
        },

        _formattedDeclaration : function _formattedDeclaration(property, value) {
            var isAtRule    = (property === "@import"),
                declaration = (isAtRule) ? (property + " " + value) : (property + ":" + value);
            return declaration + ";";
        },

        _toDash : function _toDash(string) {
            return string.replace(/([A-Z])/g, function(letter) {
                return '-' + letter.toLowerCase();
            });
        },

        _getPrefixedDeclarations : function _getPrefixedDeclarations(property, value) {
            var result, index, prefixed_properties, prefixed_properties_length;

            if (this.config.prefixedProperties[property]) {
                result = "";
                prefixed_properties = this._getPrefixedSelector(property);
                prefixed_properties_length = prefixed_properties.length;

                for (index = 0; index < prefixed_properties_length; index +=1) {
                    result += this._formattedDeclaration(prefixed_properties[index], value);
                }

                return result;
            };

            return this._formattedDeclaration(property, value);
        },

        _getPrefixedSelector : function _getPrefixedSelector(selector) {
            var index, result, prefixes, prefixes_length;

            result = [];
            prefixes = this.config.prefixedProperties[selector];
            prefixes_length = prefixes.length;

            for (index = 0; index < prefixes_length; index += 1) {
                result.push('-' + prefixes[index] + '-' + selector);
            }

            result.push(selector);

            return result;
        }
    };
})();
