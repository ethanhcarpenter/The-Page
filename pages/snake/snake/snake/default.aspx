<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="YourNamespace._Default" %>

<!DOCTYPE html>

<html>
<head runat="server">
    <title>Snake Game</title>
    <style>
        body{
            background-color=#333;
        }
        form{
            background-color=#333;
        }
        .centered-box {
            width: 90vw;
            height: 95vh;
            position: relative;
            top: 3vh;
            background-color: #333;
            border: 0px solid #000;
            margin: auto;
            padding: 0;
            text-align: center;
        }

        .tic-tac-toe {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(3, 1fr);
            width: 80vmin;
            height: 80vmin;
            margin: auto;
            border: none;
        }

        .cell {
            width: 100%;
            height: 100%;
            background-color:transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 5px solid #000;
            border-bottom: 5px solid #000;
            font-size: 15vb;
            font-family: cursive;
        }

        /*    .cell:nth-child(3n) {
                border-right: none;
            }

            .cell:nth-child(7),
            .cell:nth-child(8),
            .cell:nth-child(9) {
                border-bottom: none;
            }*/

        .reset {
            padding: 2%;
            font-size: xx-large;
            background-color: transparent;
            border: 0px;
        }

        .bottomFill {
            color: #333;
            font-size: xx-large;
            content: 23434234234;
            background-color: #333;
        }
    </style>
</head>
<body>
    <form runat="server">
        <div class="centered-box" id="centered-box">
            <div class="tic-tac-toe" id="board">
                <asp:Button runat="server" class="cell" ID="b1"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b2"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b3"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b4"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b5"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b6"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b7"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b8"></asp:Button>
                <asp:Button runat="server" class="cell" ID="b9"></asp:Button>
            </div>
            <asp:Button runat="server" class="reset"  ID="reset" Text="RESET"></asp:Button>

        </div>
    </form>

</body>
>
</body>
</html>
