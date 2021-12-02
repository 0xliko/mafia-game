var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var md = markdownit();

var Avatar = function (_React$Component) {
    _inherits(Avatar, _React$Component);

    function Avatar() {
        _classCallCheck(this, Avatar);

        return _possibleConstructorReturn(this, (Avatar.__proto__ || Object.getPrototypeOf(Avatar)).apply(this, arguments));
    }

    _createClass(Avatar, [{
        key: 'render',
        value: function render() {
            var url = this.props.profileImg?this.props.profileImg:'/images/defaultProfile.png';
            var className = 'avatar';
            var aviStyle = {};
            /*
            if (this.props.avatar && this.props.avatar.indexOf('https://i.imgur.com/') == 0) url = this.props.avatar;else if (this.props.avatar && this.props.dId && this.props.dId > 10) url = 'https://cdn.discordapp.com/avatars/' + this.props.dId + '/' + this.props.avatar + '.png';else if (this.props.dId && this.props.dId.length == 10) {
                var _dId = this.props.dId.replaceAll('-', '').replaceAll('_', '');
                url = 'https://cdn.discordapp.com/embed/avatars/' + Number(String(parseInt(_dId, 36))[9]) % 5 + '.png';
            } else if (this.props.tag != null) url = 'https://cdn.discordapp.com/embed/avatars/' + Number(this.props.tag) % 5 + '.png';*/

            aviStyle.backgroundImage = 'url(' + url + ')';

            switch (this.props.type) {
                case 'profile':
                    className += ' avi-profile';
                    break;
                case 'game':
                    className += ' avi-game';
                    break;
            }

            return React.createElement('div', { className: className, style: aviStyle });
        }
    }]);

    return Avatar;
}(React.Component);

var RoleCount = function (_React$Component2) {
    _inherits(RoleCount, _React$Component2);

    function RoleCount() {
        _classCallCheck(this, RoleCount);

        return _possibleConstructorReturn(this, (RoleCount.__proto__ || Object.getPrototypeOf(RoleCount)).apply(this, arguments));
    }

    _createClass(RoleCount, [{
        key: 'render',
        value: function render() {
            if (this.props.closed) {
                var iconClass = 'fas fa-question i-' + this.props.type;
                return React.createElement(
                    'div',
                    { className: 'role-count-wrap' },
                    React.createElement('i', { className: iconClass, title: this.props.type.toUpperCase() }),
                    React.createElement(
                        'div',
                        { className: 'super' },
                        this.props.count
                    )
                );
            } else {
                var roleClass = (this.props.small ? 'role-small' : 'role') + ' role-' + roleName(this.props.role);
                return React.createElement(
                    'div',
                    { className: 'role-count-wrap' },
                    React.createElement('div', { 'class': roleClass, title: this.props.role }),
                    React.createElement(
                        'div',
                        { 'class': 'super' },
                        this.props.count
                    )
                );
            }
        }
    }]);

    return RoleCount;
}(React.Component);

