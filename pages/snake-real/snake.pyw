import random
from js import console,document, setInterval,clearInterval
from pyodide.ffi import create_proxy

class Game():
    def isInt(self,value):
        try:
            int(value)
            return True
        except ValueError:
            return False
    def __init__(self):
        self.board = document.getElementById("board")
        self.createBoard()
        self.pixels = []
        self.amount = 25
        self.speed=2
        self.inputs = []
        self.appleStart=1
        self.direction = ""
        self.border = 0
        self.headPixel = None
        self.bodyPixels = []
        self.applePixels=[]
        self.intervalID=setInterval(create_proxy(self.update), 500/self.speed)  # Snake moves every 500 milliseconds
        document.getElementById("play").addEventListener("click", create_proxy(self.play))
        document.getElementById("reset").addEventListener("click", create_proxy(self.restart))
        document.addEventListener("keydown", create_proxy(self.keyEvent))
        self.createGrid()
        self.startup()
        for i in range(self.appleStart):
            self.addApple()
    def restart(self,e=None):
        self.board = document.getElementById("board")
        self.createBoard()
        self.pixels = []
        self.amount = 25
        self.speed=2
        self.inputs = []
        self.appleStart=1
        self.direction = ""
        self.border = 0
        self.headPixel = None
        self.bodyPixels = []
        self.applePixels=[]
        document.getElementById("play").addEventListener("click", create_proxy(self.play))
        document.getElementById("reset").addEventListener("click", create_proxy(self.restart))
        document.addEventListener("keydown", create_proxy(self.keyEvent))
        clearInterval(self.intervalID)
        self.intervalID=setInterval(create_proxy(self.update), 500/self.speed)  # Snake moves every 500 milliseconds
        self.createGrid()
        self.startup()
        for i in range(self.appleStart):
            self.addApple()
        
    def createBoard(self):
        self.board.remove()
        self.board = document.createElement("div")
        self.board.id = "board"
        self.board.className = "board"
        document.getElementById("centered-box").prepend(self.board)

    def createGrid(self):
        self.board.style.display = "grid"
        self.board.style.gridTemplateColumns = f"repeat({self.amount}, 1fr)"
        self.board.style.gridTemplateRows = f"repeat({self.amount}, 1fr)"
        self.board.style.width = "80vmin"
        self.board.style.height = "80vmin"
        self.board.style.margin = "auto"

        for row in range(self.amount):
            for col in range(self.amount):
                cell = document.createElement("div")
                cell.id = f"{row}ffff{col}"
                cell.style.width = f"calc(80vmin / {self.amount})"
                cell.style.height = f"calc(80vmin / {self.amount})"
                cell.style.border = f"{self.border}px solid #000"
                cell.style.boxSizing = "border-box"
                self.board.appendChild(cell)
                self.pixels.append(cell)
    def middleChange(self,middle,rowChange,colChange):
        return((middle[0]+rowChange,middle[1]+colChange))
    def startup(self):
        middleAdd = 0.5 if self.amount % 2 == 1 else 0
        middle = (int((self.amount/ 2) + middleAdd)-1,int((self.amount/ 2) + middleAdd)-1) 
        
        startSnake = [middle,self.middleChange(middle,1,0),self.middleChange(middle,2,0)]
        for pixel in self.pixels:
            pixel.style.backgroundColor = "#000"
            pixel.style.color = "#000"
            pixel.style.border = f"{self.border}px solid #666"
            pixel.style.boxSizing = "border-box"
            pixel.style.cursor = "pointer"
            l=pixel.id.split('ffff')
            l2=l[1].split('head')[0]
            l2=l2.split('body')[0]
            row, col = int(l[0]), int(l2)
            if (row,col) == startSnake[0]:
                pixel.style.backgroundColor = "green"
                pixel.id = f"{row}ffff{col}head"
                self.headPixel = pixel

            elif (row,col) in startSnake:
                pixel.style.backgroundColor = "green"
                pixel.id = f"{row}ffff{col}body"
                self.bodyPixels.append(pixel)

    def keyEvent(self, event):
        key = event.keyCode
        last=self.inputs[-1] if self.inputs else self.direction
        # if key == 37 and last != "right":
        #     self.inputs.append("left") if len(self.inputs) != 2 else self.inputs.insert(1,"left")
        # elif key == 38 and last != "down":
        #     self.inputs.append("up") if len(self.inputs) != 2 else self.inputs.insert(1,"up")
        # elif key == 39 and last != "left":
        #     self.inputs.append("right") if len(self.inputs) != 2 else self.inputs.insert(1,"right")
        # elif key == 40 and last != "up":
        #     self.inputs.append("down") if len(self.inputs) != 2 else self.inputs.insert(1,"down")
        if key==38 and last != "down":
            self.direction="up"
        if key ==37 and last!= "right":
            self.direction="left"
        if key == 39 and last!= "left":
            self.direction="right"
        if key == 40 and last!= "up":
            self.direction="down"
    def update(self):
        
        if self.inputs:
            self.direction = self.inputs.pop(0)
        if self.direction and self.headPixel:
            self.moveSnake()
    def play(self,e):
        document.getElementById("play").disabled = True
        document.getElementById("play").disabled = False
        self.direction ="up"
    def moveSnake(self):
        l=self.headPixel.id.split('ffff')
        l2=l[1].split('head')[0]
        l2=l2.split('body')[0]
        row, col = int(l[0]), int(l2)
        newHeadRow, newHeadCol = row, col

        if self.direction == "left":
            newHeadCol -= 1
        elif self.direction == "right":
            newHeadCol += 1
        elif self.direction == "up":
            newHeadRow -= 1
        elif self.direction == "down":
            newHeadRow += 1
        if 0 > newHeadRow:
            newHeadRow=self.amount-1
        if 0 > newHeadCol:
            newHeadCol=self.amount-1
        if self.amount <= newHeadRow:
            newHeadRow=0
        if self.amount <= newHeadCol:
            newHeadCol=0
        newHeadId = newHeadRow * self.amount + newHeadCol
        newHeadPixel = self.pixels[newHeadId]
        if newHeadPixel in self.bodyPixels:
            self.restart()
        newHeadPixel.style.backgroundColor = "green"
        tailPixel = self.bodyPixels[-1]
        tailPixel.style.backgroundColor = "#000"
        if newHeadPixel in self.applePixels:
            self.applePixels.remove(newHeadPixel)
            self.addApple()
        else: self.bodyPixels.remove(tailPixel) 
        self.bodyPixels.insert(0,self.headPixel)
        self.headPixel = newHeadPixel
    def addApple(self):
        randomInt=random.randint(0,self.amount**2-1)
        randomPixel=self.pixels[randomInt]
        condition=True
        while condition:
            if randomPixel not in self.bodyPixels:
                if randomPixel != self.headPixel:
                    condition=False
                    continue
            randomInt=random.randint(0,self.amount**2-1)
            randomPixel=self.pixels[randomInt]
        self.applePixels.append(randomPixel)
        randomPixel.style.backgroundColor = "red"
        
def main():
    g = Game()

if __name__ == "__main__":
    main()
