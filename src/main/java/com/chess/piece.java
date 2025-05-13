// Arquivo: Piece.java
// Commit: @matheusddresch

package com.chess;

public abstract class Piece {

    public enum Color {
        WHITE, BLACK
    }

    protected int row;
    protected int col;
    protected Color color;
    protected String name;

    public Piece(int row, int col, Color color, String name) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.name = name;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    public Color getColor() {
        return color;
    }

    public String getName() {
        return name;
    }

    public void setPosition(int row, int col) {
        this.row = row;
        this.col = col;
    }

    // Cada peça tem sua lógica de movimento
    public abstract boolean isValidMove(int targetRow, int targetCol, Piece[][] board);
}