var Setup = function (_React$Component3) {
    _inherits(Setup, _React$Component3);

    function Setup() {
        _classCallCheck(this, Setup);

        return _possibleConstructorReturn(this, (Setup.__proto__ || Object.getPrototypeOf(Setup)).apply(this, arguments));
    }

    _createClass(Setup, [{
        key: 'render',
        value: function render() {
            var className = 'setup ' + (this.props.popover ? this.props.pop_clickable ? 'poptag-click' : 'poptag' : '') + ' ' + (this.props.alone ? 'setup-alone' : '');

            if (this.props.closed) {
                return React.createElement(
                    'div',
                    {
                        className: className,
                        ref: 'setup',
                        tabindex: '0',
                        'data-toggle': 'popover',
                        'data-trigger': !this.props.pop_clickable ? 'focus' : 'click',
                        'data-type': 'setup',
                        'data-id': this.props.id,
                        title: this.props.name,
                        'data-content': 'pop-' + this.props.id
                    },
                    this.props.count && this.props.count.village && React.createElement(RoleCount, { closed: this.props.closed, count: this.props.count.village, type: 'village' }),
                    this.props.count && this.props.count.mafia && React.createElement(RoleCount, { closed: this.props.closed, count: this.props.count.mafia, type: 'mafia' }),
                    this.props.count && this.props.count.monsters && React.createElement(RoleCount, { closed: this.props.closed, count: this.props.count.monsters, type: 'monsters' }),
                    this.props.count && this.props.count.independent && React.createElement(RoleCount, { closed: this.props.closed, count: this.props.count.independent, type: 'independent' })
                );
            } else if (this.props.roles) {
                var roles = JSON.parse(this.props.roles)[0];
                return React.createElement(
                    'div',
                    {
                        className: className,
                        ref: 'setup',
                        tabindex: '0',
                        'data-toggle': 'popover',
                        'data-trigger': !this.props.pop_clickable ? 'focus' : 'click',
                        'data-type': 'setup',
                        'data-id': this.props.id,
                        title: this.props.name,
                        'data-content': 'pop-' + this.props.id
                    },
                    Object.keys(roles).map(function (roleName, i) {
                        if (i < 6) return React.createElement(RoleCount, { role: roleName, count: roles[roleName] });else if (i == 6) return React.createElement('i', { className: 'fas fa-ellipsis-h' });
                    })
                );
            } else return null;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.popover) {
                $(this.refs.setup).popover();
            }
        }
    }]);

    return Setup;
}(React.Component);

var GameButton = function (_React$Component4) {
    _inherits(GameButton, _React$Component4);

    function GameButton(props) {
        _classCallCheck(this, GameButton);

        var _this4 = _possibleConstructorReturn(this, (GameButton.__proto__ || Object.getPrototypeOf(GameButton)).call(this, props));

        _this4.handleClick = _this4.handleClick.bind(_this4);
        return _this4;
    }

    _createClass(GameButton, [{
        key: 'render',
        value: function render() {
            var className = 'btn';
            var content = '';

            switch (this.props.type) {
                case 'open':
                    className += ' btn-success';
                    content = this.props.disabled ? 'Starting' : 'Join';
                    break;
                case 'inProgress':
                    className += ' btn-warning';
                    content = 'In Progress';
                    break;
                default:
                    className += ' btn-secondary';
                    content = 'Review';
            }

            return React.createElement(
                'button',
                { className: className, disabled: this.props.disabled, onClick: this.handleClick },
                content
            );
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            if (!this.props.disabled) {
                switch (this.props.type) {
                    case 'open':
                        window.location = '/game/' + this.props.id;
                        break;
                    case 'finished':
                        window.location = '/game/' + this.props.id + '/review';
                        break;
                }
            }
        }
    }]);

    return GameButton;
}(React.Component);

var GameWidget = function (_React$Component5) {
    _inherits(GameWidget, _React$Component5);

    function GameWidget() {
        _classCallCheck(this, GameWidget);

        return _possibleConstructorReturn(this, (GameWidget.__proto__ || Object.getPrototypeOf(GameWidget)).apply(this, arguments));
    }

    _createClass(GameWidget, [{
        key: 'render',
        value: function render() {
            var setup = this.props.setup;
            return React.createElement(
                'div',
                { className: 'game' },
                React.createElement(GameButton, {
                    id: this.props.id,
                    type: this.props.state,
                    disabled: this.props.disabled }),
                React.createElement(Setup, {
                    id: setup.id,
                    name: setup.name,
                    closed: setup.closed,
                    count: setup.count,
                    roles: setup.roles })
            );
        }
    }]);

    return GameWidget;
}(React.Component);

