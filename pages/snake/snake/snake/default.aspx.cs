using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Threading;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace YourNamespace
{
    public partial class _Default : System.Web.UI.Page
    {
        List<Button> squares = new List<Button>();
        int count;
        bool botFirst = false;
        bool won = false;
        public Color color = Color.Blue;
        protected void Page_Load(object sender, EventArgs e)
        {
            reset.Click += restart;
            //computerFirst.Click += computerFirstClick;
            getSquares(this);
            if (squares[3].Text == "")
            {
                InitButtons();
            }
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                if (button.ForeColor == Color.Red) return;

            }
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;

                button.Click += click;
            }


        }
        private void computerFirstClick(object sender, EventArgs e)
        {
            botFirst = true;
            computerClick(botFirst);
        }
        private void InitButtons()
        {
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;

                button.Text = 'x'.ToString();
                button.ForeColor = Color.Transparent;
            }
        }
        private void addText(Button b, int row, int col, bool player)
        {
            b.ForeColor = Color.Black;
            string current = b.Text;
            string other = (current == "x") ? "o" : "x";
            squares.Clear();
            getSquares(this);
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                if (button.ForeColor == Color.Transparent) button.Text = other;

            }
            if (CheckForWin(current)) return;
            if (checkDraw()) { restart(null, null); return; }
            if (player) computerClick(botFirst);
        }
        private string[,] getBoard()
        {
            string[,] b = new string[3, 3];
            b[0, 0] = b1.Text;
            b[0, 1] = b2.Text;
            b[0, 2] = b3.Text;
            b[1, 0] = b4.Text;
            b[1, 1] = b5.Text;
            b[1, 2] = b6.Text;
            b[2, 0] = b7.Text;
            b[2, 1] = b8.Text;
            b[2, 2] = b9.Text;
            return b;
        }
        private void click(object sender, EventArgs e)
        {
            Button s = (Button)sender;
            int place = Int32.Parse(s.ID[1].ToString());
            place -= 1;
            int row = place / 3;
            int col = (place % 3);
            if (s.ForeColor != Color.Transparent) return;
            addText(s, row, col, true);






        }
        private void getSquares(Control parentControl)
        {
            foreach (Control control in parentControl.Controls)
            {
                if (control is Button)
                {
                    squares.Add((Button)control);

                }
                if (control.HasControls())
                {
                    getSquares(control);
                }
            }
        }
        private void restart(object sender, EventArgs e)
        {
            botFirst = false;
            count = 0;
            won = false;
            squares.Clear();
            getSquares(this);
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                button.Text = "x";
                button.ForeColor = Color.Transparent;


            }
        }
        private bool CheckForWin(string current, bool highlight = true)
        {

            string[,] board = getBoard();
            for (int i = 0; i < 3; i++)
            {
                if ((board[i, 0] == current && (squares[i * 3].ForeColor == Color.Black || squares[i * 3].ForeColor == color)) &&
                    (board[i, 1] == current && (squares[i * 3 + 1].ForeColor == Color.Black || squares[i * 3 + 1].ForeColor == color)) &&
                    (board[i, 2] == current && (squares[i * 3 + 2].ForeColor == Color.Black || squares[i * 3 + 2].ForeColor == color)))
                {
                    if (highlight) HighlightWinningCells(i * 3, i * 3 + 1, i * 3 + 2);
                    return true;
                }

                if ((board[0, i] == current && (squares[i].ForeColor == Color.Black || squares[i].ForeColor == color)) &&
                    (board[1, i] == current && (squares[i + 3].ForeColor == Color.Black || squares[i + 3].ForeColor == color)) &&
                    (board[2, i] == current && (squares[i + 6].ForeColor == Color.Black || squares[i + 6].ForeColor == color)))
                {
                    if (highlight) HighlightWinningCells(i, i + 3, i + 6);
                    return true;
                }
            }
            if ((board[0, 0] == current && (squares[0].ForeColor == Color.Black || squares[0].ForeColor == color)) &&
                    (board[1, 1] == current && (squares[4].ForeColor == Color.Black || squares[4].ForeColor == color)) &&
                    (board[2, 2] == current && (squares[8].ForeColor == Color.Black || squares[8].ForeColor == color)))
            {
                if (highlight) HighlightWinningCells(0, 4, 8);
                return true;
            }
            if ((board[0, 2] == current && (squares[2].ForeColor == Color.Black || squares[2].ForeColor == color)) &&
                (board[1, 1] == current && (squares[4].ForeColor == Color.Black || squares[4].ForeColor == color)) &&
                (board[2, 0] == current && (squares[6].ForeColor == Color.Black || squares[6].ForeColor == color)))
            {
                if (highlight) HighlightWinningCells(2, 4, 6);
                return true;
            }

            return false;
        }
        private void computerClick(bool first)
        {

            int bestScore = -800;
            int bestMove = 0;
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                if (button.ForeColor == Color.Black) continue;
                button.ForeColor = color;
                string current = button.Text;
                string other = (current == "x") ? "o" : "x";
                foreach (Button b in squares)
                {
                    if (b.ID.Length > 2) continue;
                    if (b.ForeColor == Color.Transparent) b.Text = other;

                }
                int score = minimax(false, 0);
                foreach (Button b in squares)
                {
                    if (b.ID.Length > 2) continue;
                    if (b.ForeColor == Color.Transparent) b.Text = current;

                }
                button.ForeColor = Color.Transparent;
                bestMove = (score > bestScore) ? Int32.Parse(button.ID[1].ToString()) : bestMove;
                bestScore = (score > bestScore) ? score : bestScore;

            }
            bestMove -= 1;
            int row = bestMove / 3;
            int col = (bestMove % 3);
            addText(squares[bestMove], row, col, false);
            return;

        }
        private bool checkDraw()
        {
            foreach (Button button in squares)
            {
                if (button.ForeColor == Color.Transparent) return false;

            }
            return true;
        }
        private int minimax(bool isMax, int depth)
        {
            if (CheckForWin("x", false))
            {
                return -1;
            }
            if (CheckForWin("o", false))
            {
                return 1;
            }
            if (checkDraw())
            {
                return 0;
            }
            if (isMax)
            {
                int bestScore = -800;
                foreach (Button button in squares)
                {
                    if (button.ID.Length > 2) continue;
                    if (button.ForeColor == Color.Black) continue;
                    if (button.ForeColor == color) continue;
                    button.ForeColor = color;
                    string current = button.Text;
                    string other = (current == "x") ? "o" : "x";
                    foreach (Button b in squares)
                    {
                        if (b.ID.Length > 2) continue;
                        if (b.ForeColor == Color.Transparent) b.Text = other;

                    }
                    int score = minimax(false, depth + 1);

                    foreach (Button b in squares)
                    {
                        if (b.ID.Length > 2) continue;
                        if (b.ForeColor == Color.Transparent) b.Text = current;

                    }
                    button.ForeColor = Color.Transparent;
                    bestScore = (score > bestScore) ? score : bestScore;

                }
                return bestScore;
            }
            else
            {
                int bestScore = 800;
                foreach (Button button in squares)
                {
                    if (button.ID.Length > 2) continue;
                    if (button.ForeColor == Color.Black) continue;
                    if (button.ForeColor == color) continue;
                    button.ForeColor = color;
                    string current = button.Text;
                    string other = (current == "x") ? "o" : "x";
                    foreach (Button b in squares)
                    {
                        if (b.ID.Length > 2) continue;
                        if (b.ForeColor == Color.Transparent) b.Text = other;

                    }
                    int score = minimax(true, depth + 1);
                    foreach (Button b in squares)
                    {
                        if (b.ID.Length > 2) continue;
                        if (b.ForeColor == Color.Transparent) b.Text = current;

                    }
                    button.ForeColor = Color.Transparent;
                    bestScore = (score < bestScore) ? score : bestScore;

                }
                return bestScore;
            }
        }
        private void HighlightWinningCells(params int[] cellIndices)
        {
            foreach (int index in cellIndices)
            {
                squares[index].ForeColor = Color.Red;
            }
        }

    }
}
