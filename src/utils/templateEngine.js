export const renderTemplate = (htmlTemplate, contextData) => {
    if (!htmlTemplate) return '';

    let renderedHTML = htmlTemplate;

    // Define standard fallback values to prevent 'undefined' appearing in the text
    const context = {
        student_name: contextData.student_name || contextData.applicant_name || 'Student Name',
        guardian_name: contextData.guardian_name || 'Parent/Guardian',
        admission_number: contextData.admission_number || (contextData.id ? `APP-${contextData.id}` : 'TBA'),
        class_name: contextData.class_name || contextData.applying_for_grade_name || 'Class',
        intake_name: contextData.intake_name || 'Intake',
        guardian_phone: contextData.guardian_phone || '',
        guardian_email: contextData.guardian_email || '',
        date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
        ...contextData
    };

    // Replace placeholders like {{student_name}}
    const regex = /\{\{\s*([\w]+)\s*\}\}/g;
    
    renderedHTML = renderedHTML.replace(regex, (match, key) => {
        return context[key] !== undefined ? context[key] : match;
    });

    return renderedHTML;
};
