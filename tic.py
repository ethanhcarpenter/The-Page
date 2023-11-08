
board = [" " for _ in range(9)]
def check_win(board, player):
    win_patterns = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
    for pattern in win_patterns:
        if all(board[i] == player for i in pattern):
            return True
    return False
def isDraw(board):
    return " " not in board

# Minimax algorithm with alpha-beta pruning
def minimax(board, player, depth, alpha, beta):
    if check_win(board, "X"):
        return -1
    if check_win(board, "O"):
        return 1
    if isDraw(board):
        return 0

    if player == "O":
        bestScore = -float("inf")
        for i in range(len(board)):
            if board[i] == " ":
                board[i] = player
                score = minimax(board, "X", depth + 1, alpha, beta)
                board[i] = " "
                bestScore = max(score, bestScore)
                alpha = max(alpha, bestScore)
                if beta <= alpha:
                    break  # Alpha-beta pruning
        return bestScore
    else:
        bestScore = float("inf")
        for i in range(len(board)):
            if board[i] == " ":
                board[i] = player
                score = minimax(board, "O", depth + 1, alpha, beta)
                board[i] = " "
                bestScore = min(score, bestScore)
                beta = min(beta, bestScore)
                if beta <= alpha:
                    break  # Alpha-beta pruning
        return bestScore

# Function to make AI player's move
# Function to make AI player's move
# Function to make AI player's move
def aiMove(board):
    bestMove = -1
    bestScore = -float("inf")

    for i in range(len(board)):
        if board[i] == " ":
            board[i] = "O"
            score = minimax(board, "X", 0, -float("inf"), float("inf"))
            board[i] = " "
            if score > bestScore:
                bestScore = score
                bestMove = i

    board[bestMove] = "O"
