package com.sims.client;

import com.sims.client.view.LoginView;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import atlantafx.base.theme.PrimerDark;

public class App extends Application {

    @Override
    public void start(Stage stage) {
        Application.setUserAgentStylesheet(new PrimerDark().getUserAgentStylesheet());

        var root = new StackPane(new LoginView());
        var scene = new Scene(root, 900, 600);

        stage.setTitle("SIMS - Student Information Management System");
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
