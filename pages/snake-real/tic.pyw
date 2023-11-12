import random
from js import console,document, setInterval
from pyodide.ffi import create_proxy

class Game():
    def __init__(self):
        self.board = document.getElementById("board")
        self.pixels = []
        self.amount = 25
        self.speed=1
        self.direction = ""
        self.border = 1
        self.head_pixel = None
        document.addEventListener("keydown", create_proxy(self.handle_arrow_key))
        setInterval(create_proxy(self.update), 500/self.speed)  # Snake moves every 500 milliseconds
        self.create_grid()
        self.startup()

    def create_grid(self):
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
                cell.style.border = f"{self.border}px solid #666"
                cell.style.boxSizing = "border-box"
                self.board.appendChild(cell)
                self.pixels.append(cell)
    def middle_add(self,middle,rowChange,colChange):
        return((middle[0]+rowChange,middle[1]+colChange))
    def startup(self):
        middle_addition = 0.5 if self.amount % 2 == 1 else 0
        middle = (int((self.amount/ 2) + middle_addition)-1,int((self.amount/ 2) + middle_addition)-1) 
        
        start_snake = [middle,self.middle_add(middle,1,0),self.middle_add(middle,2,0)]
        for pixel in self.pixels:
            pixel.style.backgroundColor = "#000"
            pixel.style.color = "#000"
            pixel.style.border = f"{self.border}px solid #666"
            pixel.style.boxSizing = "border-box"
            pixel.style.cursor = "pointer"
            row, col = map(int, pixel.id.split('ffff'))
            if (row,col) == start_snake[0]:
                pixel.style.backgroundColor = "green"
                pixel.id = f"{row}ffff{col}head"
                self.head_pixel = pixel

            elif (row,col) in start_snake:
                pixel.style.backgroundColor = "green"
                pixel.id = f"{row}ffff{col}body"

    def handle_arrow_key(self, event):
        key = event.keyCode
        if key == 37:
            self.direction = "left"
        elif key == 38:
            self.direction = "up"
        elif key == 39:
            self.direction = "right"
        elif key == 40:
            self.direction = "down"

    def update(self):
        if self.direction and self.head_pixel:
            self.move_snake()

    def move_snake(self):
        l=self.head_pixel.id.split('ffff')
        l2=l[1].split('head')[0]
        l2=l2.split('body')[0]
        row, col = int(l[0]), int(l2)
        new_head_row, new_head_col = row, col

        if self.direction == "left":
            new_head_col -= 1
        elif self.direction == "right":
            new_head_col += 1
        elif self.direction == "up":
            new_head_row -= 1
        elif self.direction == "down":
            new_head_row += 1
        #console.log(0 <= new_head_row < self.amount and 0 <= new_head_col < self.amount)
        if 0 <= new_head_row < self.amount and 0 <= new_head_col < self.amount:
            new_head_id = new_head_row * self.amount + new_head_col
            new_head_pixel = self.pixels[new_head_id]

            self.head_pixel.style.backgroundColor = "#000"
            new_head_pixel.style.backgroundColor = "green"
            self.head_pixel = new_head_pixel
        

def main():
    g = Game()

if __name__ == "__main__":
    main()
