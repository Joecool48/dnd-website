'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Main = function (_React$Component) {
    _inherits(Main, _React$Component);

    function Main(props) {
        _classCallCheck(this, Main);

        var _this = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this, props));

        _this.state = { liked: false };
        return _this;
    }

    _createClass(Main, [{
        key: 'render',
        value: function render() {
            if (this.state.liked) {
                return 'You liked this.';
            }
            //<button onClick={() => this.setState({ liked: true }) }>
            //    Like
            //</button>

            return React.createElement(
                'div',
                { display: 'block' },
                React.createElement(
                    'h2',
                    null,
                    'Town'
                ),
                React.createElement(
                    'table',
                    { cellpadding: '5', border: '1' },
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'One'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Two'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Three'
                        )
                    ),
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            null,
                            'Hello'
                        ),
                        React.createElement(
                            'td',
                            null,
                            'Hola'
                        ),
                        React.createElement(
                            'td',
                            null,
                            'Bonjur'
                        )
                    )
                )
            );
        }
    }]);

    return Main;
}(React.Component);

var domContainer = document.querySelector('#main_container');
ReactDOM.render(React.createElement(Main, null), domContainer);