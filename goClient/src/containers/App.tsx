import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as React from 'react';

import MainSection from '../components/MainSection';
import * as GameActions from '../actions/game';
import {GameState} from "../../../shared/models/game";

interface AppProps {
    game: GameState;
    dispatch: Dispatch;
}

class App extends React.Component<any, void> {
    render() {
        const { game, dispatch } = this.props;
        const actions = bindActionCreators(GameActions, dispatch);

        return (
            <div className="todoapp">
                <MainSection
                    game={game}
                    actions={actions}/>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    game: state.game
});

export default connect(mapStateToProps)(App);