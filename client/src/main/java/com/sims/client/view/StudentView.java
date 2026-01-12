package com.sims.client.view;

import atlantafx.base.theme.Styles;
import com.sims.client.model.StudentDTO;
import com.sims.client.service.ApiClient;
import javafx.application.Platform;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.*;
import org.kordamp.ikonli.javafx.FontIcon;
import org.kordamp.ikonli.material2.Material2AL;
import org.kordamp.ikonli.material2.Material2MZ;

import java.time.LocalDate;
import java.util.Optional;

public class StudentView extends VBox {

    private final ApiClient apiClient;
    private TableView<StudentDTO> studentTable;

    public StudentView() {
        this.apiClient = new ApiClient();
        initUI();
        loadData();
    }

    private void initUI() {
        this.setPadding(new Insets(20));
        this.setSpacing(20);
        this.setFillWidth(true);

        // --- Header Section ---
        var headerBox = new HBox();
        headerBox.setAlignment(Pos.CENTER_LEFT);
        headerBox.setSpacing(15);

        var title = new Label("Student Management");
        title.getStyleClass().addAll(Styles.TITLE_2);

        var spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Column Visibility Toggle
        var viewSettingsBtn = new MenuButton("Columns");
        viewSettingsBtn.setGraphic(new FontIcon(Material2MZ.VIEW_COLUMN));

        var refreshBtn = new Button("Refresh");
        refreshBtn.setGraphic(new FontIcon(Material2AL.AUTORENEW));
        refreshBtn.setOnAction(e -> loadData());

        var addBtn = new Button("Add Student");
        addBtn.getStyleClass().addAll(Styles.ACCENT);
        addBtn.setGraphic(new FontIcon(Material2AL.ADD));
        addBtn.setOnAction(e -> openStudentDialog(null));

        headerBox.getChildren().addAll(title, spacer, viewSettingsBtn, refreshBtn, addBtn);

        // --- Table Section ---
        studentTable = new TableView<>();
        studentTable.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        VBox.setVgrow(studentTable, Priority.ALWAYS);

        var colAdm = createColumn("Admission No", "admissionNumber");
        var colName = createColumn("Full Name", "fullName");
        var colGender = createColumn("Gender", "gender");
        var colDOB = createColumn("Date of Birth", "dateOfBirth");
        var colAddress = createColumn("Address", "address");
        var colContact = createColumn("Contact", "contactNumber");
        var colGrade = createColumn("Grade", "grade");
        var colStream = createColumn("Stream", "stream");

        // Action Column
        var colAction = new TableColumn<StudentDTO, Void>("Actions");
        colAction.setSortable(false);
        colAction.setPrefWidth(120);
        colAction.setCellFactory(param -> new TableCell<>() {
            private final Button editBtn = new Button("", new FontIcon(Material2AL.EDIT));
            private final Button deleteBtn = new Button("", new FontIcon(Material2AL.DELETE));
            private final HBox pane = new HBox(10, editBtn, deleteBtn);

            {
                editBtn.getStyleClass().add(Styles.BUTTON_ICON);
                editBtn.setOnAction(event -> openStudentDialog(getTableView().getItems().get(getIndex())));

                deleteBtn.getStyleClass().addAll(Styles.BUTTON_ICON, Styles.DANGER);
                deleteBtn.setOnAction(event -> deleteStudent(getTableView().getItems().get(getIndex())));

                pane.setAlignment(Pos.CENTER);
            }

            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) {
                    setGraphic(null);
                } else {
                    setGraphic(pane);
                }
            }
        });

        studentTable.getColumns().addAll(colAdm, colName, colGender, colDOB, colAddress, colContact, colGrade,
                colStream, colAction);

        // Populate Column Visibility Menu
        for (TableColumn<StudentDTO, ?> col : studentTable.getColumns()) {
            if (col == colAction)
                continue;

            var checkItem = new CheckMenuItem(col.getText());

            // Default visibility logic
            if (col == colAddress || col == colDOB) {
                checkItem.setSelected(false);
            } else {
                checkItem.setSelected(true);
            }

            // Bind column visibility to the menu item's selected property
            col.visibleProperty().bind(checkItem.selectedProperty());

            viewSettingsBtn.getItems().add(checkItem);
        }

        this.getChildren().addAll(headerBox, studentTable);
    }

    private <T> TableColumn<StudentDTO, T> createColumn(String title, String property) {
        var col = new TableColumn<StudentDTO, T>(title);
        col.setCellValueFactory(new PropertyValueFactory<>(property));
        return col;
    }

    private void loadData() {
        studentTable.setPlaceholder(new Label("Loading data..."));
        apiClient.getStudents().thenAccept(students -> Platform.runLater(() -> {
            studentTable.getItems().setAll(students);
            if (students.isEmpty())
                studentTable.setPlaceholder(new Label("No students found."));
        }));
    }

    private void deleteStudent(StudentDTO student) {
        var alert = new Alert(Alert.AlertType.CONFIRMATION,
                "Are you sure you want to delete " + student.getFullName() + "?");
        alert.initOwner(getScene().getWindow());
        alert.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                apiClient.deleteStudent(student.getId()).thenAccept(success -> Platform.runLater(() -> {
                    if (success) {
                        loadData();
                    } else {
                        new Alert(Alert.AlertType.ERROR, "Failed to delete student.").show();
                    }
                }));
            }
        });
    }

    private void openStudentDialog(StudentDTO existingStudent) {
        boolean isEdit = existingStudent != null;
        var dialog = new Dialog<StudentDTO>();
        dialog.setTitle(isEdit ? "Edit Student" : "Add Student");
        dialog.setHeaderText(
                isEdit ? "Update details for " + existingStudent.getFullName() : "Enter new student details");

        var saveBtnType = new ButtonType("Save", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(saveBtnType, ButtonType.CANCEL);

        // Form Fields
        var grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20, 50, 10, 10));

        var admField = new TextField();
        var nameField = new TextField();
        var dobPicker = new DatePicker();
        var genderBox = new ComboBox<>(FXCollections.observableArrayList("Male", "Female", "Other"));
        var addressArea = new TextArea();
        addressArea.setPrefRowCount(3);
        var contactField = new TextField();
        var gradeField = new TextField(); // Could be ComboBox
        var streamBox = new ComboBox<>(
                FXCollections.observableArrayList("Science", "Arts", "Commerce", "Technology", "Other"));

        // Pre-fill if editing
        if (isEdit) {
            admField.setText(existingStudent.getAdmissionNumber());
            nameField.setText(existingStudent.getFullName());
            dobPicker.setValue(existingStudent.getDateOfBirth());
            genderBox.setValue(existingStudent.getGender());
            addressArea.setText(existingStudent.getAddress());
            contactField.setText(existingStudent.getContactNumber());
            gradeField.setText(existingStudent.getGrade());
            streamBox.setValue(existingStudent.getStream());
        }

        grid.add(new Label("Admission No:*"), 0, 0);
        grid.add(admField, 1, 0);
        grid.add(new Label("Full Name:*"), 0, 1);
        grid.add(nameField, 1, 1);
        grid.add(new Label("Date of Birth:"), 0, 2);
        grid.add(dobPicker, 1, 2);
        grid.add(new Label("Gender:"), 0, 3);
        grid.add(genderBox, 1, 3);
        grid.add(new Label("Address:"), 0, 4);
        grid.add(addressArea, 1, 4);
        grid.add(new Label("Contact No:"), 0, 5);
        grid.add(contactField, 1, 5);
        grid.add(new Label("Grade:"), 0, 6);
        grid.add(gradeField, 1, 6);
        grid.add(new Label("Stream:"), 0, 7);
        grid.add(streamBox, 1, 7);

        dialog.getDialogPane().setContent(grid);

        // Validation
        var saveBtn = dialog.getDialogPane().lookupButton(saveBtnType);
        saveBtn.addEventFilter(javafx.event.ActionEvent.ACTION, event -> {
            // Check required fields
            if (admField.getText().isEmpty() || nameField.getText().isEmpty()) {
                new Alert(Alert.AlertType.WARNING, "Admission Number and Name are required.").show();
                event.consume(); // Prevent dialog close
            }
        });

        dialog.setResultConverter(btn -> {
            if (btn == saveBtnType) {
                var s = isEdit ? existingStudent : new StudentDTO();
                s.setAdmissionNumber(admField.getText());
                s.setFullName(nameField.getText());
                s.setDateOfBirth(dobPicker.getValue());
                s.setGender(genderBox.getValue());
                s.setAddress(addressArea.getText());
                s.setContactNumber(contactField.getText());
                s.setGrade(gradeField.getText());
                s.setStream(streamBox.getValue());
                return s;
            }
            return null;
        });

        // Async Save
        dialog.showAndWait().ifPresent(student -> {
            if (isEdit) {
                apiClient.updateStudent(student.getId(), student).thenAccept(success -> Platform.runLater(() -> {
                    if (success)
                        loadData();
                    else
                        showError("Update failed.");
                }));
            } else {
                apiClient.addStudent(student).thenAccept(success -> Platform.runLater(() -> {
                    if (success)
                        loadData();
                    else
                        showError("Add failed.");
                }));
            }
        });
    }

    private void showError(String msg) {
        new Alert(Alert.AlertType.ERROR, msg).show();
    }
}
