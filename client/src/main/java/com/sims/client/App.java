package com.sims.client;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import java.net.URL;

public class App extends Application {

    private static final String DEV_URL = "http://127.0.0.1:5173";
    private static final String FRONTEND_RESOURCE = "/web/index.html";

    @Override
    public void start(Stage stage) {
        WebView webView = new WebView();
        webView.getEngine().setJavaScriptEnabled(true);

        URL resourceUrl = App.class.getResource(FRONTEND_RESOURCE);
        if (resourceUrl != null) {
            String url = resourceUrl.toExternalForm();
            System.out.println("Loading frontend from classpath: " + url);
            webView.getEngine().load(url);
        } else {
            System.out.println("Classpath frontend not found. Falling back to dev server: " + DEV_URL);
            webView.getEngine().load(DEV_URL);
        }

        // Handle errors or loading state
        webView.getEngine().getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == javafx.concurrent.Worker.State.FAILED) {
                System.err.println("Failed to load frontend.");
            } else if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                System.out.println("Frontend loaded successfully.");
                // Inject bridge for console logging if needed, or just rely on stdout
            }
        });

        var root = new StackPane(webView);
        var scene = new Scene(root, 1280, 800);

        stage.setTitle("SIMS - Student Information Management System");
        stage.setScene(scene);
        stage.centerOnScreen();
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
