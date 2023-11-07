import random
from pyodide.ffi import create_proxy
from js import console,document
class Game():
    def __init__(self):
        self.player1 = "x"
        self.player2 = "o"
        self.board = [[" " for _ in range(3)] for _ in range(3)]
        self.turn = self.player1
        self.allmoves = []
        self.initHTML()

    def updateDivs(self,reset=False):
        squares=document.getElementById("board").children
        for square in squares:
            id=square.id
            if reset:
                square.style.color="black"
            row, col = (int(id) - 1) // 3, (int(id) - 1) % 3
            if self.board[row][col]=="x":
                square.innerText = "x"
            elif self.board[row][col]=="o":
                square.innerText = "o" 
            else:
                square.innerText = ""
    def initHTML(self):
        squares=document.getElementById("board").children
        for square in squares:
            square.addEventListener("click", create_proxy(self.move))
        document.getElementById("reset").addEventListener("click", create_proxy(self.reset))
            
    def move(self,e):
        place=int(e.target.id)
        row, col = (place - 1) // 3, (place - 1) % 3
        if self.board[row][col] == " ":
            self.board[row][col] = self.turn
            self.turn = self.player1 if self.turn == self.player2 else self.player2
            self.allmoves.append((place))
            self.updateDivs()
            if self.checkWin():
                print(f"{self.board[row][col]} won!")
                self.updateDivs()
                self.winLine()
            else:
                self.draw()
    def reset(self,e=None):
        self.player1 = "x"
        self.player2 = "o"
        self.board = [[" " for _ in range(3)] for _ in range(3)]
        self.turn = self.player1
        self.allmoves = []
        self.updateDivs(True)
        self.initHTML()
    def draw(self):
        if len(self.allmoves)==9:
            self.reset()
    def checkWin(self):
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
                self.winLine(combination)
                return True
        return False
    def winLine(self,combo):
        for (r, c) in combo:
            num=3*r+c+1
            document.getElementById(str(num)).style.color = "red"
        squares=document.getElementById("board").children
        for square in squares:
            s=square.cloneNode(False)
            square.parentNode.replaceChild(s,square)


        
        
        
def main():
    g = Game()
    



if __name__ == "__main__":
    main()