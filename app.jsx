var React = require('react/addons');

var typicalb = [
  [-1,  0, -1,  0, -1,  0, -1,  0],
  [ 0, -1,  0, -1,  0, -1,  0, -1],
  [-1,  0, -1,  0, -1,  0, -1,  0],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [ 1, -1,  1, -1,  1, -1,  1, -1],
  [ 1,  1, -1,  1, -1,  1, -1,  1],
  [ 1, -1,  1, -1,  1, -1,  1, -1]
];

var Cell = React.createClass({
  propTypes: {
    black: React.PropTypes.bool.isRequired,
    checkType: React.PropTypes.number,
    active: React.PropTypes.bool.isRequired
  },

  _onClick: function(e) {
    if(!this.props.black){return;}
    if(this.props.checkType!==-1) {
      this.props.onCellActivated();
    } else {
      this.props.onTryToMove();
    }
  },

  render: function() {
    var classn = 'cell';
    var classit = 'item';
    if(this.props.black) {classn+=' black'}
    if(this.props.isAvailableMove) {classn+=' available'}
    if(this.props.active) {classit+=' activeone'}
    if(this.props.checkType === 0) {classit += ' one'}
    if(this.props.isAvailableKill) {classit += ' under_kill'}
    else {classit+=' two'}

    var item = null;
    if(this.props.checkType>=0) {
      item=(
        <div
          className={classit}
          style={
            {
              top:this.props.size/4,
              left:this.props.size/4,
              height: this.props.size/2,
              width: this.props.size/2
            }
          }>
        </div>);
    }

    return (
      <div className={classn} style={this.props.style} onClick={this._onClick} >
        {item}
      </div>
    );
  }
});

var Board = React.createClass({
  propTypes: {
    cellSize: React.PropTypes.number.isRequired,
    gameInitial: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      game: this.props.gameInitial,
      activePos: null,
      availableMoves: [],
      availableHits: []
    };
  },

  _click: function(e) {

  },

  // @param pA - which tries to hit
  // @param item - who hits
  _canHit: function(pA, pB, item) {
    if(!item) {
      item = this.state.game[pA.y][pA.x];
    }
    var diff = (item===0)?1:-1;
    return (
        (pA.y+diff===pB.y
          &&(
            (pA.x+diff===pB.x&&this.state.game[pB.y+diff][pB.x+diff]===-1)
            ||
            (pA.x-diff===pB.x&&this.state.game[pB.y+diff][pB.x-diff]===-1)
          )
        )
        ||
        (pA.y-diff===pB.y
          &&(
            (pA.x+diff===pB.x&&this.state.game[pB.y-diff][pB.x+diff]===-1)
            ||
            (pA.x-diff===pB.x&&this.state.game[pB.y-diff][pB.x-diff]===-1)
          )
        )
      )
  },

  _canHitPoints: function(pA, item) {
    var res = [];
    if(!item) {
      item = this.state.game[pA.y][pA.x];
    }
    return res;
  },

  _hitResult: function(pA, pB, item) {
    if(!item) {
      item = this.state.game[pA.y][pA.x];
    }
    if(!this._canHit(pA, pB, item)) {
      return;
    } else {
      var diff = {x:pB.x-pA.x, y:pB.y-pA.y};
      return {x:pA.x+2*diff.x,y:pA.y+2*diff.y,kill:{x:pA.x+diff.x,y:pA.y+diff.y}};
    }
  },

  _getAvailableMovesForPoint: function(point, item) {
    var res = {hits:[],move:[]};
    if(typeof item !== 'number') {
      item = this.state.game[point.y][point.x];
    }

    if(typeof item!=='number') {
      return res;
    }

    var diff = (item === 0)?1:-1;

    var first = {y:point.y+diff,x:point.x-diff};
    var second = {y:point.y+diff,x:point.x+diff};

    if(this.state.game[first.y][first.x]===-1) {
      res.move.push({y:first.y,x:first.x});
    } else if(this.state.game[first.y][first.x]!==item&&this._canHit(point,first)) {
      res.hits.push(this._hitResult(point,first));
    }
    if(this.state.game[second.y][second.x]===-1) {
      res.move.push({y:second.y,x:second.x});
    } else if(this.state.game[second.y][second.x]!==item&&this._canHit(point,second)) {
      res.hits.push(this._hitResult(point,second));
    }
    return res;
  },

  _isAvailableMove: function(point) {
    return this.state.availableMoves.some(function(one) {
      return Boolean(point.x===one.x&&point.y===one.y);
    });
  },

  _isAvailableHit: function(point) {
    return this.state.availableHits.some(function(one) {
      return Boolean(point.x===one.kill.x,point.y===one.kill.y);
    });
  },

  _newMove: function(movePoint) {
    if (this._isAvailableMove(movePoint)) {
      var changedGame = this.state.game;
      changedGame[movePoint.y][movePoint.x] = this.state.game[this.state.activePos.y][this.state.activePos.x];
      changedGame[this.state.activePos.y][this.state.activePos.x]=-1;
      this.setState({game:changedGame,activePos:null,availableMoves:[]});
    }
  },

  _newCellActivated: function(newActivePos) {
    if(this.state.activePos&&this.state.activePos.x===newActivePos.x&&this.state.activePos.y===this.state.activePos.y) {
      this.setState({activePos:null,availableMoves:[],availableHits:[]});
      return false;
    } else if(this.state.game[newActivePos.y][newActivePos.x]!==-1) {
      var available = this._getAvailableMovesForPoint(newActivePos);
      this.setState({activePos:newActivePos,availableMoves:available.move,availableHits:available.hits});
      return true;
    }
  },

  _cells: [],

  render: function() {

    this._cells = [];
    var black = false;

    for(var i = 0; i < 64; i++) {
      var thisx = (i%8);
      var thisy = Math.floor(i/8);

      var has = black&&this.state.game[thisy][thisx]>=0;

      var key = JSON.stringify({x:thisx,y:thisy});
      var checkType = -1;
      if(has) {
        checkType = this.state.game[thisy][thisx];
      }

      var active = this.state.activePos!==null&&this.state.activePos.x===thisx&&this.state.activePos.y===thisy;
      var availableMove = this._isAvailableMove({x:thisx,y:thisy});
      var availableKill = this._isAvailableHit({x:thisx,y:thisy});

      this._cells.push(
        <Cell
          black={black}
          checkType={checkType}
          active={active}
          isAvailableMove={availableMove}
          isAvailableKill={availableKill}
          size={this.props.cellSize}
          onCellActivated={this._newCellActivated.bind(this,{x:thisx,y:thisy})}
          onTryToMove={this._newMove.bind(this,{x:thisx,y:thisy})}
          key={i}
          ref={key}
          style={
            {
              top:(thisy)*this.props.cellSize,
              left:(thisx)*this.props.cellSize,
              height:this.props.cellSize,
              width:this.props.cellSize
            }
          }
        />
      );
      if((i+1)%8!==0){
        black = !black;
      }
    }

    return (
      <div id='board' style={{height:this.props.cellSize*8,width:this.props.cellSize*8}}>{this._cells}</div>
    );
  }
});

React.render(<Board cellSize={70} gameInitial={typicalb} />, document.getElementById('app'));
