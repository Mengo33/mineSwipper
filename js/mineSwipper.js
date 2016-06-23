"use strict"


const shuffle_board = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        for (var j = 0; j < arr[0].length; j++) {
            var ri = Math.floor(Math.random() * (i + 1));
            var rj = Math.floor(Math.random() * (j + 1));
            var temp = arr[i][j];
            arr[i][j] = arr[ri][rj];
            arr[ri][rj] = temp;
        }
    }
    return arr;
}

var ms = angular.module("mineswipper", []);

ms.controller("MineSwipperController", function CalcController($scope) {
    console.log("MineSwipperController is loading...");

    let N = 8;
    let bombs = 10;
    let game_over = false;
    let opens_cells = 0;

    const load_board_arr = ()=> {
        let counter = 0;
        return Array.from(new Array(N)).map(()=> {
            return Array.from(new Array(N)).map(()=> {
                counter += 1;
                return {v: counter <= bombs ? 'bomb' : 'unknown'};
            });
        });
    };
    $scope.board = load_board_arr();

    let refresh = ()=> {
        game_over = false;
        // var N = 12;
        // var bombs = 20;
        $scope.board = shuffle_board(load_board_arr());
        // $scope.board.map((row)=> {
        //     row.map((col)=> {
        //         console.log(col.v);
        //     });
        // });
    };

    $scope.draw = function () {
        $('#board').empty();
        refresh();
        // In a timeout so it doesn't get executed when Angular
        // is first started.
        setTimeout(function () {
            // The new element to be added
            var $new_board = $(`<div class="row" ng-repeat="row in board">
                <div ng-click="set_cell_value($parent.$index,$index)" ng-right-click="toggle_flag($parent.$index,$index)"
                     ng-repeat="cell in row">
                    <div class="cell" id="unknown" ng-if="cell.v === 'unknown' || cell.v === 'bomb'"></div>
                    <div class="cell" id="one" ng-if="cell.v === 1"></div>
                    <div class="cell" id="two" ng-if="cell.v === 2"></div>
                    <div class="cell" id="three" ng-if="cell.v === 3"></div>
                    <div class="cell" id="four" ng-if="cell.v === 4"></div>
                    <div class="cell" id="five" ng-if="cell.v === 5"></div>
                    <div class="cell" id="six" ng-if="cell.v === 6"></div>
                    <div class="cell" id="seven" ng-if="cell.v === 7"></div>
                    <div class="cell" id="eight" ng-if="cell.v === 8"></div>
                    <div class="cell" id="empty" ng-if="cell.v === 0"></div>
                    <div class="cell" id="bombed" ng-if="cell.v === 'bombed'"></div>
                    <div class="cell" id="theBomb" ng-if="cell.v === 'theBomb'"></div>
                    <div class="cell" id="flag" ng-if="cell.v === 'flag'"></div>
                </div>
            </div>`);

            // The parent of the new element
            var $target = $("#board");

            angular.element($target).injector().invoke(function ($compile) {
                var $scope = angular.element($target).scope();
                $target.append($compile($new_board)($scope));
                // Finally, refresh the watch expressions in the new element
                $scope.$apply();
            });
        }, 100);
    }

    $scope.set_cell_value = function (x, y) {
        if (game_over) {
            return;
        }
        if ($scope.board[x][y].v === 'bomb') {
            game_over = true;
            for (var i = 0; i < $scope.board.length; i++) {
                for (var j = 0; j < $scope.board[i].length; j++) {
                    if ($scope.board[i][j].v == 'bomb' || ($scope.board[i][j].v == 'flag' && temp_flag == 'bomb')) {
                        $scope.board[i][j].v = "bombed";
                    }
                }
            }
            $scope.board[x][y].v = 'theBomb';
            // setTimeout(()=> {
            // alert("Game is Over!");
            // },300);
        }
        else if ($scope.board[x][y].v === 'unknown') {
            $scope.neigbors(x, y);
            if (opens_cells === $scope.board.length * $scope.board[0].length - bombs) {
                game_over = true;
                setTimeout(()=> {
                    alert("You won!!!");
                }, 300);
            }
        }
    };


    $scope.neigbors = function (x, y) {
        if ($scope.board[x][y].v !== 'unknown' && $scope.board[x][y].v !== 'bomb' && $scope.board[x][y].v !== 'flag') {
            return;
        }
        var c = 0;
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i >= 0 && j >= 0 && i < $scope.board.length && j < $scope.board[0].length) {
                    if ($scope.board[i][j].v === 'bomb' || ($scope.board[i][j].v == 'flag' && temp_flag == 'bomb')) {
                        c++;
                    }
                }
            }
        }
        $scope.board[x][y].v = c;
        opens_cells += 1;
        if (c === 0) {
            for (var i = x - 1; i <= x + 1; i++) {
                for (var j = y - 1; j <= y + 1; j++) {
                    if (i >= 0 && j >= 0 && i < $scope.board.length && j < $scope.board[0].length) {
                        $scope.neigbors(i, j);
                    }
                }
            }
        }
    };

    let temp_flag;
    $scope.toggle_flag = function (x, y) {
        if (game_over) {
            return;
        }
        let cell = $scope.board[x][y].v;
        if (cell === 'bomb' || cell === 'unknown') {
            temp_flag = cell;
            $scope.board[x][y].v = 'flag';
        }
        else if (cell === 'flag') {
            $scope.board[x][y].v = temp_flag;
        }
    };

});

// ms.run(function init() {
//     console.log("mineswipper module is loading..");
// });

ms.directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function (event) {
            scope.$apply(function () {
                event.preventDefault();
                fn(scope, {$event: event});
            });
        });
    };
});

// angular.element(document).ready(function () {
//     var el = document.getElementById('bar');
//     angular.bootstrap(el, ['mineswipper']);
// });