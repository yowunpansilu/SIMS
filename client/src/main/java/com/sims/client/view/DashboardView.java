package com.sims.client.view;

import atlantafx.base.theme.Styles;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.material2.Material2AL;
import org.kordamp.ikonli.material2.Material2MZ;

public class DashboardView extends BorderPane {

    private final StackPane contentArea;

    public DashboardView() {
        super();
        this.contentArea = new StackPane();
        initUI();
    }

    private void initUI() {
        // Sidebar
        var sidebar = new VBox();
        sidebar.getStyleClass().add("sidebar");
        sidebar.setStyle("-fx-background-color: -color-bg-subtle; -fx-min-width: 250; -fx-padding: 0;");
        sidebar.setSpacing(10);

        // Sidebar Header
        var brandLabel = new Label("SIMS Admin");
        brandLabel.getStyleClass().addAll(Styles.TITLE_3);
        brandLabel.setPadding(new Insets(20, 20, 10, 20));

        // Nav Buttons
        var overviewBtn = createNavButton("Overview", Material2MZ.SPEED);
        var studentsBtn = createNavButton("Students", Material2MZ.PEOPLE_OUTLINE);
        studentsBtn.setOnAction(e -> contentArea.getChildren().setAll(new StudentView())); // Simple nav logic for now

        var attendanceBtn = createNavButton("Attendance", Material2AL.EVENT_NOTE);
        var resultsBtn = createNavButton("Exam Results", Material2AL.ASSESSMENT);
        var reportsBtn = createNavButton("Reports", Material2MZ.PRINT);

        sidebar.getChildren().addAll(brandLabel, overviewBtn, studentsBtn, attendanceBtn, resultsBtn, reportsBtn);

        // Settings/Logout at bottom
        var spacer = new VBox();
        javafx.scene.layout.VBox.setVgrow(spacer, javafx.scene.layout.Priority.ALWAYS);

        var logoutBtn = createNavButton("Sign Out", Material2AL.EXIT_TO_APP);
        logoutBtn.getStyleClass().add(Styles.DANGER);

        sidebar.getChildren().addAll(spacer, logoutBtn);
        sidebar.setPadding(new Insets(0, 0, 20, 0));

        // Content Area (Default View)
        contentArea.setPadding(new Insets(20));
        contentArea.getChildren().add(new Label("Welcome to dashboard"));
        contentArea.setAlignment(Pos.TOP_LEFT);

        this.setLeft(sidebar);
        this.setCenter(contentArea);
    }

    private Button createNavButton(String text, org.kordamp.ikonli.Ikon icon) {
        var btn = new Button(text);
        btn.setGraphic(new FontIcon(icon));
        btn.getStyleClass().addAll(Styles.FLAT, Styles.LEFT_PILL);
        btn.setMaxWidth(Double.MAX_VALUE);
        btn.setAlignment(Pos.CENTER_LEFT);
        btn.setPadding(new Insets(10, 20, 10, 20));
        return btn;
    }
}
