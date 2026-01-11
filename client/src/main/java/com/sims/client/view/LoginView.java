package com.sims.client.view;

import atlantafx.base.theme.Styles;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

public class LoginView extends VBox {

    public LoginView() {
        super();
        initUI();
    }

    private void initUI() {
        this.setAlignment(Pos.CENTER);
        this.setSpacing(20);
        this.setFillWidth(false); // Do not stretch children to full width

        // Container (Card)
        var card = new VBox();
        card.getStyleClass().add(Styles.ELEVATED_2); // Elevation shadow
        card.getStyleClass().add("card"); // Custom class if needed, or rely on padding
        card.setStyle(
                "-fx-background-color: -color-bg-default; -fx-padding: 40; -fx-background-radius: 10; -fx-min-width: 350;");
        card.setSpacing(15);
        card.setAlignment(Pos.CENTER_LEFT);

        // Header
        var title = new Text("SIMS");
        title.getStyleClass().addAll(Styles.TITLE_1);

        var subtitle = new Text("Sign in to your account");
        subtitle.getStyleClass().addAll(Styles.TEXT_MUTED);

        var headerBox = new VBox(title, subtitle);
        headerBox.setAlignment(Pos.CENTER);
        headerBox.setSpacing(5);
        headerBox.setStyle("-fx-padding: 0 0 20 0;"); // Bottom padding

        // Form Fields
        var usernameLbl = new Label("Username");
        var usernameField = new TextField();
        usernameField.setPromptText("Enter your username");

        var passwordLbl = new Label("Password");
        var passwordField = new PasswordField();
        passwordField.setPromptText("Enter your password");

        // Action Buttons
        var signInBtn = new Button("Sign In");
        signInBtn.setDefaultButton(true);
        signInBtn.setMaxWidth(Double.MAX_VALUE); // Fill width
        signInBtn.getStyleClass().add(Styles.ACCENT); // Primary color

        signInBtn.setOnAction(e -> {
            System.out.println("Sign In Clicked: " + usernameField.getText());
        });

        var forgotPasswordLink = new Hyperlink("Forgot password?");
        var footerBox = new VBox(signInBtn, forgotPasswordLink);
        footerBox.setAlignment(Pos.CENTER);
        footerBox.setSpacing(10);
        footerBox.setStyle("-fx-padding: 20 0 0 0;"); // Top padding

        // Assemble Card
        card.getChildren().addAll(
                headerBox,
                usernameLbl, usernameField,
                passwordLbl, passwordField,
                footerBox);

        this.getChildren().add(card);
    }
}
