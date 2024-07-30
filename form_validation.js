// Function to calculate BMI
function calculateBMI(weight, height) {
    // Convert height from cm to meters
    var heightMeters = height / 100;
    // Calculate BMI
    return weight / (heightMeters * heightMeters);
}

// Function to validate age for blood donation eligibility (must be 18+)
function validateAge(age) {
    return age >= 18;
}

// Function to validate weight for blood donation eligibility (must be >= 50 kg)
function validateWeight(weight) {
    return weight >= 50;
}

// Function to validate height for blood donation eligibility (must be >= 150 cm)
function validateHeight(height) {
    return height >= 150;
}

// Function to validate blood donation eligibility
function validateBloodDonationEligibility(age, weight, height) {
    // Calculate BMI
    var bmi = calculateBMI(weight, height);
    // Validate age, weight, and height for blood donation eligibility
    if (!validateAge(age)) {
        return "You are underage for blood donation.";
    } else if (!validateWeight(weight)) {
        return "Your weight is below the required limit for blood donation.";
    } else if (!validateHeight(height)) {
        return "Your height is below the required limit for blood donation.";
    } else if (bmi < 18.5) {
        return "Your BMI is below the healthy range for blood donation.";
    } else if (bmi > 30) {
        return "Your BMI is above the healthy range for blood donation.";
    } else {
        return "You are eligible to donate blood.";
    }
}

// Function to validate name
function validateName(name) {
    var minLength = 4;
    var maxLength = 20;
    return name.length >= minLength && name.length <= maxLength;
}

// Function to validate mobile number
function validateMobile(mobile) {
    // Remove non-numeric characters
    var numericMobile = mobile.replace(/\D/g, '');
    return numericMobile.length === 10;
}

// Function to validate email
function validateEmail(email) {
    // Regular expression to match email format
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate blood group
function validateBloodGroup(bloodGroup) {
    var validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    return validBloodGroups.includes(bloodGroup.toUpperCase());
}

// Function to validate the form
function validateForm() {
    var name = document.getElementById("name").value;
    var mobile = document.getElementById("mobile").value;
    var email = document.getElementById("email").value;
    var bloodGroup = document.getElementById("blood-group").value;
    var age = parseInt(document.getElementById("age").value);
    var weight = parseInt(document.getElementById("weight").value);
    var height = parseInt(document.getElementById("height").value);

    if (!validateName(name)) {
        alert("Name must be between 4 and 20 characters long.");
        return false;
    }

    if (!validateMobile(mobile)) {
        alert("Mobile number must be 10 digits long.");
        return false;
    }

    if (!validateEmail(email)) {
        alert("Invalid email format.");
        return false;
    }

    if (!validateBloodGroup(bloodGroup)) {
        alert("Invalid blood group.");
        return false;
    }

    if (!validateAge(age)) {
        alert("You are underage for blood donation.");
        return false;
    }

    if (!validateWeight(weight)) {
        alert("Your weight is below the required limit for blood donation.");
        return false;
    }

    if (!validateHeight(height)) {
        alert("Your height is below the required limit for blood donation.");
        return false;
    }

    // If all validations pass, return true to submit the form
    return true;
}

// Add event listener to the form submit event
document.getElementById("myForm").addEventListener("submit", function(event) {
    // Prevent the default form submission
    event.preventDefault();
    // Validate the form
    if (validateForm()) {
        // If validation passes, submit the form
        this.submit();
    }
});
