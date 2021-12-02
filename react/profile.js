const md = markdownit();

class Avatar extends React.Component {
    render () {
        let url = '';
        let className = 'avatar';
        let aviStyle = {};

        if (this.props.avatar && this.props.avatar.indexOf('https://i.imgur.com/') == 0)
            url = this.props.avatar;
        else if (this.props.avatar && this.props.dId && this.props.dId > 10)
            url = `https://cdn.discordapp.com/avatars/${this.props.dId}/${this.props.avatar}.png`;
        else if (this.props.dId && this.props.dId.length == 10) {
            let dId = this.props.dId.replaceAll('-', '').replaceAll('_', '');
            url = `https://cdn.discordapp.com/embed/avatars/${Number(String(parseInt(dId, 36))[9]) % 5}.png`;
        }
        else if (this.props.tag != null)
            url = `https://cdn.discordapp.com/embed/avatars/${Number(this.props.tag) % 5}.png`;

        aviStyle.backgroundImage = `url(${url})`;

        switch (this.props.type) {
            case 'profile':
                className += ' avi-profile';
                break;
            case 'game':
                className += ' avi-game';
                break;
        }

        return (
            <div className={className} style={aviStyle}></div>
        );
    }
}

class RoleCount extends React.Component {
    render () {
        if (this.props.closed) {
            let iconClass = `fas fa-question i-${this.props.type}`;
            return (
                <div className='role-count-wrap'>
                    <i className={iconClass} title={this.props.type.toUpperCase()}></i>
                    <div className='super'>{this.props.count}</div>
                </div>
            );
        }
        else {
            let roleClass = `${this.props.small ? 'role-small' : 'role'} role-${roleName(this.props.role)}`;
            return (
                <div className='role-count-wrap'>
                    <div class={roleClass} title={this.props.role}></div>
                    <div class='super'>{this.props.count}</div>
                </div>
            );
        }
    }
}

class Setup extends React.Component {
    render () {
        let className = `setup ${this.props.popover ? this.props.pop_clickable ? 'poptag-click' : 'poptag' : ''} ${this.props.alone ? 'setup-alone' : ''}`;

        if (this.props.closed) {
            return (
                <div
                    className={className}
                    ref='setup'
                    tabindex='0'
                    data-toggle='popover'
                    data-trigger={!this.props.pop_clickable ? 'focus' : 'click'}
                    data-type='setup'
                    data-id={this.props.id}
                    title={this.props.name}
                    data-content={`pop-${this.props.id}`}
                >
                    {this.props.count && this.props.count.village &&
                        <RoleCount closed={this.props.closed} count={this.props.count.village} type='village' />
                    }
                    {this.props.count && this.props.count.mafia &&
                        <RoleCount closed={this.props.closed} count={this.props.count.mafia} type='mafia' />
                    }
                    {this.props.count && this.props.count.monsters &&
                        <RoleCount closed={this.props.closed} count={this.props.count.monsters} type='monsters' />
                    }
                    {this.props.count && this.props.count.independent &&
                        <RoleCount closed={this.props.closed} count={this.props.count.independent} type='independent' />
                    }
                </div>
            );
        }
        else if (this.props.roles) {
            let roles = JSON.parse(this.props.roles)[0];
            return (
                <div
                    className={className}
                    ref='setup'
                    tabindex='0'
                    data-toggle='popover'
                    data-trigger={!this.props.pop_clickable ? 'focus' : 'click'}
                    data-type='setup'
                    data-id={this.props.id}
                    title={this.props.name}
                    data-content={`pop-${this.props.id}`}
                >
                    {Object.keys(roles).map((roleName, i) => {
                        if (i < 6)
                            return <RoleCount role={roleName} count={roles[roleName]} />;
                        else if (i == 6)
                            return <i className='fas fa-ellipsis-h'></i>;
                    })}
                </div>
            );
        }
        else
            return null;
    }

    componentDidMount () {
        if (this.props.popover) {
            $(this.refs.setup).popover();
        }
    }
}