var ReactMarkdown = function (_React$Component6) {
    _inherits(ReactMarkdown, _React$Component6);

    function ReactMarkdown() {
        _classCallCheck(this, ReactMarkdown);

        return _possibleConstructorReturn(this, (ReactMarkdown.__proto__ || Object.getPrototypeOf(ReactMarkdown)).apply(this, arguments));
    }

    _createClass(ReactMarkdown, [{
        key: 'render',
        value: function render() {
            if (this.props.text) return React.createElement('span', { dangerouslySetInnerHTML: { __html: md.render(this.props.text) } });else return null;
        }
    }]);

    return ReactMarkdown;
}(React.Component);

var Bio = function (_React$Component7) {
    _inherits(Bio, _React$Component7);

    function Bio(props) {
        _classCallCheck(this, Bio);

        var _this7 = _possibleConstructorReturn(this, (Bio.__proto__ || Object.getPrototypeOf(Bio)).call(this, props));

        _this7.state = {
            editing: false
        };

        _this7.handleEditClick = _this7.handleEditClick.bind(_this7);
        _this7.handleChange = _this7.handleChange.bind(_this7);
        return _this7;
    }

    _createClass(Bio, [{
        key: 'render',
        value: function render() {
            var winPercent = this.props.user.wins / (this.props.user.wins + this.props.user.losses);
            var iconClass = 'edit-bio-icon fas fa-edit ' + (this.state.editing ? 'editing' : '');
            if (isNaN(winPercent)) winPercent = 0;

            return React.createElement(
                'div',
                { className: 'bio-panel' },
                React.createElement(
                    'div',
                    { className: 'avi-row' },
                    React.createElement(
                        'div',
                        { className: 'avi-name' },
                        React.createElement(Avatar, {
                            type: 'profile',
                            dId: this.props.user.dId,
                            profileImg: this.props.user.profileImg,
                            avatar: this.props.user.avatar,
                            tag: this.props.user.tag }),
                        React.createElement(
                            'div',
                            { className: 'name' },
                            this.props.user.name
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'stats' },
                        'Ranked Wins: ',
                        winPercent,
                        '%'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'bio-row' },
                    this.props.self && this.props.self == this.props.user.dId && React.createElement('i', { className: iconClass, onClick: this.handleEditClick }),
                    React.createElement(
                        'div',
                        { className: 'bio-msg' },
                        this.state.editing && React.createElement('textarea', {
                            className: 'bio-edit-input',
                            value: this.props.user.bio,
                            onChange: this.handleChange }),
                        !this.state.editing && React.createElement(ReactMarkdown, { text: this.props.user.bio })
                    ),
                    React.createElement('div', { className: 'profile-comments' })
                )
            );
        }
    }, {
        key: 'handleEditClick',
        value: function handleEditClick() {
            var _this8 = this;

            if (this.state.editing) {
                fetch('/user/bio', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ bio: this.props.user.bio })
                }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (res.success) {
                        _this8.setState({
                            editing: false
                        });
                    } else showError(res.error);
                });
            } else {
                this.setState({
                    editing: true
                });
            }
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.props.onBioChange(e.target.value);
        }
    }]);

    return Bio;
}(React.Component);

