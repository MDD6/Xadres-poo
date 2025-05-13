package com.chess;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.GridPane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;
import javafx.stage.Stage;
import javafx.scene.image.ImageView;
import javafx.scene.image.Image;
import java.io.FileInputStream;

public class Main extends Application {

    private static final int TILE_SIZE = 80;
    private static final int BOARD_SIZE = 8;

    private final String[][] initialSetup = {
        {"black_rook", "black_knight", "black_bishop", "black_queen", "black_king", "black_bishop", "black_knight", "black_rook"},
        {"black_pawn", "black_pawn", "black_pawn", "black_pawn", "black_pawn", "black_pawn", "black_pawn", "black_pawn"},
        {null, null, null, null, null, null, null, null},
        {null, null, null, null, null, null, null, null},
        {null, null, null, null, null, null, null, null},
        {null, null, null, null, null, null, null, null},
        {"white_pawn", "white_pawn", "white_pawn", "white_pawn", "white_pawn", "white_pawn", "white_pawn", "white_pawn"},
        {"white_rook", "white_knight", "white_bishop", "white_queen", "white_king", "white_bishop", "white_knight", "white_rook"}
    };

    @Override
    public void start(Stage primaryStage) {
        GridPane grid = new GridPane();

        for (int row = 0; row < BOARD_SIZE; row++) {
            for (int col = 0; col < BOARD_SIZE; col++) {
                Rectangle square = new Rectangle(TILE_SIZE, TILE_SIZE);
                boolean light = (row + col) % 2 == 0;
                square.setFill(light ? Color.BEIGE : Color.BROWN);

                grid.add(square, col, row);

                String piece = initialSetup[row][col];
                if (piece != null) {
                    try {
                        String path = "resources/assets/images/svg/" + piece + ".png"; // pode converter os SVGs em PNG para exibir facilmente
                        Image image = new Image(new FileInputStream(path), TILE_SIZE - 10, TILE_SIZE - 10, true, true);
                        ImageView imageView = new ImageView(image);
                        grid.add(imageView, col, row);
                    } catch (Exception e) {
                        System.out.println("Erro ao carregar imagem: " + piece);
                    }
                }
            }
        }

        Scene scene = new Scene(grid, TILE_SIZE * BOARD_SIZE, TILE_SIZE * BOARD_SIZE);
        primaryStage.setTitle("Xadrez JavaFX");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
// src/main/resources/assets/images/svg/black_rook.png
// src/main/resources/assets/images/svg/black_knight.png
// src/main/resources/assets/images/svg/black_bishop.png
// src/main/resources/assets/images/svg/black_queen.png
// src/main/resources/assets/images/svg/black_king.png



// src/main/resources/assets/images/svg/black_pawn.png
// src/main/resources/assets/images/svg/white_rook.png
// src/main/resources/assets/images/svg/white_knight.png
// src/main/resources/assets/images/svg/white_bishop.png
// src/main/resources/assets/images/svg/white_queen.png

// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
// src/main/resources/assets/images/svg/white_pawn.png
// src/main/resources/assets/images/svg/white_king.png
