// Form management system
document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const profileForm = document.getElementById("profile-form");
    const formsList = document.getElementById("forms-list");
    const saveBtn = document.getElementById("save-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    
    // Storage keys
    const SAVED_FORMS_KEY = "savedProfileForms";
    const SUBMITTED_FORMS_KEY = "submittedProfileForms";
    let currentEditId = null;
    
    // Initialize data if not exists
    if (!localStorage.getItem(SAVED_FORMS_KEY)) {
        localStorage.setItem(SAVED_FORMS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(SUBMITTED_FORMS_KEY)) {
        localStorage.setItem(SUBMITTED_FORMS_KEY, JSON.stringify([]));
    }
    
    // Load and display existing forms
    refreshFormsList();
    
    // Event Listeners
    saveBtn.addEventListener("click", handleSaveForm);
    profileForm.addEventListener("submit", handleSubmitForm);
    cancelBtn.addEventListener("click", handleCancelEdit);
    
    // Form handling functions
    function handleSaveForm() {
        const formData = getFormData();
        
        // Validate form
        if (!formData.username) {
            alert("Username is required");
            return;
        }
        
        if (currentEditId) {
            // Update existing saved form
            updateSavedForm(currentEditId, formData);
        } else {
            // Add new saved form
            saveNewForm(formData);
        }
        
        resetForm();
        refreshFormsList();
    }
    
    function handleSubmitForm(e) {
        e.preventDefault();
        const formData = getFormData();
        
        // Validate form
        if (!formData.username) {
            alert("Username is required");
            return;
        }
        
        if (currentEditId) {
            // Delete the saved form and add as submitted
            removeSavedForm(currentEditId);
            submitNewForm(formData);
            // Need to hide the Cancel Edit button
            cancelBtn.style.display = "none";
        } else {
            // Add new submitted form
            submitNewForm(formData);
        }
        
        resetForm();
        refreshFormsList();
    }
    
    function handleCancelEdit() {
        resetForm();
        currentEditId = null;
        cancelBtn.style.display = "none";
    }
    
    // Helper functions
    function getFormData() {
        const data = {
            id: Date.now().toString(), // Generate unique ID
            timestamp: new Date().toLocaleString(),
            username: profileForm.username.value.trim(),
            hobbies: profileForm.hobbies.value.trim(),
            music: profileForm.music.value.trim(),
            movies: profileForm.movies.value.trim(),
            literature: profileForm.literature.value.trim()
        };
        return data;
    }
    
    function saveNewForm(formData) {
        const savedForms = JSON.parse(localStorage.getItem(SAVED_FORMS_KEY));
        savedForms.push(formData);
        localStorage.setItem(SAVED_FORMS_KEY, JSON.stringify(savedForms));
        alert("Form saved for later!");
    }
    
    function updateSavedForm(id, formData) {
        let savedForms = JSON.parse(localStorage.getItem(SAVED_FORMS_KEY));
        savedForms = savedForms.map(form => form.id === id ? {...formData, id} : form);
        localStorage.setItem(SAVED_FORMS_KEY, JSON.stringify(savedForms));
        alert("Saved form updated!");
        currentEditId = null;
        cancelBtn.style.display = "none";
    }
    
    function submitNewForm(formData) {
        const submittedForms = JSON.parse(localStorage.getItem(SUBMITTED_FORMS_KEY));
        submittedForms.push(formData);
        localStorage.setItem(SUBMITTED_FORMS_KEY, JSON.stringify(submittedForms));
        alert("Form submitted successfully!");
    }
    
    function removeSavedForm(id) {
        let savedForms = JSON.parse(localStorage.getItem(SAVED_FORMS_KEY));
        savedForms = savedForms.filter(form => form.id !== id);
        localStorage.setItem(SAVED_FORMS_KEY, JSON.stringify(savedForms));
    }
    
    function removeSubmittedForm(id) {
        let submittedForms = JSON.parse(localStorage.getItem(SUBMITTED_FORMS_KEY));
        submittedForms = submittedForms.filter(form => form.id !== id);
        localStorage.setItem(SUBMITTED_FORMS_KEY, JSON.stringify(submittedForms));
    }
    
    function loadFormForEdit(id) {
        const savedForms = JSON.parse(localStorage.getItem(SAVED_FORMS_KEY));
        const formToEdit = savedForms.find(form => form.id === id);
        
        if (formToEdit) {
            // Populate form fields
            profileForm.username.value = formToEdit.username || "";
            profileForm.hobbies.value = formToEdit.hobbies || "";
            profileForm.music.value = formToEdit.music || "";
            profileForm.movies.value = formToEdit.movies || "";
            profileForm.literature.value = formToEdit.literature || "";
            
            // Set edit mode
            currentEditId = id;
            cancelBtn.style.display = "inline";
            
            // Scroll to form
            profileForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function resetForm() {
        profileForm.reset();
        currentEditId = null;
        // Make sure the cancel button is hidden when resetting
        cancelBtn.style.display = "none";
    }
    
    function refreshFormsList() {
        const savedForms = JSON.parse(localStorage.getItem(SAVED_FORMS_KEY));
        const submittedForms = JSON.parse(localStorage.getItem(SUBMITTED_FORMS_KEY));
        
        // Clear the list
        formsList.innerHTML = "";
        
        if (savedForms.length === 0 && submittedForms.length === 0) {
            formsList.innerHTML = '<div class="no-forms">No forms have been submitted or saved yet.</div>';
            return;
        }
        
        // Add saved forms
        savedForms.forEach(form => {
            const formCard = createFormCard(form, true);
            formsList.appendChild(formCard);
        });
        
        // Add submitted forms
        submittedForms.forEach(form => {
            const formCard = createFormCard(form, false);
            formsList.appendChild(formCard);
        });
    }
    
    function createFormCard(form, isSaved) {
        const formCard = document.createElement("div");
        formCard.classList.add("form-card");
        if (isSaved) {
            formCard.classList.add("saved");
        }
        
        // Create form content
        let cardContent = `
            ${isSaved ? '<span class="saved-badge">Saved</span>' : ''}
            <div class="form-content">
                <span class="form-label">Username:</span>
                <span>${form.username}</span>
                
                <span class="form-label">Hobbies:</span>
                <span>${form.hobbies || 'N/A'}</span>
                
                <span class="form-label">Music:</span>
                <span>${form.music || 'N/A'}</span>
                
                <span class="form-label">Movies:</span>
                <span>${form.movies || 'N/A'}</span>
                
                <span class="form-label">Literature:</span>
                <span>${form.literature || 'N/A'}</span>
                
                <span class="form-label">Created:</span>
                <span>${form.timestamp}</span>
            </div>
            <div class="form-actions">
                ${isSaved ? 
                    `<button class="action-btn edit-btn" data-id="${form.id}">Edit</button>` : 
                    `<button class="action-btn view-btn" data-id="${form.id}">View</button>`
                }
                <button class="action-btn delete-btn" data-id="${form.id}" data-type="${isSaved ? 'saved' : 'submitted'}">Delete</button>
            </div>
        `;
        
        formCard.innerHTML = cardContent;
        
        // Add event listeners to buttons
        if (isSaved) {
            formCard.querySelector(".edit-btn").addEventListener("click", function() {
                loadFormForEdit(form.id);
            });
        } else {
            formCard.querySelector(".view-btn").addEventListener("click", function() {
                alert(`Form Details:\n\nUsername: ${form.username}\nHobbies: ${form.hobbies || 'N/A'}\nMusic: ${form.music || 'N/A'}\nMovies: ${form.movies || 'N/A'}\nLiterature: ${form.literature || 'N/A'}\nSubmitted: ${form.timestamp}`);
            });
        }
        
        formCard.querySelector(".delete-btn").addEventListener("click", function() {
            const type = this.getAttribute("data-type");
            const id = this.getAttribute("data-id");
            
            if (confirm(`Are you sure you want to delete this ${type} form?`)) {
                if (type === "saved") {
                    removeSavedForm(id);
                } else {
                    removeSubmittedForm(id);
                }
                refreshFormsList();
            }
        });
        
        return formCard;
    }
});