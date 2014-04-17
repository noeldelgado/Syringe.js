
Syringe = {

    config : {
        prefixedProperties : null
    },
    _styleElement : null,
    _reCamelCase : new RegExp("[A-Z]"),
    _isEmptyObject : function _isEmptyObject(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    },

    inject : function inject(options) {
        var self, CSString, iterate;

        self = this;
        CSString = "";

        if (self._styleElement === null) {
            self._styleElement = document.createElement('style');
            self._styleElement.setAttribute("type", "text/css");
            document.body.appendChild(self._styleElement);
        }

        iterate = function iterate(obj) {
            var property, selector;

            for (property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "object") {
                        CSString += property + self._openingBracket();

                        if (self._isEmptyObject(obj[property])) {
                            CSString += self._closingBracket();
                        } else {
                            iterate(obj[property]);
                            CSString += self._closingBracket();
                        }
                    } else {
                        selector = property;

                        if (self._reCamelCase.test(property) === true) {
                            selector = self._toDash(property);
                        }

                        if (self.config.prefixedProperties) {
                            CSString += self._getPrefixedRules(selector, obj[property]);
                        } else {
                            CSString += self._formattedRule(selector, obj[property]);
                        }
                    }
                }
            }
        };

        iterate(options);

        self._styleElement.innerHTML += CSString;

        return CSString;
    },

    _formattedRule : function _formattedRule(selector, value) {
        return selector + ":" + value + ";";
    },

    _openingBracket : function _openingBracket() {
        return "{";
    },

    _closingBracket : function _closingBracket() {
        return "}";
    },

    _toDash : function _toDash(string) {
        return string.replace(/([A-Z])/g, function(letter) {
            return '-' + letter.toLowerCase();
        });
    },

    _getPrefixedRules : function _getPrefixedRules(selector, value) {
        var result, index, prefixed_selectors, prefixed_selectors_length;

        if (this.config.prefixedProperties[selector]) {
            result = "";
            prefixed_selectors = this._getPrefixedSelector(selector);
            prefixed_selectors_length = prefixed_selectors.length;

            for (index = 0; index < prefixed_selectors_length; index +=1) {
                result += this._formattedRule(prefixed_selectors[index], value);
            }

            return result;
        };

        return this._formattedRule(selector, value);
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
