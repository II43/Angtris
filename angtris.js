
// Support functions
let clonearray = function(oarray) {
    var narray = [];

    for (let i = 0; i < oarray.length; i++) {
        narray[i] = oarray[i].slice();
    }
    return narray;
}

let randominteger = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let numberorder = function (n) {
    return Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
}


// Classes
let game = function () {
    let obj = {};
    
    var newgame = function () {
        obj.isRunning = true;
        obj.board = board();
    }
    obj.newgame = newgame;

    newgame();

    return obj;
}

let board = function () {
    let obj = {};
    const N_ROWS = 20;
    const N_COLS = 10;
    
    obj.newboard = function() {
        // Initialization
        obj.data = Array(N_ROWS);
        for (let r = 0; r < N_ROWS; r++) {
            obj.data[r] = Array(N_COLS).fill(false);
        }
        obj.currshape = new shape(0,4);
        obj.nextshape = new shape(0,4);
        obj.score = 0;
        obj.speed = 990;
        obj.highscore = localStorage.getItem("highscore") || 0;
    }

    // Drawing
    obj.drawshape = function (val) {
        for (let r = 0; r < obj.currshape.blocks.length; r++) {
            for (let c = 0; c < obj.currshape.blocks[r].length; c++) {
                if (obj.currshape.blocks[r][c]) {
                    obj.data[obj.currshape.row+r][obj.currshape.col+c] = val;
                }     
            }    
        }
    }
    
    obj.moveshape = function (action) {
        let next = shape(
            obj.currshape.row,obj.currshape.col,
            clonearray(obj.currshape.blocks)
            );
        obj.drawshape(false);   
        next[action]();
        let allowfreeze = (action == "movedown");
        if (obj.check(next, allowfreeze)) {
            obj.currshape[action]();                
        }
        obj.drawshape(true);   
    }

    obj.check = function (s, allowfreeze) {
        if (allowfreeze === undefined) {
            allowfreeze = true;
        }
        for (let r = 0; r < s.blocks.length; r++) {
            for (let c = 0; c < s.blocks[r].length; c++) {
                if (s.blocks[r][c]) {
                    if (s.col+c < 0 || s.col+c >= N_COLS) return false;
                    else if (s.row+r >= N_ROWS ||
                             obj.data[s.row+r][s.col+c])  {
                        // Freeze it
                        if (allowfreeze) {
                            obj.drawshape(true);
                            obj.destroy();
                            obj.currshape = obj.nextshape; 
                            obj.nextshape = new shape(0,4);
                            obj.currshape.movedown();
                            if (!obj.check(obj.currshape,false)) {
                                // Game over
                                let msgGameOver = "GAME OVER" + "\n" + "Score: " + obj.score;
                                if (obj.score >= obj.highscore) {
                                    localStorage.setItem("highscore",obj.score);
                                    msgGameOver += "\n" + "New high score! Congratulations!";
                                }
                                obj.newboard();
                                alert(msgGameOver);

                            } else {
                                obj.currshape.moveup();
                            }
                        }    
                        return false;
                    }
                }     
            }    
        }
        return true;
    }

    obj.destroy = function () {
        let rowchecker = row => row.every(cell => cell === true);
        let count = 0;
        for (let r = 0; r < N_ROWS; r++) {
            if (rowchecker(obj.data[r])) {
                // Move all rows above down
                for (let i = r; i > 0; i--) {
                    obj.data[i] = obj.data[i-1];
                }
                obj.data[0] = Array(N_COLS).fill(false);
                obj.currshape.movedown();
                count++;
            }
        }
        let addedscore = (count * count) * 100;
        obj.score += addedscore;
        if (Math.floor(obj.score/1000) != Math.floor((obj.score-addedscore)/1000)) {
            obj.speed -= Math.pow(10,numberorder(obj.speed));
        }

    }
    obj.newboard();
    obj.drawshape(true);
    return obj;
}

let shape = function (r,c,blocks) {
    let obj = {};

    obj.movedown = function () {
        obj.row += 1;
        return this; 
    }
    obj.moveup = function () {
        obj.row -= 1;
        return this; 
    }
    obj.moveleft = function () {
        obj.col -= 1;
        return this; 
    }
    obj.moveright = function () {
        obj.col += 1;
        return this; 
    }
    obj.rotate = function () {
        // Rotate by +90 degrees = transpose and reverse each row
        for (let r = 0; r < obj.blocks.length; r++) {
            for (let c = 0; c < r; c++) {
                [obj.blocks[r][c], obj.blocks[c][r]] = [obj.blocks[c][r], obj.blocks[r][c]];
            }
        }
        for (let r = 0; r < obj.blocks.length; r++) {
            obj.blocks[r].reverse()
        }
        return this;
    }  

    obj.getrandomblocks = function() {
        let blocks = [
        [
        [0,1,0],
        [0,1,0],
        [1,1,0]
        ],
        [
        [0,1,0],
        [0,1,0],
        [0,1,1]
        ],
        [
        [0,1,0],
        [0,1,1],
        [0,1,0]
        ],
        [
        [0,1,0],
        [1,1,0],
        [1,0,0]
        ],
        [
        [0,1,0],
        [0,1,1],
        [0,0,1]
        ],
        [
        [1,1,0],
        [1,1,0],
        [0,0,0]
        ],
        [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        ]];

        let i = randominteger(0,blocks.length - 1);
        return clonearray(blocks[i])
    }

    obj.row = r || 0;
    obj.col = c || 0;
    obj.blocks = blocks || obj.getrandomblocks();

    return obj;
}

// Main 

let app = angular.module('myApp', []);
app.controller('boardCtrl', function($scope, $timeout) {
    // Game
    $scope.game = game();
    $scope.board = $scope.game.board;

     // Gravity
    let gravity;
    $scope.onTimeout = function() {
        if ($scope.game.isRunning) {
            $scope.board.moveshape("movedown");
            gravity = $timeout($scope.onTimeout,$scope.board.speed);
        }
    }

    $scope.start = function() {
        gravity = $timeout($scope.onTimeout,$scope.board.speed);
        $scope.game.isRunning = true;
    }
    
    $scope.stop = function() {
        $timeout.cancel(gravity);
        $scope.game.isRunning = false;
    }

    $scope.start();


    // Keyboard
    $scope.keydown = function(event) {
        let keycodes = {
            "LEFT":     37,
            "UP":       38,
            "RIGHT":    39,
            "DOWN":     40,
            "SPACE":    32, 
            'P':        80
        }
        switch(event.keyCode) {
            case keycodes.LEFT:
                $scope.board.moveshape("moveleft");
                break;
            case keycodes.RIGHT:
                $scope.board.moveshape("moveright");
                break;
            case keycodes.DOWN:
                $scope.board.moveshape("movedown");
                break;    
            case keycodes.UP: 
            case keycodes.SPACE:
                $scope.board.moveshape("rotate");
                break;     
            case keycodes.P:
                if ($scope.game.isRunning) {
                    $scope.stop();         
                } else {
                    $scope.start(); 
                }
                break;
                   
            default:
                // Do nothing
        }
    }
    
    // Style class
    $scope.getbackground = function(cell) {
        return cell ? 'active': '';
    }
});