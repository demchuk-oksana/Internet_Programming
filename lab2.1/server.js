const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FOLDER = path.join(__dirname, 'data');
const JSON_FILE = path.join(DATA_FOLDER, 'forms.json');
const XML_FILE = path.join(DATA_FOLDER, 'forms.xml');

// Ensure data folder exists
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER, { recursive: true });
    console.log('✅ Created data/ directory');
}

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(JSON_FILE)) {
    fs.writeFileSync(JSON_FILE, JSON.stringify([], null, 2));
    console.log('✅ Created forms.json file');
}

// Initialize XML file if it doesn't exist
if (!fs.existsSync(XML_FILE)) {
    const initialXml = '<?xml version="1.0" encoding="UTF-8"?><forms></forms>';
    fs.writeFileSync(XML_FILE, initialXml);
    console.log('✅ Created forms.xml file');
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for JSON data handling
const loadFormsJson = () => {
    try {
        const data = fs.readFileSync(JSON_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading JSON data:', error);
        return [];
    }
};

const saveFormsJson = (forms) => {
    try {
        fs.writeFileSync(JSON_FILE, JSON.stringify(forms, null, 2));
    } catch (error) {
        console.error('Error saving JSON data:', error);
    }
};

// Helper functions for XML data handling
// Simple XML parsing and generation without using external libraries
const loadFormsXml = () => {
    try {
        const xmlData = fs.readFileSync(XML_FILE, 'utf8');
        
        // Very simple XML parser for our specific format
        const forms = [];
        const formMatches = xmlData.match(/<form id="([^"]+)" status="([^"]+)">([\s\S]*?)<\/form>/g) || [];
        
        formMatches.forEach(formMatch => {
            const idMatch = formMatch.match(/id="([^"]+)"/);
            const statusMatch = formMatch.match(/status="([^"]+)"/);
            
            if (idMatch && statusMatch) {
                const id = idMatch[1];
                const status = statusMatch[1];
                const data = {};
                
                // Extract data fields
                const dataFields = ['username', 'hobbies', 'music', 'movies', 'literature'];
                dataFields.forEach(field => {
                    const fieldMatch = formMatch.match(new RegExp(`<${field}>([\\s\\S]*?)<\\/${field}>`));
                    if (fieldMatch) {
                        data[field] = fieldMatch[1];
                    }
                });
                
                forms.push({ id, status, data });
            }
        });
        
        return forms;
    } catch (error) {
        console.error('Error loading XML data:', error);
        return [];
    }
};

const saveFormsXml = (forms) => {
    try {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<forms>\n';
        
        forms.forEach(form => {
            xmlContent += `  <form id="${form.id}" status="${form.status}">\n`;
            xmlContent += '    <data>\n';
            
            // Add form data fields
            for (const key in form.data) {
                xmlContent += `      <${key}>${form.data[key]}</${key}>\n`;
            }
            
            xmlContent += '    </data>\n';
            xmlContent += '  </form>\n';
        });
        
        xmlContent += '</forms>';
        fs.writeFileSync(XML_FILE, xmlContent);
    } catch (error) {
        console.error('Error saving XML data:', error);
    }
};

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Routes
// GET all forms
app.get('/forms', (req, res) => {
    try {
        const jsonForms = loadFormsJson();
        res.json(jsonForms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load forms' });
    }
});

// POST - Create new form
app.post('/forms', (req, res) => {
    try {
        const form = req.body;
        form.id = generateId();
        
        // Save to JSON
        const jsonForms = loadFormsJson();
        jsonForms.push(form);
        saveFormsJson(jsonForms);
        
        // Save to XML
        const xmlForms = loadFormsXml();
        xmlForms.push(form);
        saveFormsXml(xmlForms);
        
        res.status(201).json({ message: 'Form created successfully', id: form.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// PUT - Update form
app.put('/forms/:id', (req, res) => {
    try {
        const { id } = req.params;
        const updatedForm = req.body;
        updatedForm.id = id; // Ensure ID remains the same
        
        // Update JSON
        let jsonForms = loadFormsJson();
        jsonForms = jsonForms.map(form => form.id === id ? updatedForm : form);
        saveFormsJson(jsonForms);
        
        // Update XML
        let xmlForms = loadFormsXml();
        xmlForms = xmlForms.map(form => form.id === id ? updatedForm : form);
        saveFormsXml(xmlForms);
        
        res.json({ message: 'Form updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update form' });
    }
});

// DELETE - Remove form
app.delete('/forms/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete from JSON
        let jsonForms = loadFormsJson();
        jsonForms = jsonForms.filter(form => form.id !== id);
        saveFormsJson(jsonForms);
        
        // Delete from XML
        let xmlForms = loadFormsXml();
        xmlForms = xmlForms.filter(form => form.id !== id);
        saveFormsXml(xmlForms);
        
        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`REST API available at http://localhost:${PORT}/forms`);
});