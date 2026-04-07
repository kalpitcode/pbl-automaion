const isValidCollegeEmail = (email) => {
    const lowerEmail = email.toLowerCase();
    return lowerEmail.endsWith('.edu') || lowerEmail.endsWith('.edu.in') || lowerEmail.endsWith('.ac.in');
};

const isStrongPassword = (password) => {
    // Minimum 8 characters
    const minLength = password.length >= 8;
    // At least one number
    const hasNum = /[0-9]/.test(password);
    // At least one special character
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    return minLength && hasNum && hasSpecial;
};

module.exports = {
    isValidCollegeEmail,
    isStrongPassword,
};