class GameButton extends React.Component {
    constructor (props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render () {
        let className = 'btn';
        let content = '';

        switch (this.props.type) {
            case 'open':
                className += ' btn-success';
                content = this.props.disabled ? 'Starting' : 'Join';
                break;
            case 'inProgress':
                className += ' btn-warning';
                content = 'In Progress'
                break;
            default:
                className += ' btn-secondary';
                content = 'Review';
        }

        return (
            <button className={className} disabled={this.props.disabled} onClick={this.handleClick}>{content}</button>
        );
    }

    handleClick () {
        if (!this.props.disabled) {
            switch (this.props.type) {
                case 'open':
                    window.location = `/game/${this.props.id}`;
                    break;
                case 'finished':
                    window.location = `/game/${this.props.id}/review`;
                    break;
            }
        }
    }
}

class GameWidget extends React.Component {
    render () {
        let setup = this.props.setup;
        return (
            <div className='game'>
                <GameButton
                    id={this.props.id}
                    type={this.props.state}
                    disabled={this.props.disabled} />
                <Setup
                    id={setup.id}
                    name={setup.name}
                    closed={setup.closed}
                    count={setup.count}
                    roles={setup.roles} />
            </div>
        );
    }
}

class ReactMarkdown extends React.Component {
    render () {
        if (this.props.text)
            return <span dangerouslySetInnerHTML={{__html: md.render(this.props.text)}}></span>;
        else
            return null;
    }
}

class Bio extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            editing: false
        };

        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    render () {
        let winPercent = this.props.user.wins / (this.props.user.wins + this.props.user.losses);
        let iconClass = `edit-bio-icon fas fa-edit ${this.state.editing ? 'editing' : ''}`;
        if (isNaN(winPercent))
            winPercent = 0;

        return (
            <div className='bio-panel'>
                <div className='avi-row'>
                    <div className='avi-name'>
                        <Avatar
                            type='profile'
                            dId={this.props.user.dId}
                            avatar={this.props.user.avatar}
                            tag={this.props.user.tag} />
                        <div className='name'>
                            {this.props.user.name}
                        </div>
                    </div>
                    <div className='stats'>
                        Ranked Wins: {winPercent}%
                    </div>
                </div>
                <div className='bio-row'>
                    {this.props.self && this.props.self == this.props.user.dId &&
                        <i className={iconClass} onClick={this.handleEditClick}></i>
                    }
                    <div className='bio-msg'>
                        {this.state.editing &&
                            <textarea
                                className='bio-edit-input'
                                value={this.props.user.bio}
                                onChange={this.handleChange} />
                        }
                        {!this.state.editing &&
                             <ReactMarkdown text={this.props.user.bio} />
                         }
                    </div>
                    <div className='profile-comments'>

                    </div>
                </div>
            </div>
        );
    }

    handleEditClick () {
        if (this.state.editing) {
            fetch('/user/bio', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({bio: this.props.user.bio})
            })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        this.setState({
                            editing: false
                        });
                    }
                    else
                        showError(res.error);
                });
        }
        else {
            this.setState({
                editing: true
            });
        }
    }

    handleChange (e) {
        this.props.onBioChange(e.target.value);
    }
}

class Profile extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            user: {},
            editingBanner: false
        };

        this.handleBannerEditClick = this.handleBannerEditClick.bind(this);
        this.handleBannerChange = this.handleBannerChange.bind(this);
        this.handleBioChange = this.handleBioChange.bind(this);
    }

    render () {
        let bannerStyle = {
            backgroundImage: `url(${this.state.user.banner || '/images/banner.png'})`
        };

        return (
            <div className='profile-wrapper'>
                <div className='main-panel'>
                    <div className='image-panel' style={bannerStyle}>
                        {this.state.self && this.state.self == this.state.user.dId &&
                            <div className='edit-banner'>
                                <i className='edit-banner-icon far fa-file-image' onClick={this.handleBannerEditClick}></i>
                                {this.state.editingBanner &&
                                    <input className='edit-banner-input' value={this.state.user.banner} placeholder='Imgur Url' onChange={this.handleBannerChange} />
                                }
                            </div>
                        }
                    </div>
                    <Bio user={this.state.user} self={this.state.self} onBioChange={this.handleBioChange} />
                </div>
                <div className='right-panel'>
                    <div className='games-panel'>
                        <div className='list-title'>
                            Recent Games
                        </div>
                        <div className='list games-list'>
                            {!this.state.user.games || !this.state.user.games.length ? <div className='no-list'>None</div> : ''}
                            {this.state.user.games && this.state.user.games.map(game => {
                                if ((game.state == 'open' && game.players == game.setup.total) || game.state == 'inProgress')
                                    game.disabled = true;

                                return (
                                    <GameWidget
                                        id={game.id}
                                        setup={game.setup}
                                        state={game.state}
                                        disabled={game.disabled} />
                                );
                            })}
                        </div>
                    </div>
                    <div className='setups-panel'>
                        <div className='list-title'>
                            Setups Created
                        </div>
                        <div className='list setups-list'>
                            {!this.state.user.setups || !this.state.user.setups.length ? <div className='no-list'>None</div> : ''}
                            {this.state.user.setups && this.state.user.setups.map(setup =>
                                <Setup
                                    id={setup.id}
                                    name={setup.name}
                                    closed={setup.closed}
                                    count={setup.count}
                                    roles={setup.roles}
                                    alone='true'
                                    popover='true' />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount () {
        fetch(`/user/${this.props.dId}/profile`)
            .then(res => res.json())
            .then(res => {
                this.setState(res);
            });
    }

    handleBannerEditClick () {
        if (this.state.editingBanner) {
            fetch('/user/banner', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({banner: this.state.user.banner})
            })
                .then(res => res.json())
                .then(res => {
                    if (res.success) {
                        this.setState({
                            editingBanner: false
                        });
                    }
                    else
                        showError(res.error);
                });
        }
        else {
            this.setState({
                editingBanner: true
            });
        }
    }

    handleBannerChange (e) {
        let url = e.target.value;
        let newUser = this.state.user;

        if (url.indexOf('http://') == 0)
            url.replace('http', 'https');

        //if (url.indexOf('http://i.imgur.com/') == 0 || url.length == 0) {
            newUser.banner = url;
            this.setState({
                user: newUser
            });
        //}
    }

    handleBioChange (bio) {
        let newUser = this.state.user;
        newUser.bio = bio;

        this.setState({
            user: newUser
        });
    }
}

const dId = window.location.pathname.split('/')[2];
const domContainer = document.querySelector('#profile_app');
ReactDOM.render(<Profile dId={dId} />, domContainer);
