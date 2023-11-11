import random
from js import console, document
from pyodide.ffi import create_proxy
class Game:
    def __init__(self):
        self.player1 = "x"
        self.player2 = "o"
        self.board = [[" " for _ in range(3)] for _ in range(3)]
        self.turn = self.player1
        self.allmoves = []
        self.initHTML()

    def updateDivs(self, reset=False):
        squares = document.getElementById("board").children
        for square in squares:
            id = square.id
            if reset:
                square.style.color = "black"
            row, col = (int(id) - 1) // 3, (int(id) - 1) % 3
            if self.board[row][col] == "x":
                square.innerText = "x"
            elif self.board[row][col] == "o":
                square.innerText = "o"
            else:
                square.innerText = ""

    def initHTML(self):
        squares = document.getElementById("board").children
        for square in squares:
            newSqaure = square.cloneNode(True)
            square.parentNode.replaceChild(newSqaure, square);
            newSqaure.addEventListener("click", create_proxy(self.human))
        document.getElementById("reset").addEventListener("click", create_proxy(self.reset))

    def move(self, place):
        row, col = (place - 1) // 3, (place - 1) % 3
        if self.board[row][col] == " ":
            self.board[row][col] = self.turn
            self.turn = self.player1 if self.turn == self.player2 else self.player2
            self.allmoves.append(place)
            self.updateDivs()
            if self.checkWin():
                #print(f"{self.player1 if self.turn == self.player2 else self.player2} won!")
                self.updateDivs()
            else:
                self.draw()


    def human(self, e):
        place = int(e.target.id)
        self.move(place)

    def reset(self, e=None):
        self.player1 = "x"
        self.player2 = "o"
        self.turn = self.player1
        self.allmoves = []
        self.board = [[" " for _ in range(3)] for _ in range(3)]
        self.updateDivs(True)
        self.initHTML()

    def draw(self, mm=False):
        
        if len(self.allmoves) == 9:
            if not mm:
                console.log(23)
                self.reset()
            return True
        return False

    def checkWin(self, mm=False):
        winCombo = [
            [(0, 0), (0, 1), (0, 2)],
            [(1, 0), (1, 1), (1, 2)],
            [(2, 0), (2, 1), (2, 2)],
            [(0, 0), (1, 0), (2, 0)],
            [(0, 1), (1, 1), (2, 1)],
            [(0, 2), (1, 2), (2, 2)],
            [(0, 0), (1, 1), (2, 2)],
            [(0, 2), (1, 1), (2, 0)]
        ]

        for combination in winCombo:
            symbols = [self.board[r][c] for (r, c) in combination]
            if len(set(symbols)) == 1 and " " not in symbols:
                if not mm:
                    self.winLine(combination)
                return True
        return False

    def winLine(self, combo):
        for (r, c) in combo:
            num = 3 * r + c + 1
            document.getElementById(str(num)).style.color = "red"
        squares = document.getElementById("board").children
        for square in squares:
            s = square.cloneNode(False)
            square.parentNode.replaceChild(s, square)

    def ai(self):
        available_moves = [(row, col) for row in range(3) for col in range(3) if self.board[row][col] == " "]
        random.shuffle(available_moves)

        bestMove = None
        bestScore = -float("inf")

        for row, col in available_moves:
            self.board[row][col] = "O"
            score = self.minimax(self.turn,0)
            self.board[row][col] = " "
            if score > bestScore:
                bestScore = score
                bestMove = (row, col)

        if bestMove:
            row, col = bestMove
            place = row * 3 + col + 1
            self.move(place)

        
            

    def minimax(self, player,depth):
        if self.checkWin(True):
            if player == "x":
                return -1
            if player == "o":
                return 1
        if self.draw(True):
            return 0

        if player == "o":
            best_score = -float("inf")
            for row in range(3):
                for col in range(3):
                    if self.board[row][col] == " ":
                        self.board[row][col] = player
                        score = self.minimax("x",depth+1)
                        self.board[row][col] = " "
                        best_score = max(score, best_score)+(1/depth if depth!= 0 else 0)
            return best_score
        else:
            best_score = float("inf")
            for row in range(3):
                for col in range(3):
                    if self.board[row][col] == " ":
                        self.board[row][col] = player
                        score = self.minimax("o",depth+1)
                        self.board[row][col] = " "
                        best_score = min(score, best_score)-(1/depth if depth!= 0 else 0)
            return best_score


def main():
    g = Game()


if __name__ == "__main__":
    main()