var Profile = function (_React$Component8) {
    _inherits(Profile, _React$Component8);

    function Profile(props) {
        _classCallCheck(this, Profile);

        var _this9 = _possibleConstructorReturn(this, (Profile.__proto__ || Object.getPrototypeOf(Profile)).call(this, props));

        _this9.state = {
            user: {},
            editingBanner: false
        };

        _this9.handleBannerEditClick = _this9.handleBannerEditClick.bind(_this9);
        _this9.handleBannerChange = _this9.handleBannerChange.bind(_this9);
        _this9.handleBioChange = _this9.handleBioChange.bind(_this9);
        return _this9;
    }

    _createClass(Profile, [{
        key: 'render',
        value: function render() {
            var bannerStyle = {
                backgroundImage: 'url(' + (this.state.user.banner || '/images/banner.png') + ')'
            };

            return React.createElement(
                'div',
                { className: 'profile-wrapper' },
                React.createElement(
                    'div',
                    { className: 'main-panel' },
                    React.createElement(
                        'div',
                        { className: 'image-panel', style: bannerStyle },
                        this.state.self && this.state.self == this.state.user.dId && React.createElement(
                            'div',
                            { className: 'edit-banner' },
                            React.createElement('i', { className: 'edit-banner-icon far fa-file-image', onClick: this.handleBannerEditClick }),
                            this.state.editingBanner && React.createElement('input', { className: 'edit-banner-input', value: this.state.user.banner, placeholder: 'Imgur Url', onChange: this.handleBannerChange })
                        )
                    ),
                    React.createElement(Bio, { user: this.state.user, self: this.state.self, onBioChange: this.handleBioChange })
                ),
                React.createElement(
                    'div',
                    { className: 'right-panel' },
                    React.createElement(
                        'div',
                        { className: 'games-panel' },
                        React.createElement(
                            'div',
                            { className: 'list-title' },
                            'Recent Games'
                        ),
                        React.createElement(
                            'div',
                            { className: 'list games-list' },
                            !this.state.user.games || !this.state.user.games.length ? React.createElement(
                                'div',
                                { className: 'no-list' },
                                'None'
                            ) : '',
                            this.state.user.games && this.state.user.games.map(function (game) {
                                if (game.state == 'open' && game.players == game.setup.total || game.state == 'inProgress') game.disabled = true;

                                return React.createElement(GameWidget, {
                                    id: game.id,
                                    setup: game.setup,
                                    state: game.state,
                                    disabled: game.disabled });
                            })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'setups-panel' },
                        React.createElement(
                            'div',
                            { className: 'list-title' },
                            'Setups Created'
                        ),
                        React.createElement(
                            'div',
                            { className: 'list setups-list' },
                            !this.state.user.setups || !this.state.user.setups.length ? React.createElement(
                                'div',
                                { className: 'no-list' },
                                'None'
                            ) : '',
                            this.state.user.setups && this.state.user.setups.map(function (setup) {
                                return React.createElement(Setup, {
                                    id: setup.id,
                                    name: setup.name,
                                    closed: setup.closed,
                                    count: setup.count,
                                    roles: setup.roles,
                                    alone: 'true',
                                    popover: 'true' });
                            })
                        )
                    )
                )
            );
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this10 = this;

            fetch('/user/' + this.props.dId + '/profile').then(function (res) {
                return res.json();
            }).then(function (res) {
                _this10.setState(res);
            });
        }
    }, {
        key: 'handleBannerEditClick',
        value: function handleBannerEditClick() {
            var _this11 = this;

            if (this.state.editingBanner) {
                fetch('/user/banner', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ banner: this.state.user.banner })
                }).then(function (res) {
                    return res.json();
                }).then(function (res) {
                    if (res.success) {
                        _this11.setState({
                            editingBanner: false
                        });
                    } else showError(res.error);
                });
            } else {
                this.setState({
                    editingBanner: true
                });
            }
        }
    }, {
        key: 'handleBannerChange',
        value: function handleBannerChange(e) {
            var url = e.target.value;
            var newUser = this.state.user;

            if (url.indexOf('http://') == 0) url.replace('http', 'https');

            //if (url.indexOf('http://i.imgur.com/') == 0 || url.length == 0) {
            newUser.banner = url;
            this.setState({
                user: newUser
            });
            //}
        }
    }, {
        key: 'handleBioChange',
        value: function handleBioChange(bio) {
            var newUser = this.state.user;
            newUser.bio = bio;

            this.setState({
                user: newUser
            });
        }
    }]);

    return Profile;
}(React.Component);

var dId = window.location.pathname.split('/')[2];
var domContainer = document.querySelector('#profile_app');
ReactDOM.render(React.createElement(Profile, { dId: dId }), domContainer);
