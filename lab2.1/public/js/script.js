document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-form");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const formsList = document.getElementById("forms-list");

    let editingId = null;

    const apiUrl = "http://localhost:3000/forms";

    // Load all forms from the server
    function loadForms() {
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                formsList.innerHTML = "";
                if (data.length === 0) {
                    formsList.innerHTML = '<div class="no-forms">No forms submitted or saved.</div>';
                    return;
                }

                data.forEach(form => {
                    const card = document.createElement("div");
                    card.className = `form-card${form.status === "saved" ? " saved" : ""}`;

                    if (form.status === "saved") {
                        const badge = document.createElement("div");
                        badge.className = "saved-badge";
                        badge.textContent = "Saved";
                        card.appendChild(badge);
                    }

                    const content = document.createElement("div");
                    content.className = "form-content";
                    for (const key in form.data) {
                        const label = document.createElement("div");
                        label.className = "form-label";
                        label.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ":";
                        const value = document.createElement("div");
                        value.textContent = form.data[key];
                        content.appendChild(label);
                        content.appendChild(value);
                    }

                    const actions = document.createElement("div");
                    actions.className = "form-actions";

                    const editBtn = document.createElement("button");
                    editBtn.className = "action-btn edit-btn";
                    editBtn.textContent = "Edit";
                    editBtn.onclick = () => editForm(form);

                    const deleteBtn = document.createElement("button");
                    deleteBtn.className = "action-btn delete-btn";
                    deleteBtn.textContent = "Delete";
                    deleteBtn.onclick = () => deleteForm(form.id);

                    actions.appendChild(editBtn);
                    actions.appendChild(deleteBtn);

                    card.appendChild(content);
                    card.appendChild(actions);
                    formsList.appendChild(card);
                });
            })
            .catch(error => {
                console.error("Error loading forms:", error);
                formsList.innerHTML = '<div class="no-forms">Error loading forms. Please try again.</div>';
            });
    }

    // Get form data from input fields
    function getFormData() {
        return {
            username: form.username.value,
            hobbies: form.hobbies.value,
            music: form.music.value,
            movies: form.movies.value,
            literature: form.literature.value
        };
    }

    // Save or update a form
    function saveForm(status) {
        if (!form.username.value.trim()) {
            alert("Username is required!");
            return;
        }

        const data = {
            data: getFormData(),
            status
        };

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${apiUrl}/${editingId}` : apiUrl;

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(() => {
                form.reset();
                editingId = null;
                cancelBtn.style.display = "none";
                loadForms();
            })
            .catch(error => {
                console.error("Error saving form:", error);
                alert("Failed to save form. Please try again.");
            });
    }

    // Delete a form
    function deleteForm(id) {
        if (confirm("Are you sure you want to delete this form?")) {
            fetch(`${apiUrl}/${id}`, { method: "DELETE" })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(() => loadForms())
                .catch(error => {
                    console.error("Error deleting form:", error);
                    alert("Failed to delete form. Please try again.");
                });
        }
    }

    // Edit a form
    function editForm(formObj) {
        const { data, id } = formObj;
        form.username.value = data.username || "";
        form.hobbies.value = data.hobbies || "";
        form.music.value = data.music || "";
        form.movies.value = data.movies || "";
        form.literature.value = data.literature || "";

        editingId = id;
        cancelBtn.style.display = "inline-block";
    }

    // Event handlers
    saveBtn.onclick = () => saveForm("saved");
    
    form.onsubmit = e => {
        e.preventDefault();
        saveForm("submitted");
    };
    
    cancelBtn.onclick = () => {
        editingId = null;
        form.reset();
        cancelBtn.style.display = "none";
    };

    // Load forms when page loads
    loadForms();
});