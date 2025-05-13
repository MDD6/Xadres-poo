package com.chess;

public class Pawn extends Piece {

    public Pawn(int row, int col, Color color) {
        super(row, col, color, "pawn");
    }

    @Override
    public boolean isValidMove(int targetRow, int targetCol, Piece[][] board) {
        int direction = (color == Color.WHITE) ? -1 : 1;
        int startRow = (color == Color.WHITE) ? 6 : 1;

        if (col == targetCol && board[targetRow][targetCol] == null) {
            if (row + direction == targetRow) {
                return true;
            }
            if (row == startRow && row + 2 * direction == targetRow && board[row + direction][col] == null) {
                return true;
            }
        }

        // Captura na diagonal
        if (Math.abs(col - targetCol) == 1 && row + direction == targetRow) {
            if (board[targetRow][targetCol] != null && board[targetRow][targetCol].getColor() != this.color) {
                return true;
            }
        }

        return false;
    }
}
