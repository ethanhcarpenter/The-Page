using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace YourNamespace
{
    public partial class _Default : System.Web.UI.Page
    {
        List<Button> squares = new List<Button>();
        int count;
        protected void Page_Load(object sender, EventArgs e)
        {
            reset.Click += restart;
            GetSquares(this);
            if (squares[3].Text == "")
            {
                InitButtons();
            }
            foreach (Button button in squares)
            {
                if(button.ID.Length > 2) continue;
                if (button.ForeColor==Color.Red) return;
                
            }
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;

                button.Click += click;
            }
            

        }

        private void InitButtons()
        {
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;

                button.Text = 'x'.ToString();
                button.ForeColor = System.Drawing.Color.Transparent;
            }
        }
        private void addText(Button b, int row, int col)
        {
            b.ForeColor = Color.Black;
            string current = b.Text;
            string other = (current == "x") ? "o" : "x";

            GetSquares(this);
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                if (button.ForeColor == Color.Transparent) button.Text = other;

            }
            if (CheckForWin())
            {
            }
            foreach (Button button in squares)
            {
                if (button.ForeColor == Color.Transparent) return;

            }
            restart(null, null);
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
            if (getBoard()[row, col] != "")
            {
                addText(s, row, col);

            }
            



        }
        private void GetSquares(Control parentControl)
        {
            foreach (Control control in parentControl.Controls)
            {
                if (control is Button)
                {
                    squares.Add((Button)control);
                }
                if (control.HasControls())
                {
                    GetSquares(control);
                }
            }
        }
        private void restart(object sender, EventArgs e)
        {
            GetSquares(this);
            foreach (Button button in squares)
            {
                if (button.ID.Length > 2) continue;
                button.Text = "x";
                button.ForeColor = Color.Transparent;


            }
        }
        private bool CheckForWin()
        {
            string[,] board = getBoard();

            // Check rows
            for (int i = 0; i < 3; i++)
            {
                bool win = true;
                for (int j = 0; j < 3; j++)
                {
                    if (board[i, j] != "x" || squares[i * 3 + j].ForeColor == Color.Transparent)
                    {
                        win = false;
                        break;
                    }
                }

                if (win)
                {
                    HighlightWinningCells(i * 3, i * 3 + 1, i * 3 + 2);
                    return true;
                }

                win = true;
                for (int j = 0; j < 3; j++)
                {
                    if (board[i, j] != "o" || squares[i * 3 + j].ForeColor == Color.Transparent)
                    {
                        win = false;
                        break;
                    }
                }

                if (win)
                {
                    HighlightWinningCells(i * 3, i * 3 + 1, i * 3 + 2);
                    return true;
                }
            }

            // Check columns
            for (int i = 0; i < 3; i++)
            {
                bool win = true;
                for (int j = 0; j < 3; j++)
                {
                    if (board[j, i] != "x" || squares[j * 3 + i].ForeColor == Color.Transparent)
                    {
                        win = false;
                        break;
                    }
                }

                if (win)
                {
                    HighlightWinningCells(i, i + 3, i + 6);
                    return true;
                }

                win = true;
                for (int j = 0; j < 3; j++)
                {
                    if (board[j, i] != "o" || squares[j * 3 + i].ForeColor == Color.Transparent)
                    {
                        win = false;
                        break;
                    }
                }

                if (win)
                {
                    HighlightWinningCells(i, i + 3, i + 6);
                    return true;
                }
            }

            // Check diagonals
            bool diagonalXWin = true;
            bool diagonalOWin = true;

            for (int i = 0; i < 3; i++)
            {
                if (board[i, i] != "x" || squares[i * 3 + i].ForeColor == Color.Transparent)
                {
                    diagonalXWin = false;
                }

                if (board[i, i] != "o" || squares[i * 3 + i].ForeColor == Color.Transparent)
                {
                    diagonalOWin = false;
                }
            }

            if (diagonalXWin)
            {
                HighlightWinningCells(0, 4, 8);
                return true;
            }

            if (diagonalOWin)
            {
                HighlightWinningCells(0, 4, 8);
                return true;
            }

            bool antiDiagonalXWin = true;
            bool antiDiagonalOWin = true;

            for (int i = 0; i < 3; i++)
            {
                if (board[i, 2 - i] != "x" || squares[i * 3 + (2 - i)].ForeColor == Color.Transparent)
                {
                    antiDiagonalXWin = false;
                }

                if (board[i, 2 - i] != "o" || squares[i * 3 + (2 - i)].ForeColor == Color.Transparent)
                {
                    antiDiagonalOWin = false;
                }
            }

            if (antiDiagonalXWin)
            {
                HighlightWinningCells(2, 4, 6);
                return true;
            }

            if (antiDiagonalOWin)
            {
                HighlightWinningCells(2, 4, 6);
                return true;
            }

            return false;
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
