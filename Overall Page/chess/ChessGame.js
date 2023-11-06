
class ChessGame {
    constructor(boardState) {
        this.boardState = boardState;
        this.board = [];
        this.allBoardPositions = [];
        this.piecesPos = {};
        this.imageSquares = [];
        this.clicks = 0;
        this.moveNumber = 0
        this.legalMoves = [];
        this.clickedPiece;
        this.clickedSqr;
        this.secondClickSqr;
        this.turn;
        this.inCheck = false;
        this.navbar = {
            forward: document.getElementById("forward"),
            back: document.getElementById("backward"),
            reset: document.getElementById("reset"),
            test: document.getElementById("test"),
            board: document.getElementById("board"),
        }
        this.startingSqrRooks = {
            w: ["a1", "h1"],
            b: ["a8", "h8"]
        };
        this.startingSqrKings = {
            w: "e1",
            b: "e8"
        };
        this.lookingAt = 0;
        this.allBishopMoves = {};
        this.bishopLegalMoves();
        this.mouseDownFuc;
        this.draggingInfo = {
            isDragging: true,
            offsetX: 0,
            offsetY: 0,
            initialPosition: { x: 0, y: 0 }
        };
        this.initBoard();
        this.renderBoard();
        this.updateBoard();
        this.resetButton();
        this.forwardButton();
        this.backButton();
        this.testButton();
        this.boardButton();
    }
    addBoardToAllList() {
        const fen = this.dictToFen(this.piecesPos)
        this.allBoardPositions.push(fen);
    }
    bishopLegalMoves() {
        for (let file = 'a'.charCodeAt(0); file <= 'h'.charCodeAt(0); file++) {
            for (let rank = 1; rank <= 8; rank++) {
                const square = String.fromCharCode(file) + rank;
                this.allBishopMoves[square] = {
                    ne: [],
                    se: [],
                    sw: [],
                    nw: []
                };
                for (let i = 1; i <= 7; i++) {
                    if (file + i <= 'h'.charCodeAt(0) && rank + i <= 8) {
                        this.allBishopMoves[square].ne.push(String.fromCharCode(file + i) + (rank + i));
                    }
                    if (file + i <= 'h'.charCodeAt(0) && rank - i >= 1) {
                        this.allBishopMoves[square].se.push(String.fromCharCode(file + i) + (rank - i));
                    }
                    if (file - i >= 'a'.charCodeAt(0) && rank - i >= 1) {
                        this.allBishopMoves[square].sw.push(String.fromCharCode(file - i) + (rank - i));
                    }
                    if (file - i >= 'a'.charCodeAt(0) && rank + i <= 8) {
                        this.allBishopMoves[square].nw.push(String.fromCharCode(file - i) + (rank + i));
                    }
                }
            }
        }
    }
    initBoard() {
        this.turn = 'w'
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        this.setupStartingPosition();
    }
    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        for (let row = 1; row < 9; row++) {
            for (let col = 1; col < 9; col++) {
                const square = document.createElement('div');
                square.dataset.row = row;
                square.dataset.col = col;
                square.style.border = 0;
                square.id = `${String.fromCharCode(96 + col)}${9 - row}`;
                if (this.isOdd(row + col)) square.className = 'black';
                else square.className = 'white';
                square.style.userSelect = "none";
                square.textContent = this.board[row - 1][col - 1] || '';
                chessboard.appendChild(square);
            }
        }
        this.addPieces();
    }
    addPieces(past = false) {
        const chessboard = document.getElementById('chessboard');
        const squares = Array.from(chessboard.children);
        const pieceImages = {
            'wrook': 'img/white-rook.png',
            'wknight': 'img/white-knight.png',
            'wbishop': 'img/white-bishop.png',
            'wqueen': 'img/white-queen.png',
            'wking': 'img/white-king.png',
            'wpawn': 'img/white-pawn.png',
            'brook': 'img/black-rook.png',
            'bknight': 'img/black-knight.png',
            'bbishop': 'img/black-bishop.png',
            'bqueen': 'img/black-queen.png',
            'bking': 'img/black-king.png',
            'bpawn': 'img/black-pawn.png',
        };
        const bottomSquares = new Array();
        squares.forEach((sqr) => {
            if (sqr.className === "images") chessboard.removeChild(sqr);
            else bottomSquares.push(sqr);
        });
        bottomSquares.forEach((sqr) => {
            const newSqr = document.createElement("div");
            chessboard.appendChild(newSqr);
            const rect = sqr.getBoundingClientRect();
            newSqr.className = "images";
            newSqr.id = sqr.id + "Piece";
            newSqr.style.position = "fixed";
            newSqr.style.top = rect.top + "px";
            newSqr.style.left = rect.left + "px";
            newSqr.style.width = rect.width + "px";
            newSqr.style.height = rect.height + "px";
            newSqr.style.backgroundColor = "";

            if (this.getPieceAtPosition(sqr.id)) {
                newSqr.style.backgroundImage = `url(${pieceImages[this.getPieceAtPosition(sqr.id)]})`;
                if (this.getPieceAtPosition(sqr.id).includes("wpawn")) newSqr.style.backgroundImage = `url(${pieceImages["wpawn"]})`;
                if (this.getPieceAtPosition(sqr.id).includes("bpawn")) newSqr.style.backgroundImage = `url(${pieceImages["bpawn"]})`;
            } else {
                newSqr.style.backgroundImage = "";
            }
            newSqr.style.backgroundSize = "cover";
            this.imageSquares.push(newSqr);
            if (!past) this.draggingEnable(newSqr);
        });
    }
    removeDragger(sqr) {
        const newElement = sqr.cloneNode(true);
        sqr.parentNode.replaceChild(newElement, sqr);
    }
    draggingEnable(sqr) {
        const box=document.getElementById("centered-box").getBoundingClientRect();
        const a = this.getPieceAtPosition(sqr.id.substring(0, 2))
        if (a === null) return;
        this.mouseDownFuc = (e) => {
            if (!this.getPieceAtPosition(sqr.id.substring(0, 2))) return;
            if (!this.getPieceAtPosition(sqr.id.substring(0, 2))[0] === this.turn) return;
            this.draggingInfo.isDragging = true;
            const boundingBox = sqr.getBoundingClientRect();
            const divWidth = boundingBox.width;
            const divHeight = boundingBox.height;
            this.draggingInfo.initialPosition = { x: boundingBox.left + divWidth / 2, y: boundingBox.top + divHeight / 2 };
            this.draggingInfo.offsetX = divWidth / 2;
            this.draggingInfo.offsetY = divHeight / 2;
            sqr.style.position = 'absolute';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            const offsetX = divWidth / 2;
            const offsetY = divHeight / 2;
            sqr.style.left = (e.clientX - offsetX)-box.left + 'px';
            sqr.style.top = (e.clientY - offsetY)-box.top + 'px';
            sqr.style.zIndex = 1
            this.onSquareDown(sqr);
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            
            if (this.draggingInfo.isDragging) {
                sqr.style.left = e.clientX - this.draggingInfo.offsetX-box.left + 'px';
                sqr.style.top = e.clientY - this.draggingInfo.offsetY-box.top + 'px';
            } else sqr.style.zIndex = 0;
        };
        const onMouseUp = (e) => {
            if (this.draggingInfo.isDragging) {
                this.draggingInfo.isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (!isValidDrop(e.clientX, e.clientY)) {
                    sqr.style.left = this.draggingInfo.initialPosition.x -box.left-this.draggingInfo.offsetX + 'px';
                    sqr.style.top = this.draggingInfo.initialPosition.y-box.top - this.draggingInfo.offsetY + 'px';
                }
                const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
                this.onSquareUp(elementUnderMouse)
            }
        };
        const isValidDrop = (x, y) => {
            return false;
        };
        if ((a[0] === this.turn)) sqr.addEventListener('mousedown', this.mouseDownFuc);
        if (!(a[0] === this.turn)) this.removeDragger(sqr);
    }
    setupStartingPosition() {
        this.setPiecePosition("wrook", "a1");
        this.setPiecePosition("wknight", "b1");
        this.setPiecePosition("wbishop", "c1");
        this.setPiecePosition("wqueen", "d1");
        this.setPiecePosition("wking", "e1");
        this.setPiecePosition("wbishop", "f1");
        this.setPiecePosition("wknight", "g1");
        this.setPiecePosition("wrook", "h1");
        this.setPiecePosition("brook", "a8");
        this.setPiecePosition("brook", "h8");
        this.setPiecePosition("bknight", "b8");
        this.setPiecePosition("bknight", "g8");
        this.setPiecePosition("bbishop", "c8");
        this.setPiecePosition("bbishop", "f8");
        this.setPiecePosition("bqueen", "d8");
        this.setPiecePosition("bking", "e8");
        const alphabet = "abcdefgh";
        for (let col = 1; col <= 8; col++) {
            this.setPiecePosition("wpawn" + `${col}`, `${alphabet[col - 1]}2`);
        }
        for (let col = 1; col <= 8; col++) {
            this.setPiecePosition("bpawn" + `${col}`, `${alphabet[col - 1]}7`);
        }
        for (let row = 3; row <= 6; row++) {
            for (let col = 1; col <= 8; col++) {
                this.setPiecePosition(null, `${alphabet[col - 1]}${row}`);
            }
        }
        this.addBoardToAllList();
    }
    isOdd(n) {
        if (n % 2 === 0) return false
        return true
    }
    setPiecePosition(piece, id) {
        const [col, row] = this.idToGrid(id);
        this.piecesPos[((row - 1) * 8 + col)] = piece;
    }
    getPieceAtPosition(id) {
        const [col, row] = this.idToGrid(id);
        return this.piecesPos[((row - 1) * 8 + col)];
    }
    idToGrid(id) {
        const col = id[0].toLowerCase().charCodeAt(0) - 96;
        const row = parseInt(id[1]);
        return [col, row];
    }
    idToDict(id) {
        const [col, row] = this.idToGrid(id);
        return ((row - 1) * 8 + col)
    }
    dictToId(number) {
        const row = Math.floor((number - 1) / 8) + 1;
        const col = (number - 1) % 8 + 1;
        return `${String.fromCharCode(96 + col)}${row}`;
    }
    fenToDict(fen) {
        const pieceSymbols = {
            'K': 'wking',
            'Q': 'wqueen',
            'R': 'wrook',
            'B': 'wbishop',
            'N': 'wknight',
            'P': 'wpawn',
            'k': 'bking',
            'q': 'bqueen',
            'r': 'brook',
            'b': 'bbishop',
            'n': 'bknight',
            'p': 'bpawn',
            '.': null,
        };
        const parts = fen.split(' ');
        const position = parts[0];
        const rows = position.split('/');
        const chessboard = {};
        const currentPlayerTurn = parts[1] === 'w' ? 'w' : 'b';
        let wpawnCounter = 1;
        let bpawnCounter = 1;
        for (let row = 7; row >= 0; row--) {
            const rowFEN = rows[7 - row];
            let col = 0;
            for (let i = 0; i < rowFEN.length; i++) {
                const char = rowFEN.charAt(i);
                if (char >= '1' && char <= '8') {
                    const emptySquares = parseInt(char, 10);
                    for (let j = 0; j < emptySquares; j++) {
                        col++;
                        chessboard[row * 8 + col] = null;
                    }
                } else {
                    const piece = pieceSymbols[char];
                    if (piece) {
                        col++;
                        if (piece === 'wpawn') {
                            chessboard[row * 8 + col] = piece + wpawnCounter;
                            wpawnCounter++;
                        } else if (piece === 'bpawn') {
                            chessboard[row * 8 + col] = piece + bpawnCounter;
                            bpawnCounter++;
                        } else {
                            chessboard[row * 8 + col] = piece;
                        }
                    }
                }
            }
        }
        this.turn = currentPlayerTurn;
        return chessboard;
    }
    dictToFen(chessboard) {
        const pieceSymbols = {
            'wking': 'K',
            'wqueen': 'Q',
            'wrook': 'R',
            'wbishop': 'B',
            'wknight': 'N',
            'wpawn1': 'P',
            'wpawn2': 'P',
            'wpawn3': 'P',
            'wpawn4': 'P',
            'wpawn5': 'P',
            'wpawn6': 'P',
            'wpawn7': 'P',
            'wpawn8': 'P',
            'bking': 'k',
            'bqueen': 'q',
            'brook': 'r',
            'bbishop': 'b',
            'bknight': 'n',
            'bpawn1': 'p',
            'bpawn2': 'p',
            'bpawn3': 'p',
            'bpawn4': 'p',
            'bpawn5': 'p',
            'bpawn6': 'p',
            'bpawn7': 'p',
            'bpawn8': 'p',
            null: '.',
        };
        let fen = '';
        for (let row = 7; row >= 0; row--) {
            let emptySquares = 0;
            for (let col = 0; col < 8; col++) {
                const piece = chessboard[row * 8 + col + 1];
                if (piece === null) {
                    emptySquares++;
                } else {
                    if (emptySquares > 0) {
                        fen += emptySquares;
                        emptySquares = 0;
                    }
                    fen += pieceSymbols[piece];
                }
            }
            if (emptySquares > 0) {
                fen += emptySquares;
            }
            if (row > 0) {
                fen += '/';
            }
        }
        fen += ` ${this.turn}`
        let castling = '';
        if (this.startingSqrKings.w === 'e1' && this.startingSqrRooks.w.includes('a1') && this.startingSqrRooks.w.includes('h1')) {
            castling += 'KQ';
        } else {
            if (this.startingSqrKings.w === 'e1' && this.startingSqrRooks.w.includes('h1')) {
                castling += 'K';
            }
            if (this.startingSqrKings.w === 'e1' && this.startingSqrRooks.w.includes('a1')) {
                castling += 'Q';
            }
        }
        if (this.startingSqrKings.b === 'e8' && this.startingSqrRooks.b.includes('a8') && this.startingSqrRooks.b.includes('h8')) {
            castling += 'kq';
        } else {
            if (this.startingSqrKings.b === 'e8' && this.startingSqrRooks.b.includes('h8')) {
                castling += 'k';
            }
            if (this.startingSqrKings.b === 'e8' && this.startingSqrRooks.b.includes('a8')) {
                castling += 'q';
            }
        }
        fen += ` ${castling}`;
        fen += ' - 0 1';
        return fen;
    }
    valueToCNotation(notation) {
        const pieceMap = {
            'bking': 'K',
            'wking': 'k',
            'bqueen': 'Q',
            'wqueen': 'q',
            'brook': 'R',
            'wrook': 'r',
            'bknight': 'N',
            'wknight': 'n',
            'bbishop': 'B',
            'wbishop': 'b',
        };
        if (!notation) return "";
        if (notation.includes('wpawn')) return "p";
        if (notation.includes('bpawn')) return "P";
        return pieceMap[notation];
    }
    updateBoard() {
        for (const key in this.piecesPos) {
            const sqr = document.getElementById(this.dictToId(key));
            sqr.style.textAlign = "center";
            sqr.style.color = "black";
            const piece = this.piecesPos[key]
            switch (this.boardState) {
                case 0:
                    break;
                case 1:
                    sqr.innerText = this.valueToCNotation(piece);
                    break;
                case 2:
                    sqr.innerText = key;
                    break
                default:
                    sqr.innerText = this.valueToCNotation(piece);
                    break;
            }
            if (!this.inCheck) this.removeChildren(sqr)
        }
        const squares = Array.from(chessboard.children);
        const pieceImages = {
            'wrook': 'img/white-rook.png',
            'wknight': 'img/white-knight.png',
            'wbishop': 'img/white-bishop.png',
            'wqueen': 'img/white-queen.png',
            'wking': 'img/white-king.png',
            'wpawn': 'img/white-pawn.png',
            'brook': 'img/black-rook.png',
            'bknight': 'img/black-knight.png',
            'bbishop': 'img/black-bishop.png',
            'bqueen': 'img/black-queen.png',
            'bking': 'img/black-king.png',
            'bpawn': 'img/black-pawn.png',
        };
        squares.forEach((sqr) => {
            if (sqr.id.length === 2) return;
            else if (this.getPieceAtPosition(sqr.id.substring(0, 2))) {
                sqr.style.backgroundImage = `url(${pieceImages[this.getPieceAtPosition(sqr.id)]})`;
                if (this.getPieceAtPosition(sqr.id).includes("wpawn")) sqr.style.backgroundImage = `url(${pieceImages["wpawn"]})`;
                if (this.getPieceAtPosition(sqr.id).includes("bpawn")) sqr.style.backgroundImage = `url(${pieceImages["bpawn"]})`;
            } else {
                sqr.style.backgroundImage = "";
            }
        });
    }
    removeChildren(sqr) {
        while (sqr.firstChild) {
            if (sqr.firstChild.id === "check" && this.inCheck === true) return;
            sqr.removeChild(sqr.firstChild);
        }
    }
    updateDrag(past = false) {
        const squares = Array.from(chessboard.children);
        squares.forEach((sqr) => {
            if (sqr.id.length === 2) return;
            if (!past) this.draggingEnable(sqr);
            if (past) this.removeDragger(sqr);
        });
    }
    showLegalMoves(bool = false) {
        let moves = [];
        const position = this.idToDict(this.clickedSqr);
        if (this.clickedPiece.includes("pawn")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.pawn(this.piecesPos, position, white);
        }
        if (this.clickedPiece.includes("knight")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.knight(this.piecesPos, position, white);
        }
        if (this.clickedPiece.includes("bishop")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.bishop(this.piecesPos, position, white);
        }
        if (this.clickedPiece.includes("rook")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.rook(this.piecesPos, position, white);
        }
        if (this.clickedPiece.includes("queen")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.queen(this.piecesPos, position, white);
        }
        if (this.clickedPiece.includes("king")) {
            const white = (this.clickedPiece[0] === 'w') ? true : false;
            moves = this.king(this.piecesPos, position, white);
        }
        moves.forEach(move => {
            if (bool === false) {
                const sqr = document.getElementById(this.dictToId(move));
                this.addTintToDiv(sqr);
            }
        });
    }
    addTintToDiv(divToTint, tintColour = "rgba(0,0,0,.4)", borderRadius = "50%", full = false, id = null) {
        const tintDiv = document.createElement("div");
        tintDiv.className = "tint-overlay";
        if (id) tintDiv.id = id;
        tintDiv.style.borderRadius = borderRadius;
        tintDiv.style.position = "relative";
        tintDiv.style.textAlign = "center";
        tintDiv.style.backgroundColor = tintColour
        if (full) {
            tintDiv.style.left = "0px";
            tintDiv.style.top = "0px";
            tintDiv.style.width = "12.5%";
            tintDiv.style.height = "12.5%";
        } else {
            tintDiv.style.left = "20px";
            tintDiv.style.top = "20px";
            tintDiv.style.width = "20px";
            tintDiv.style.height = "20px";
        }
        tintDiv.style.pointerEvents = "none";
        divToTint.appendChild(tintDiv);
    }
    onSquareDown(square) {
        this.testerFunc();
        const id = square.id.substring(0, 2);
        if (!this.getPieceAtPosition(id)) return;
        this.clickedPiece = this.getPieceAtPosition(id);
        this.clickedSqr = id;
        if (!(this.turn === this.getPieceAtPosition(this.clickedSqr)[0])) {
            return;
        }
        this.showLegalMoves();
        this.clicks = 1;
    }
    onSquareUp(square) {
        this.testerFunc();
        if (!square) return;
        const id = square.id.substring(0, 2);
        this.secondClickSqr = id;
        if (!this.checkMove(id, this.clickedSqr)) {
            this.clicks = 0;
            this.updateBoard()
            return;
        }
        this.setPiecePosition(this.clickedPiece, this.secondClickSqr);
        this.setPiecePosition(null, this.clickedSqr);
        if (this.clickedPiece === "wking") this.startingSqrKings.w = "";
        if (this.clickedPiece === "bking") this.startingSqrKings.b = "";
        if (this.clickedPiece === "wrook") this.startingSqrRooks.w.pop(this.clickedSqr);
        if (this.clickedPiece === "brook") this.startingSqrRooks.b.pop(this.clickedSqr);
        this.moveRooksIfCastled();
        this.updateBoard();
        const a = (this.turn === "w") ? true : false;
        this.isCheck(a);
        this.turn = (this.turn === 'w') ? 'b' : 'w';
        this.updateDrag();
        this.clicks = 0;
        this.moveNumber += 1;
        this.lookingAt += 1;
        this.addBoardToAllList();
    }
    moveRooksIfCastled() {
        if (this.clickedPiece === "wking" && this.secondClickSqr === "g1") {
            this.setPiecePosition("wrook", "f1");
            this.setPiecePosition(null, "h1");
        };
        if (this.clickedPiece === "bking" && this.secondClickSqr === "g8") {
            this.setPiecePosition("brook", "f8");
            this.setPiecePosition(null, "h8");
        };
        if (this.clickedPiece === "wking" && this.secondClickSqr === "c1") {
            this.setPiecePosition("wrook", "d1");
            this.setPiecePosition(null, "a1");
        };
        if (this.clickedPiece === "bking" && this.secondClickSqr === "c8") {
            this.setPiecePosition("brook", "d8");
            this.setPiecePosition(null, "a8");
        };
    }
    checkMove(secondClickedSqr, clickedSqr) {
        const clickedPiece = this.getPieceAtPosition(clickedSqr);
        const secondSqr = this.idToDict(secondClickedSqr);
        const position = this.idToDict(clickedSqr);
        if (clickedPiece.includes("pawn")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.pawn(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        if (clickedPiece.includes("knight")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.knight(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        if (clickedPiece.includes("bishop")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.bishop(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        if (clickedPiece.includes("rook")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.rook(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        if (clickedPiece.includes("queen")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.queen(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        if (clickedPiece.includes("king")) {
            const white = (clickedPiece[0] === 'w') ? true : false;
            const moves = this.king(this.piecesPos, position, white);
            if (!moves.includes(secondSqr)) return false;
        }
        return true;
    }
    pawn(b, position, white) {
        let legal = [];
        const up = (white) ? 8 : -8;
        const left = up - 1;
        const right = up + 1;
        let takeleft = false;
        let takeright = false;
        if (b[position + left]) takeleft = (white) ? b[position + left][0] === 'b' : b[position + left][0] === 'w';
        if (b[position + right]) takeright = (white) ? b[position + right][0] === 'b' : b[position + right][0] === 'w';
        if (takeleft) legal.push(position + left);
        if (takeright) legal.push(position + right);
        if (b[position + up] === null) legal.push(position + up);
        else return legal;
        if (b[position + 2 * up] === null) {
            const double = (white) ? Math.floor((position - 1) / 8) === 1 : Math.floor((position - 1) / 8) === 6;
            if (double) legal.push(position + 2 * up);
        }
        return legal;
    }
    rook(b, position, white) {
        let legal = [];
        let up = [];
        let down = [];
        let left = [];
        let right = [];
        let pseudoLegal = [up, down, left, right];
        let move = position;
        while (move < 64) { up.push(move); move += 8; }
        move = position;
        while (move > 0) { down.push(move); move -= 8; }
        let leftend = Math.floor((position - 1) / 8) * 8 + 1;
        let rightend = (1 + Math.floor((position - 1) / 8)) * 8;
        move = position;
        while (move >= leftend) { left.push(move); move -= 1; }
        move = position;
        while (move <= rightend) { right.push(move); move += 1; }
        up.splice(up.indexOf(position), 1);
        down.splice(down.indexOf(position), 1);
        left.splice(left.indexOf(position), 1);
        right.splice(right.indexOf(position), 1);
        for (let array in pseudoLegal) {
            array = pseudoLegal[array];
            for (let pos in array) {
                pos = array[pos];
                if (!b[pos]) { legal.push(pos); continue; }
                const takeable = (white) ? b[pos][0] === 'b' : b[pos][0] === 'w';
                if (takeable) { legal.push(pos); break; }
                const stop = (white) ? b[pos][0] === 'w' : b[pos][0] === 'b';
                if (stop) break;
            }
        }
        return legal
    }
    bishop(b, position, white) {
        let legal = [];
        const sqr = this.dictToId(position);
        const pseudoLegal = [
            `${this.allBishopMoves[sqr].ne}`,
            `${this.allBishopMoves[sqr].se}`,
            `${this.allBishopMoves[sqr].sw}`,
            `${this.allBishopMoves[sqr].nw}`
        ]
        for (let array of pseudoLegal) {
            array = array.split(",");
            for (let pos of array) {
                if (!pos) break;
                pos = this.idToDict(pos);
                if (!b[pos]) { legal.push(pos); continue; }
                const takeable = (white) ? b[pos][0] === 'b' : b[pos][0] === 'w';
                if (takeable) { legal.push(pos); break; }
                const stop = (white) ? b[pos][0] === 'w' : b[pos][0] === 'b';
                if (stop) break;
            }
        }
        return legal;
    }
    knight(b, position, white) {
        const legal = [];
        const moves = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (const move of moves) {
            const destination = position + move;
            if (
                destination >= 1 &&
                destination <= 64 &&
                Math.abs((destination - 1) % 8 - (position - 1) % 8) <= 2
            ) {
                if (!b[destination] || (white ? b[destination][0] === 'b' : b[destination][0] === 'w')) {
                    legal.push(destination);
                }
            }
        }
        return legal;
    }
    queen(b, position, white) {
        const legal = [];
        const pseudoLegal = [];
        const rookMoves = this.rook(b, position, white);
        const bishopMoves = this.bishop(b, position, white);
        pseudoLegal.push(...rookMoves, ...bishopMoves);
        for (const move of pseudoLegal) {
            if (!b[move]) {
                legal.push(move);
            } else {
                const takeable = white ? b[move][0] === 'b' : b[move][0] === 'w';
                if (takeable) {
                    legal.push(move);
                }
            }
        }
        return legal;
    }
    king(b, position, white) {
        const legal = [];
        const moves = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (const move of moves) {
            const destination = position + move;
            if (
                destination >= 1 &&
                destination <= 64 &&
                Math.abs((destination - 1) % 8 - (position - 1) % 8) <= 1
            ) {
                if (!b[destination] || (white ? b[destination][0] === 'b' : b[destination][0] === 'w')) {
                    legal.push(destination);
                }
            }
        }
        const sqr = this.dictToId(position);
        const inStartPosition = (white) ? sqr === "e1" : sqr === "e8";
        const _kingMoved = (white) ? this.startingSqrKings.w.includes("e1") : this.startingSqrKings.b.includes("e8");
        const _ArookMoved = (white) ? this.startingSqrRooks.w.includes("a1") : this.startingSqrRooks.b.includes("a8");
        const _HrookMoved = (white) ? this.startingSqrRooks.w.includes("h1") : this.startingSqrRooks.b.includes("h8");
        const castleKingSide = (_kingMoved && _HrookMoved) ? true : false;
        const castleQueenSide = (_kingMoved && _ArookMoved) ? true : false;
        const BWpos = (white) ? 2 : 58;
        const queenSideEmpty = (!b[BWpos] && !b[BWpos + 1] && !b[BWpos + 2]) ? true : false;
        const kingSideEmpty = (!b[BWpos + 4] && !b[BWpos + 5]) ? true : false;
        if (castleKingSide && kingSideEmpty) legal.push(BWpos + 5);
        if (castleQueenSide && queenSideEmpty) legal.push(BWpos + 1);
        return legal;
    }
    findPositionByPiece(targetPiece) {
        const position = Object.keys(this.piecesPos);
        for (const pos in position) {
            if (this.piecesPos[pos] === targetPiece) {
                return pos;
            }
        }
    }
    isCheck(white, opponent = true) {
        this.inCheck = false;
        const squares = Object.keys(this.piecesPos);
        const kingPos = (white) ? this.findPositionByPiece("bking") : this.findPositionByPiece("wking");
        squares.forEach((key) => {
            const value = this.piecesPos[key];
            if (value === null) return;
            const checked = this.checkMove(this.dictToId(kingPos), this.dictToId(key))
            if (!checked) return;
            if (opponent) this.inCheck = true;
        });
        if (this.inCheck) {
            const king = document.getElementById(this.dictToId(kingPos));
            this.addTintToDiv(king, "rgba(191,0,0,0.7)", "0%", true, "check");
        } else {
            this.updateBoard();
        }
    }
    resetButton() {
        this.navbar.reset.addEventListener("click", button => {
            this.board = [];
            this.moveNumber = 0;
            this.allBoardPositions = [];
            this.piecesPos = {};
            this.imageSquares = [];
            this.clicks = 0;
            this.inCheck = false;
            this.legalMoves = [];
            this.clickedPiece;
            this.clickedSqr;
            this.lookingAt = 0;
            this.secondClickSqr;
            this.turn = 'w';
            this.navbar = {
                forward: document.getElementById("forward"),
                back: document.getElementById("backward"),
                reset: document.getElementById("reset"),
            }
            this.startingSqrRooks = {
                w: ["a1", "h1"],
                b: ["a8", "h8"]
            };
            this.startingSqrKings = {
                w: "e1",
                b: "e8"
            };
            this.allBishopMoves = {};
            this.bishopLegalMoves();
            this.mouseDownFuc;
            this.draggingInfo = {
                isDragging: true,
                offsetX: 0,
                offsetY: 0,
                initialPosition: { x: 0, y: 0 }
            };
            this.setupStartingPosition();
            this.addPieces();
            this.updateBoard();
        });
    }
    /**/backButton() {
        this.navbar.back.addEventListener("click", button => {
            if (this.lookingAt === 0) return;
            this.lookingAt -= 1;
            this.piecesPos = this.fenToDict(this.allBoardPositions[this.lookingAt]);
            this.updateBoard();
            this.isCheck(this.lookingAt % 2 !== 0);
            this.updateDrag(true);
        });
    }
    /**/forwardButton() {
        this.navbar.forward.addEventListener("click", button => {
            if (this.lookingAt === this.moveNumber) return;
            this.lookingAt += 1;
            this.piecesPos = this.fenToDict(this.allBoardPositions[this.lookingAt]);
            this.updateBoard();
            this.isCheck(this.lookingAt % 2 !== 0);
            if (this.lookingAt === this.moveNumber) this.updateDrag();
        });
    }
    testButton() {
        this.navbar.test.addEventListener("click", button => {
            console.clear();
        });
    }
    /**/boardButton() {
        this.navbar.board.addEventListener("click", button => {
            const fen = "r1b1R1k1/pp3ppp/8/8/2B5/1P6/P4PPP/R5K1 w  - 0 1"
            const fen2 = this.dictToFen(this.piecesPos);
            console.log(fen2);
            // this.piecesPos=this.fenToDict(fen);
            // this.updateBoard();
            // this.updateDrag(true);this.updateDrag()
        });
    }
    testerFunc() {
    }
}
export {
    ChessGame
}
