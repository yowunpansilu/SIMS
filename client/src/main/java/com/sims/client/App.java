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

        // Initial View: Login
        // We pass a lambda that switches the root to DashboardView upon success
        var loginView = new LoginView(() -> {
            stage.getScene().setRoot(new com.sims.client.view.DashboardView());
            stage.sizeToScene(); // Optional readjust
            stage.centerOnScreen();
        });

        var root = new StackPane(loginView);
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
