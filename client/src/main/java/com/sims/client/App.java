package com.sims.client;

import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.scene.control.Label;
import atlantafx.base.theme.PrimerDark;

public class App extends Application {

    @Override
    public void start(Stage stage) {
        Application.setUserAgentStylesheet(new PrimerDark().getUserAgentStylesheet());

        var root = new StackPane(new Label("SIMS Client - Running"));
        var scene = new Scene(root, 800, 600);

        stage.setTitle("SIMS - Student Information Management System");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
